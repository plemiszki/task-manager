class GroceryItem < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :grocery_section_items, dependent: :destroy

end
