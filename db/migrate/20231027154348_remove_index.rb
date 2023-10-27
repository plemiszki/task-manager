class RemoveIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :grocery_list_items, :grocery_item_id
  end
end
