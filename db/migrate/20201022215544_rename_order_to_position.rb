class RenameOrderToPosition < ActiveRecord::Migration[5.2]
  def change
    rename_column :tasks, :order, :position
    rename_column :recurring_tasks, :order, :position
  end
end
