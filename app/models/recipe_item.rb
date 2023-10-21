class RecipeItem < ActiveRecord::Base

  validates :recipe_id, :grocery_item_id, presence: true
  validates :grocery_item_id, uniqueness: { scope: :recipe_id }

  belongs_to :recipe
  belongs_to :grocery_item

end
