class RemoveRecipeIndex < ActiveRecord::Migration[7.1]
  def change
    remove_index :recipe_items, name: "index_recipe_items_on_recipe_id"
  end
end
