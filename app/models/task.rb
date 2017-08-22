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

    # add day tasks
    leftover_day_tasks = Task.where(user_id: 1, timeframe: "day", parent_id: nil).order(:order).to_a
    day_tasks = []
    day_tasks << Task.create(user_id: 1, timeframe: "day", text: "take Vitamin D", color: "210, 206, 200", template: true)
    if Date.today.strftime("%A") == "Saturday" || Date.today.strftime("%A") == "Wednesday"
      day_tasks << Task.create(user_id: 1, timeframe: "day", text: "push ups", color: "210, 206, 200", template: true)
    end
    if Date.today.strftime("%A") == "Saturday"
      day_tasks << Task.create(user_id: 1, timeframe: "day", text: "update finances", color: "210, 206, 200")
    end
    day_tasks += leftover_day_tasks
    if Date.today.strftime("%A") == "Wednesday"
      day_tasks << Task.create(user_id: 1, timeframe: "day", text: "update finances", color: "210, 206, 200")
    end
    day_tasks << Task.create(user_id: 1, timeframe: "day", text: "brush Max", color: "210, 206, 200", template: true)
    day_tasks << Task.create(user_id: 1, timeframe: "day", text: "floss", color: "210, 206, 200", template: true)

    day_tasks.each_with_index do |task, index|
      task.update(order: index)
    end

    # add day tasks 2
    leftover_day_tasks = Task.where(user_id: 2, timeframe: "day", parent_id: nil).order(:order).to_a
    day_tasks = []
    day_tasks << Task.create(user_id: 2, timeframe: "day", text: "shower", color: "210, 206, 200", template: true)
    day_tasks += leftover_day_tasks
    day_tasks.each_with_index do |task, index|
      task.update(order: index)
    end

    # add weekend tasks
    if Date.today.strftime("%A") == "Saturday"
      existing_weekend_tasks = Task.where(user_id: 1, timeframe: "weekend", parent_id: nil).order(:order)
      weekend_tasks = []
      weekend_tasks << Task.create(user_id: 1, timeframe: "weekend", text: "change bedsheets", color: "210, 206, 200")
      weekend_tasks << Task.create(user_id: 1, timeframe: "weekend", text: "vacuum lady cave", color: "210, 206, 200")
      weekend_tasks += existing_weekend_tasks
      weekend_tasks.each_with_index do |task, index|
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
      siblings = Task.where(timeframe: task.timeframe, parent_id: task.parent_id).order(:order)
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

end
