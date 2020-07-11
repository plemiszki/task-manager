class RemoveRecurringInfo < ActiveRecord::Migration[5.2]
  def change
    remove_column :recurring_tasks, :recurring_info
  end
end
