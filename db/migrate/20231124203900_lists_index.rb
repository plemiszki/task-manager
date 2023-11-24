class ListsIndex < ActiveRecord::Migration[7.1]
  def change
    add_index :lists, [:user_id, :name], unique: true
  end
end
