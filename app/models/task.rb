class Task < ActiveRecord::Base

  has_many(
    :subtasks,
    class_name: "Task",
    foreign_key: :parent_id,
    primary_key: :id,
    dependent: :destroy
  )

  belongs_to :parent, class_name: "Task"
  belongs_to :user

  has_many(
    :duplicates,
    class_name: "Task",
    foreign_key: :duplicate_id,
    primary_key: :id
  )

  belongs_to(
    :master,
    class_name: "Task",
    foreign_key: :duplicate_id,
    primary_key: :id
  )

  def self.clear_daily_tasks
    tasks_to_delete = Task.where(timeframe: "day", parent_id: nil, complete: true) + Task.where(timeframe: "day", parent_id: nil, template: true)
    tasks_to_delete += Task.where(timeframe: "weekend", parent_id: nil, complete: true) if Date.today.strftime("%A") == (User.first.long_weekend ? "Tuesday" : "Monday")
    tasks_to_delete += Task.where(timeframe: "month", parent_id: nil, complete: true) if Date.today.strftime("%-d") == "1"
    tasks_to_delete.each do |task|
      Task.delete_task_and_subs_and_dups(task)
    end

    joint_tasks = []

    User.all.order(:id).each do |user|

      # DAILY TASKS

      day_tasks = []
      existing_day_tasks = Task.where(user_id: user.id, timeframe: "day", parent_id: nil).order(:order).to_a
      joint_tasks += Task.convert_recurring_tasks(day_tasks, user, "Day", "beginning")
      Task.convert_future_tasks(day_tasks, user, "Day", "beginning")
      Task.convert_joint_tasks(joint_tasks, user, "Day")
      day_tasks += existing_day_tasks
      joint_tasks += Task.convert_recurring_tasks(day_tasks, user, "Day", "end")
      Task.convert_future_tasks(day_tasks, user, "Day", "end")

      day_tasks.each_with_index do |task, index|
        task.update(order: index)
      end

      # WEEKEND TASKS

      weekend_tasks = []
      existing_weekend_tasks = Task.where(user_id: 1, timeframe: "weekend", parent_id: nil).order(:order)
      joint_tasks += Task.convert_recurring_tasks(weekend_tasks, user, "Weekend", "beginning")
      Task.convert_future_tasks(weekend_tasks, user, "Weekend", "beginning")
      weekend_tasks += existing_weekend_tasks
      joint_tasks += Task.convert_recurring_tasks(weekend_tasks, user, "Weekend", "end")
      Task.convert_future_tasks(weekend_tasks, user, "Weekend", "end")

      weekend_tasks.each_with_index do |task, index|
        task.update(order: index)
      end

      # MONTH TASKS

      month_tasks = []
      existing_month_tasks = Task.where(user_id: 1, timeframe: "month", parent_id: nil).order(:order)
      joint_tasks += Task.convert_recurring_tasks(month_tasks, user, "Month", "beginning")
      Task.convert_future_tasks(month_tasks, user, "Month", "beginning")
      month_tasks += existing_month_tasks
      joint_tasks += Task.convert_recurring_tasks(month_tasks, user, "Month", "end")
      Task.convert_future_tasks(month_tasks, user, "Month", "end")

      month_tasks.each_with_index do |task, index|
        task.update(order: index)
      end
    end
  end

  def self.delete_task_and_subs_and_dups(task)
    tasks_queue = [task]
    until tasks_queue.empty?
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue += tasks_queue.first.duplicates.to_a
      task = tasks_queue.first
      task.destroy
      siblings = Task.where(user_id: task.user_id, timeframe: task.timeframe, parent_id: task.parent_id).order(:order)
      # close parent task if no siblings left
      if task.parent_id && siblings.length == 0
        parent_task = Task.where(id: task.parent_id)
        if parent_task.length > 0
          parent_task[0].update(expanded: false)
        end
      end
      # reassign order to siblings
      siblings.each_with_index do |task, index|
        task.update(order: index)
      end
      tasks_queue.shift
    end
  end

  private

  def self.convert_future_tasks(tasks_array, user, timeframe, position)
    future_tasks = FutureTask.where(user_id: user.id, date: Date.today, timeframe: timeframe, add_to_end: position == "end")
    future_tasks.each do |task|
      tasks_array << Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task.text, color: task.color.gsub(/[rgb\(\)]/, ""))
    end
    future_tasks.destroy_all
  end

  def self.convert_recurring_tasks(tasks_array, user, timeframe, position)
    recurring_tasks = RecurringTask.where(user_id: user.id, timeframe: timeframe, add_to_end: position == "end")
    joint_tasks = []
    recurring_tasks.each do |task|
      recurrence = Montrose.r(JSON.parse(task.recurrence))
      i = 1
      while recurrence.events.take(i).last.to_date <= Date.today
        if recurrence.events.take(i).last.to_date == Date.today
          new_task = Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task.text, template: task.expires, color: task.color.gsub(/[rgb\(\)]/, ""))
          tasks_array << new_task
          if task.joint_user_id
            joint_tasks << { user_id: task.joint_user_id, timeframe: timeframe.downcase, text: task.joint_text, template: task.expires, color: task.color.gsub(/[rgb\(\)]/, ""), joint_id: new_task.id }
          end
          break
        else
          i += 1
        end
      end
    end
    joint_tasks
  end

  def self.convert_joint_tasks(joint_tasks, user, timeframe)
    joint_tasks.select { |task| task[:user_id] == user.id && task[:timeframe] == timeframe.downcase }.each do |task|
      new_task = Task.create(user_id: user.id, timeframe: timeframe.downcase, text: task[:text], template: false, color: task[:color].gsub(/[rgb\(\)]/, ""), joint_id: task[:joint_id])
      Task.find_by_id(task[:joint_id]).update({ joint_id: new_task.id })
    end
  end

end
