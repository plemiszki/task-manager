class GrocerySection < ActiveRecord::Base

  validates :name, :position, :grocery_store_id, presence: true
  validates :name, uniqueness: { scope: :grocery_item_id }

end
