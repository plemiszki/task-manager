class GrocerySectionItem < ActiveRecord::Base

  validates :grocery_section_id, :position, presence: true

  belongs_to :grocery_section
  alias_attribute :section, :grocery_section

  belongs_to :grocery_item
  alias_attribute :item, :grocery_item

end
