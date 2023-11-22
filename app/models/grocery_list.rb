class GroceryList < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :grocery_list_items, dependent: :destroy
  alias_attribute :items, :grocery_list_items

  has_many :grocery_items, through: :grocery_list_items

  def sorted_list_items
    grocery_list_items.includes(:grocery_item).sort_by { |gli| gli.item.name.downcase }
  end

end
