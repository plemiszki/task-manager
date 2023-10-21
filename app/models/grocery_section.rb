class GrocerySection < ActiveRecord::Base

  validates :name, :position, :grocery_store_id, presence: true
  validates :name, uniqueness: { scope: :grocery_item_id }

  belongs_to :grocery_store
  alias_attribute :store, :grocery_store

  has_many :grocery_items, dependent: :destroy
  alias_attribute :items, :grocery_items

end
