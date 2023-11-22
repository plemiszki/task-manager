class Recipe < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :recipe_items, dependent: :destroy
  alias_attribute :items, :recipe_items

  has_many :grocery_items, through: :recipe_items

  def sorted_list_items
    recipe_items.includes(:grocery_item).sort_by { |recipe_item| recipe_item.item.name.downcase }
  end

end
