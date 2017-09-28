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
    if Date.today.strftime("%A") == "Wednesday"
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
    day_tasks << Task.create(user_id: 2, timeframe: "day", text: "Shower", color: "238, 244, 66", template: true)
    if DateTime.now.strftime("%d") == "15"
      day_tasks << Task.create(user_id: 2, timeframe: "day", text: "Create Wonderland Doodle", color: "181, 111, 240")
    end
    day_tasks += leftover_day_tasks
    day_tasks.each_with_index do |task, index|
      task.update(order: index)
    end

    # add joint tasks
    pee_pad_day = DateTime.parse('September 23 2017')
    days_since_change = (DateTime.now - pee_pad_day).to_i
    if days_since_change % 8 == 0
      first_pee_pad_task = Task.create(user_id: 1, timeframe: "day", text: "change pee pad", color: "210, 206, 200")
      second_pee_pad_task = Task.create(user_id: 2, timeframe: "day", text: "Change Max's Pee Pad", color: "255, 175, 36", joint_id: first_pee_pad_task.id)
      first_pee_pad_task.update(joint_id: second_pee_pad_task.id)
    elsif days_since_change % 4 == 0
      first_pee_pad_task = Task.create(user_id: 1, timeframe: "day", text: "flip pee pad", color: "210, 206, 200")
      second_pee_pad_task = Task.create(user_id: 2, timeframe: "day", text: "Flip Max's Pee Pad", color: "255, 175, 36", joint_id: first_pee_pad_task.id)
      first_pee_pad_task.update(joint_id: second_pee_pad_task.id)
    end

    # add weekend tasks
    if Date.today.strftime("%A") == "Saturday"
      existing_weekend_tasks = Task.where(user_id: 1, timeframe: "weekend", parent_id: nil).order(:order)
      weekend_tasks = []
      weekend_tasks << Task.create(user_id: 1, timeframe: "weekend", text: "change bedsheets", color: "210, 206, 200")
      weekend_tasks << Task.create(user_id: 1, timeframe: "weekend", text: "push ups", color: "210, 206, 200")
      weekend_tasks += existing_weekend_tasks
      weekend_tasks.each_with_index do |task, index|
        task.update(order: index)
      end
    end

    # add month tasks
    if Date.today.strftime("%-d") == "1"
      existing_month_tasks = Task.where(user_id: 1, timeframe: "month", parent_id: nil).order(:order)
      month_tasks = []
      month_tasks << Task.create(user_id: 1, timeframe: "month", text: "send money to India", color: "255, 175, 36")
      if Date.today.strftime("%B") == "September" || Date.today.strftime("%B") == "March"
        month_tasks << Task.create(user_id: 1, timeframe: "month", text: "dentist appointment", color: "210, 206, 200")
      end
      # TODO: add doctor and vet appointments based on month
      month_tasks += existing_month_tasks
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
