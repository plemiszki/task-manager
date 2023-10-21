class GroceryList < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :grocery_list_items, dependent: :destroy
  alias_attribute :items, :grocery_list_items

end
