class GroceryListItem < ActiveRecord::Base

  validates :grocery_list_id, :grocery_item_id, presence: true
  validates :grocery_item_id, uniqueness: { scope: :grocery_list_id }

end
