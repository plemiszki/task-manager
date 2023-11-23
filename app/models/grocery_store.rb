class GroceryStore < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :grocery_sections, dependent: :destroy
  alias_attribute :sections, :grocery_sections

  has_many :grocery_section_items, through: :grocery_sections
  has_many :grocery_items, through: :grocery_section_items
  alias_attribute :items, :grocery_items

  def all_item_ids
    items.map { |item| item.id }
  end

end
