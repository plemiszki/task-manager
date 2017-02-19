require 'byebug'

class Task < ActiveRecord::Base

  has_many(
    :subtasks,
    class_name: "Task",
    foreign_key: :parent_id,
    primary_key: :id,
    dependent: :destroy
  )

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
    tasks_to_delete = Task.where(timeframe: "day", parent_id: nil, complete: true)
    tasks_to_delete += Task.where(timeframe: "weekend", parent_id: nil, complete: true) if Date.today.strftime("%A") == "Tuesday"
    tasks_to_delete += Task.where(timeframe: "month", parent_id: nil, complete: true) if Date.today.strftime("%d") == "1"
    tasks_to_delete.each do |task|
      Task.delete_task_and_subs_and_dups(task)
    end

    leftover_day_tasks = Task.where(timeframe: "day", parent_id: nil).order(:order)

    # add day tasks
    day_tasks = []
    day_tasks << Task.create(timeframe: "day", text: "20 push ups", color: "210, 206, 200")
    day_tasks << Task.create(timeframe: "day", text: "take Vitamin D", color: "210, 206, 200")
    day_tasks << Task.create(timeframe: "day", text: "daily mondly lesson", color: "255, 175, 36")

    if Date.today.strftime("%A") == "Saturday" || Date.today.strftime("%A") == "Wednesday"
      day_tasks << Task.create(timeframe: "day", text: "update finances", color: "210, 206, 200")
    end

    day_tasks += leftover_day_tasks

    day_tasks.each_with_index do |task, index|
      task.update(order: index)
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
