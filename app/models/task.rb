class Task < ActiveRecord::Base
  REDIS_URL = Rails.env == 'development' ? 'redis://localhost:6379' : ENV['REDIS_URL']

  belongs_to :parent, class_name: 'Task'
  belongs_to :user

  has_many :subtasks, lambda {
    order(:position)
  }, class_name: 'Task', foreign_key: :parent_id, primary_key: :id, dependent: :destroy

  has_one(
    :duplicate,
    class_name: 'Task',
    foreign_key: :duplicate_id,
    primary_key: :id
  )

  belongs_to(
    :master,
    class_name: 'Task',
    foreign_key: :duplicate_id,
    primary_key: :id
  )

  after_commit :auto_rearrange!, on: :update

  def auto_rearrange!
    return unless complete

    desired = completed_siblings + uncompleted_siblings
    desired.each_with_index do |task, index|
      task.update!(position: index) unless task.position == index
    end
  end

  def serialize
    serializable_hash(include: { subtasks: { include: { subtasks: { include: { subtasks: { include: :subtasks } } } } } })
  end

  def original?
    !duplicate_id
  end

  def original_day_task?
    original? && timeframe == 'day'
  end

  def update_self_and_duplicates!(obj:, duplicate_columns: nil)
    dup_obj = obj.dup
    dup_obj.slice!(*duplicate_columns) unless duplicate_columns.nil?

    update!(obj)
    duplicate = self.duplicate
    until duplicate.nil?
      duplicate.update!(dup_obj)
      duplicate = duplicate.duplicate
    end
    nil
  end

  def has_dups?
    Task.exists?(duplicate_id: id)
  end

  def siblings
    Task.where(user: user, timeframe: timeframe, parent_id: parent_id).order(:position)
  end

  def completed_siblings
    siblings.where(complete: true)
  end

  def uncompleted_siblings
    siblings.where(complete: false)
  end

  def duplicates
    result = []
    duplicate = self.duplicate
    while duplicate.present?
      result << duplicate
      duplicate = duplicate.duplicate
    end
    result
  end

  def delete_duplicates!
    duplicate_tasks = duplicates
    duplicate_tasks.each do |duplicate_task|
      duplicate_task.destroy!
      duplicate_task.close_parent_if_no_siblings_left!
      duplicate_task.reassign_order_of_siblings!
    end
  end

  def close_parent_if_no_siblings_left!
    parent_task = self.parent
    if parent_task && self.siblings.empty?
      parent_task.update(expanded: false)
    end
  end

  def reassign_order_of_siblings!
    siblings.each_with_index do |task, index|
      task.update!(position: index)
    end
  end

  def self.rearrange_after_position!(tasks:, position:)
    # when a new task is being created in the middle of a list, we need to increment each of the following tasks' positions by one
    tasks.order(:position).each_with_index do |task, index|
      next unless task.position >= position

      task.update!(position: index + 1)
      next unless task.parent_id

      duped_parents = Task.where(duplicate_id: task.parent_id)
      t = task
      until duped_parents.empty?
        duped_task = Task.where(duplicate_id: t.id).first
        duped_task.update(position: index + 1)
        duped_parents = Task.where(duplicate_id: duped_task.parent_id)
        t = duped_task
      end
      master_parents = Task.where(id: task.parent.duplicate_id)
      t = task
      until master_parents.empty?
        master_task = Task.where(id: t.duplicate_id).first
        master_task.update(position: index + 1)
        master_parents = Task.where(id: master_task.parent.duplicate_id)
        t = master_task
      end
    end
  end

  def convert_to_future_task!(date: nil)
    FutureTask.create!(text: text, timeframe: timeframe.capitalize, color: "rgb(#{color})", user_id: user_id,
                       date: date || DateTime.now.in_time_zone('America/New_York').to_date + 1.day, add_to_end: true)
  end

  def delete_self_and_subs_and_dups!
    delete_nested_subtasks!
    delete_duplicates!
    destroy!
  end

  def self.delete_task_and_subs_and_dups(task)
    tasks_queue = [task]
    loop_count = 0
    until tasks_queue.empty? || loop_count > 100
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue += tasks_queue.first.duplicates.to_a
      task = tasks_queue.first
      task.destroy
      siblings = Task.where(user_id: task.user_id, timeframe: task.timeframe,
                            parent_id: task.parent_id).order(:position)
      # close parent task if no siblings left
      if task.parent_id && siblings.length == 0
        parent_task = Task.where(id: task.parent_id)
        parent_task[0].update(expanded: false) if parent_task.length > 0
      end
      # reassign order to siblings
      siblings.each_with_index do |task, index|
        task.update(position: index)
      end
      tasks_queue.shift
      loop_count += 1
    end
  end

  def move!(new_timeframe:)
    siblings = Task.where(user: user, timeframe: new_timeframe, parent_id: parent_id).order(:position)
    update!(
      timeframe: new_timeframe,
      position: Task.where(user: user, timeframe: new_timeframe, parent_id: nil).length,
      parent_id: nil
    )
    nested_subtasks.update_all(timeframe: new_timeframe)
    siblings.each_with_index do |task, index|
      task.update(position: index)
    end

    delete_duplicates!
  end

  def nested_subtasks
    ids = []
    queue = subtasks
    until queue.empty?
      subtask = queue.first
      ids << subtask.id
      queue += subtask.subtasks
      queue.shift
    end

    Task.where(id: ids)
  end

  def delete_nested_subtasks!
    nested_subtasks.each do |subtask|
      subtask.delete_duplicates!
      subtask.destroy!
      subtask.close_parent_if_no_siblings_left!
      subtask.reassign_order_of_siblings!
    end
  end

  def existing_copy?
    # check if there is an existing copy of a task OR existing copies of any of its (nested) subtasks
    return true if Task.exists?(duplicate_id: self.id)

    tasks_queue = self.subtasks.to_a
    subtask_ids = []
    until tasks_queue.empty?
      subtask_ids << tasks_queue.first.id
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue.shift
    end
    subtask_ids.each do |subtask_id|
      return true if Task.exists?(duplicate_id: subtask_id)
    end
    false
  end

  private

  def self.convert_future_tasks(tasks_array:, user:, timeframe:, position:, date:)
    future_tasks = FutureTask.where(user_id: user.id, date: date, timeframe: timeframe, add_to_end: position == 'end')
    future_tasks.each do |task|
      tasks_array << Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task.text,
                                 color: task.color.gsub(/[rgb()]/, ''))
    end
    future_tasks.destroy_all
  end

  def self.create_joint_tasks_from_other_users(tasks:, user:, timeframe:, position:, date:)
    other_users = User.where.not(id: user.id)
    recurring_tasks = RecurringTask
                      .where(
                        active: true,
                        user: other_users,
                        timeframe: timeframe,
                        add_to_end: position == 'end',
                        joint_user_id: user.id
                      ).order(:position)
    recurring_tasks.each do |recurring_task|
      recurrence = recurring_task.montrose_object
      i = 1
      while recurrence.events.take(i).last.to_date <= date
        if recurrence.events.take(i).last.to_date == date
          new_task = Task.create(
            user_id: user.id,
            timeframe: timeframe.downcase,
            text: recurring_task.joint_text,
            color: recurring_task.color.gsub(/[rgb()]/, ''),
            template: recurring_task.expires,
            recurring_task_id: recurring_task.id,
            template_date: date
          )
          tasks << new_task

          joint_task = Task.find_by(user_id: recurring_task.user_id, recurring_task_id: recurring_task.id,
                                    template_date: date)
          if joint_task
            joint_task.update!(joint_id: new_task.id)
            new_task.update!(joint_id: joint_task.id)
          end

          break
        else
          i += 1
        end
      end
    end
  end

  def self.convert_recurring_tasks!(tasks:, user:, timeframe:, position:, date:)
    recurring_tasks = RecurringTask.where(active: true, user_id: user.id, timeframe: timeframe,
                                          add_to_end: position == 'end').order(:position)
    recurring_tasks.each do |recurring_task|
      recurrence = recurring_task.montrose_object
      i = 1
      while recurrence.events.take(i).last.to_date <= date
        if recurrence.events.take(i).last.to_date == date
          new_task = Task.create(
            user_id: user.id,
            timeframe: timeframe.downcase,
            text: recurring_task.text,
            color: recurring_task.color.gsub(/[rgb()]/, ''),
            template: recurring_task.expires,
            recurring_task_id: recurring_task.id,
            template_date: date
          )
          tasks << new_task

          joint_task = Task.find_by(user_id: recurring_task.joint_user_id, recurring_task_id: recurring_task.id,
                                    template_date: date)
          if joint_task
            joint_task.update!(joint_id: new_task.id)
            new_task.update!(joint_id: joint_task.id)
          end

          recurring_task.update_start_date_to_next_occurrence!
          break
        else
          i += 1
        end
      end
    end
  end
end
