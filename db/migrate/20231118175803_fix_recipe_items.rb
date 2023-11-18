class FixRecipeItems < ActiveRecord::Migration[7.1]
  def change
    remove_column :recipe_items, :position
    add_column :recipe_items, :grocery_item_id, :integer, null: false
    add_index :recipe_items, [:grocery_item_id, :recipe_id], unique: true
  end
end
