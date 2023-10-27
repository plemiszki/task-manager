class AddGroceryListId < ActiveRecord::Migration[7.1]
  def change
    add_column :grocery_list_items, :grocery_list_id, :integer, null: false
    add_index :grocery_list_items, [:grocery_list_id, :grocery_item_id], unique: true
  end

end
