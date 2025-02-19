class GrocerySectionItem < ActiveRecord::Base

  validates :grocery_section_id, :position, presence: true
  validates :grocery_section_id, uniqueness: { scope: :grocery_item_id }

  belongs_to :grocery_section
  alias_method :section, :grocery_section

  belongs_to :grocery_item
  alias_method :item, :grocery_item

end
