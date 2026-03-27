class Property < ActiveRecord::Base

  STATUSES = %w[available not_available].freeze
  PROPERTY_TYPES = %w[townhouse condo co-op single-family double-family].freeze

  validates :label, :street_address, :status, :price, :bedrooms, :bathrooms, :property_type, presence: true
  validates :label, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :property_type, inclusion: { in: PROPERTY_TYPES }

end
