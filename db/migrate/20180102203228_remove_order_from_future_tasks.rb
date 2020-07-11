class RemoveOrderFromFutureTasks < ActiveRecord::Migration[5.2]
  def change
    remove_column :future_tasks, :order
  end
end
