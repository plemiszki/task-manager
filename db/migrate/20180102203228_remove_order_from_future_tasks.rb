class RemoveOrderFromFutureTasks < ActiveRecord::Migration
  def change
    remove_column :future_tasks, :order
  end
end
