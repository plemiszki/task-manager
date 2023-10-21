class GroceryStore < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :grocery_sections, dependent: :destroy
  alias_attribute :sections, :grocery_sections

end
