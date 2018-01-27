class AddRecurringTaskProperties < ActiveRecord::Migration
  def change
    add_column :recurring_tasks, :expires, :boolean, default: false
    add_column :recurring_tasks, :joint_user_id, :integer
    add_column :recurring_tasks, :joint_text, :string
  end
end
