class List < ActiveRecord::Base

  validates :name, :user_id, presence: true
  validates :name, uniqueness: { scope: :user_id }

  has_many :list_items, -> { order(:position) }, dependent: :destroy
  alias_method :items, :list_items

end
