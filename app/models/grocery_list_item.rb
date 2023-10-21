class GroceryListItem < ActiveRecord::Base

  validates :grocery_list_id, :grocery_item_id, presence: true
  validates :grocery_item_id, uniqueness: { scope: :grocery_list_id }

  belongs_to :grocery_list
  alias_attribute :list, :grocery_list

  belongs_to :grocery_item
  alias_attribute :item, :grocery_item

end
