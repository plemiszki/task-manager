class Recipe < ActiveRecord::Base

  validates :name, presence: true, uniqueness: true

  has_many :recipe_items, dependent: :destroy
  alias_attribute :items, :recipe_items

end
