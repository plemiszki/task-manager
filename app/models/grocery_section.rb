class GrocerySection < ActiveRecord::Base

  validates :name, :position, :grocery_store_id, presence: true
  validates :name, uniqueness: { scope: :grocery_store_id }

  belongs_to :grocery_store
  alias_attribute :store, :grocery_store

  has_many :grocery_section_items, -> { order(:position) }, dependent: :destroy
  has_many :grocery_items, through: :grocery_section_items
  alias_attribute :items, :grocery_items

  def all_item_ids
    items.map { |item| item.id }
  end

end
