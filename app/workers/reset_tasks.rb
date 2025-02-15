class ResetTasks
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(job_id, user_id, do_for_tomorrow)
    job = Job.find_by_job_id(job_id)
    user = User.find(user_id)

    today = DateTime.now.in_time_zone('America/New_York').to_date
    tomorrow = today + 1.day
    date = do_for_tomorrow ? tomorrow : today

    # delete completed and expiring tasks
    tasks_to_delete = Task.where(timeframe: 'day', parent_id: nil, complete: true,
                                 user: user) + Task.where(timeframe: 'day',
                                                          parent_id: nil, template: true, user: user)
    if date.strftime('%A') == (user.long_weekend ? 'Tuesday' : 'Monday')
      tasks_to_delete += Task.where(timeframe: 'weekend', parent_id: nil, complete: true,
                                    user: user)
    end
    if date.strftime('%-d') == '1'
      tasks_to_delete += Task.where(timeframe: 'month', parent_id: nil, complete: true,
                                    user: user)
    end
    tasks_to_delete.each do |task|
      Task.delete_task_and_subs_and_dups(task)
    end

    # DAY
    day_tasks = []
    existing_day_tasks = Task.where(user_id: user.id, timeframe: 'day', parent_id: nil).order(:position).to_a

    # beginning
    Task.convert_recurring_tasks!(tasks: day_tasks, user: user, timeframe: 'Day', position: 'beginning', date: date)
    Task.convert_future_tasks(tasks_array: day_tasks, user: user, timeframe: 'Day', position: 'beginning', date: date)
    Task.create_joint_tasks_from_other_users(tasks: day_tasks, user: user, timeframe: 'Day', position: 'beginning',
                                             date: date)

    # middle
    day_tasks += existing_day_tasks

    # end
    Task.convert_recurring_tasks!(tasks: day_tasks, user: user, timeframe: 'Day', position: 'end', date: date)
    Task.convert_future_tasks(tasks_array: day_tasks, user: user, timeframe: 'Day', position: 'end', date: date)
    Task.create_joint_tasks_from_other_users(tasks: day_tasks, user: user, timeframe: 'Day', position: 'end',
                                             date: date)

    day_tasks.each_with_index do |task, index|
      task.update(position: index)
    end

    # WEEKEND
    weekend_tasks = []
    existing_weekend_tasks = Task.where(user_id: 1, timeframe: 'weekend', parent_id: nil).order(:position)

    # beginning
    Task.convert_recurring_tasks!(tasks: weekend_tasks, user: user, timeframe: 'Weekend', position: 'beginning',
                                  date: date)
    Task.convert_future_tasks(tasks_array: weekend_tasks, user: user, timeframe: 'Weekend', position: 'beginning',
                              date: date)
    Task.create_joint_tasks_from_other_users(tasks: weekend_tasks, user: user, timeframe: 'Weekend',
                                              position: 'beginning', date: date)

    # middle
    weekend_tasks += existing_weekend_tasks

    # end
    Task.convert_recurring_tasks!(tasks: weekend_tasks, user: user, timeframe: 'Weekend', position: 'end', date: date)
    Task.convert_future_tasks(tasks_array: weekend_tasks, user: user, timeframe: 'Weekend', position: 'end',
                              date: date)
    Task.create_joint_tasks_from_other_users(tasks: weekend_tasks, user: user, timeframe: 'Weekend', position: 'end',
                                              date: date)

    weekend_tasks.each_with_index do |task, index|
      task.update(position: index)
    end

    # MONTH
    month_tasks = []
    existing_month_tasks = Task.where(user_id: 1, timeframe: 'month', parent_id: nil).order(:position)

    # beginning
    Task.convert_recurring_tasks!(tasks: month_tasks, user: user, timeframe: 'Month', position: 'beginning',
                                  date: date)
    Task.convert_future_tasks(tasks_array: month_tasks, user: user, timeframe: 'Month', position: 'beginning',
                              date: date)
    Task.create_joint_tasks_from_other_users(tasks: month_tasks, user: user, timeframe: 'Month',
                                              position: 'beginning', date: date)

    # middle
    month_tasks += existing_month_tasks

    # end
    Task.convert_recurring_tasks!(tasks: month_tasks, user: user, timeframe: 'Month', position: 'end', date: date)
    Task.convert_future_tasks(tasks_array: month_tasks, user: user, timeframe: 'Month', position: 'end', date: date)
    Task.create_joint_tasks_from_other_users(tasks: month_tasks, user: user, timeframe: 'Month', position: 'end',
                                              date: date)

    month_tasks.each_with_index do |task, index|
      task.update(position: index)
    end

    job.update!({
      status: :success,
    })
  end

end
