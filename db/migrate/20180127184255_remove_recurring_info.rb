class RemoveRecurringInfo < ActiveRecord::Migration
  def change
    remove_column :recurring_tasks, :recurring_info
  end
end
