class TaskRecurringTaskId < ActiveRecord::Migration[7.1]
  def change
    add_column :tasks, :recurring_task_id, :integer
  end
end
