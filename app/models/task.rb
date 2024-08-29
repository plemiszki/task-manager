class Task < ActiveRecord::Base

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_TLS_URL"]

  belongs_to :parent, class_name: "Task"
  belongs_to :user

  has_many :subtasks, -> { order(:position) }, class_name: "Task", foreign_key: :parent_id, primary_key: :id, dependent: :destroy

  has_one(
    :duplicate,
    class_name: "Task",
    foreign_key: :duplicate_id,
    primary_key: :id,
  )

  belongs_to(
    :master,
    class_name: "Task",
    foreign_key: :duplicate_id,
    primary_key: :id,
  )

  after_commit :auto_rearrange!, on: :update

  def auto_rearrange!
    return unless self.complete
    desired = self.completed_siblings + self.uncompleted_siblings
    desired.each_with_index do |task, index|
      task.update!(position: index) unless task.position == index
    end
  end

  def serialize
    self.serializable_hash(include: { subtasks: { include: { subtasks: { include: { subtasks: { include: :subtasks } } } } } })
  end

  def update_self_and_duplicates!(obj)
    self.update!(obj)
    duplicate = self.duplicate
    until duplicate.nil?
      duplicate.update!(obj)
      duplicate = duplicate.duplicate
    end
    nil
  end

  def has_dups?
    Task.exists?(duplicate_id: id)
  end

  def siblings
    Task.where(user: self.user, timeframe: self.timeframe, parent_id: self.parent_id).order(:position)
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

  def self.rearrange_after_position!(tasks:, position:)
    # when a new task is being created in the middle of a list, we need to increment each of the following tasks' positions by one
    tasks.order(:position).each_with_index do |task, index|
      if task.position >= position
        task.update!(position: index + 1)
        if task.parent_id
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
    end
  end

  def convert_to_future_task!
    FutureTask.create!(text: text, timeframe: timeframe.capitalize, color: "rgb(#{color})", user_id: user_id, date: DateTime.now.in_time_zone("America/New_York").to_date + 1.day, add_to_end: true)
  end

  def self.clear_daily_tasks!(date: DateTime.now.in_time_zone('America/New_York').to_date)
    tasks_to_delete = Task.where(timeframe: "day", parent_id: nil, complete: true) + Task.where(timeframe: "day", parent_id: nil, template: true)
    tasks_to_delete += Task.where(timeframe: "weekend", parent_id: nil, complete: true) if date.strftime("%A") == (User.first.long_weekend ? "Tuesday" : "Monday")
    tasks_to_delete += Task.where(timeframe: "month", parent_id: nil, complete: true) if date.strftime("%-d") == "1"
    tasks_to_delete.each do |task|
      Task.delete_task_and_subs_and_dups(task)
    end

    joint_tasks = []

    redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })

    User.all.order(:id).each do |user|

      next if redis.smembers("daily-reset-early").include?(user.id.to_s)

      # DAILY TASKS

      day_tasks = []
      existing_day_tasks = Task.where(user_id: user.id, timeframe: "day", parent_id: nil).order(:position).to_a
      joint_tasks += Task.convert_recurring_tasks!(tasks: day_tasks, user: user, timeframe: "Day", position: "beginning", date: date)
      Task.convert_future_tasks(tasks_array: day_tasks, user: user, timeframe: "Day", position: "beginning", date: date)
      day_tasks += Task.convert_joint_tasks(joint_tasks, user, "Day")
      day_tasks += existing_day_tasks
      joint_tasks += Task.convert_recurring_tasks!(tasks: day_tasks, user: user, timeframe: "Day", position: "end", date: date)
      Task.convert_future_tasks(tasks_array: day_tasks, user: user, timeframe: "Day", position: "end", date: date)

      day_tasks.each_with_index do |task, index|
        task.update(position: index)
      end

      # WEEKEND TASKS

      weekend_tasks = []
      existing_weekend_tasks = Task.where(user_id: 1, timeframe: "weekend", parent_id: nil).order(:position)
      joint_tasks += Task.convert_recurring_tasks!(tasks: weekend_tasks, user: user, timeframe: "Weekend", position: "beginning", date: date)
      Task.convert_future_tasks(tasks_array: weekend_tasks, user: user, timeframe: "Weekend", position: "beginning", date: date)
      weekend_tasks += existing_weekend_tasks
      joint_tasks += Task.convert_recurring_tasks!(tasks: weekend_tasks, user: user, timeframe: "Weekend", position: "end", date: date)
      Task.convert_future_tasks(tasks_array: weekend_tasks, user: user, timeframe: "Weekend", position: "end", date: date)

      weekend_tasks.each_with_index do |task, index|
        task.update(position: index)
      end

      # MONTH TASKS

      month_tasks = []
      existing_month_tasks = Task.where(user_id: 1, timeframe: "month", parent_id: nil).order(:position)
      joint_tasks += Task.convert_recurring_tasks!(tasks: month_tasks, user: user, timeframe: "Month", position: "beginning", date: date)
      Task.convert_future_tasks(tasks_array: month_tasks, user: user, timeframe: "Month", position: "beginning", date: date)
      month_tasks += existing_month_tasks
      joint_tasks += Task.convert_recurring_tasks!(tasks: month_tasks, user: user, timeframe: "Month", position: "end", date: date)
      Task.convert_future_tasks(tasks_array: month_tasks, user: user, timeframe: "Month", position: "end", date: date)

      month_tasks.each_with_index do |task, index|
        task.update(position: index)
      end
    end
  end

  def self.delete_task_and_subs_and_dups(task)
    tasks_queue = [task]
    loop_count = 0
    until tasks_queue.empty? || loop_count > 100
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue += tasks_queue.first.duplicates.to_a
      task = tasks_queue.first
      task.destroy
      siblings = Task.where(user_id: task.user_id, timeframe: task.timeframe, parent_id: task.parent_id).order(:position)
      # close parent task if no siblings left
      if task.parent_id && siblings.length == 0
        parent_task = Task.where(id: task.parent_id)
        if parent_task.length > 0
          parent_task[0].update(expanded: false)
        end
      end
      # reassign order to siblings
      siblings.each_with_index do |task, index|
        task.update(position: index)
      end
      tasks_queue.shift
      loop_count += 1
    end
  end

  private

  def self.convert_future_tasks(tasks_array:, user:, timeframe:, position:, date:)
    future_tasks = FutureTask.where(user_id: user.id, date: date, timeframe: timeframe, add_to_end: position == "end")
    future_tasks.each do |task|
      tasks_array << Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task.text, color: task.color.gsub(/[rgb\(\)]/, ""))
    end
    future_tasks.destroy_all
  end

  def self.convert_recurring_tasks!(tasks:, user:, timeframe:, position:, date:)
    recurring_tasks = RecurringTask.where(active: true, user_id: user.id, timeframe: timeframe, add_to_end: position == "end").order(:position)
    joint_tasks = []
    recurring_tasks.each do |recurring_task|
      recurrence = recurring_task.montrose_object
      i = 1
      while recurrence.events.take(i).last.to_date <= date
        if recurrence.events.take(i).last.to_date == date
          new_task = Task.create(
            user_id: user.id,
            timeframe: timeframe.downcase,
            text: recurring_task.text,
            template: recurring_task.expires,
            color: recurring_task.color.gsub(/[rgb\(\)]/, "")
          )
          tasks << new_task
          if recurring_task.joint_user_id
            joint_tasks << {
              user_id: recurring_task.joint_user_id,
              timeframe: timeframe.downcase,
              text: recurring_task.joint_text,
              template: recurring_task.expires,
              color: recurring_task.color.gsub(/[rgb\(\)]/, ""),
              joint_id: new_task.id
            }
          end
          recurring_task.update_start_date_to_next_occurrence!
          break
        else
          i += 1
        end
      end
    end
    joint_tasks
  end

  def self.convert_joint_tasks(joint_tasks, user, timeframe)
    # input: array of task "blueprints" from all other users' joint recurring tasks, in case any are intended for this user
    created_tasks = []
    joint_tasks.select { |task| task[:user_id] == user.id && task[:timeframe] == timeframe.downcase }.each do |task|
      new_task = Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task[:text], template: task[:template], color: task[:color].gsub(/[rgb\(\)]/, ""), joint_id: task[:joint_id])
      Task.find_by_id(task[:joint_id]).update({ joint_id: new_task.id })
      created_tasks << new_task
    end
    created_tasks
  end

end
