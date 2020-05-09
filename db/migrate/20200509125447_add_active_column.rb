class AddActiveColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :recurring_tasks, :active, :boolean, default: true
  end
end
