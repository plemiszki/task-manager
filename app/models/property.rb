class Property < ActiveRecord::Base

  STATUSES = %w[available not_available].freeze
  PROPERTY_TYPES = %w[townhouse condo co-op single-family-house double-family-house multi-family-house].freeze

  DEFAULT_AMOUNT_SAVED = 360_000
  DEFAULT_MONTHLY_PAYMENT = 10_000
  DEFAULT_INTEREST_RATE = 0.0699
  LOAN_TERM_MONTHS = 360

  REDIS_URL = Rails.env == 'development' ? 'redis://localhost:6379' : ENV['REDIS_URL']

  def self.amount_saved
    redis.get('property:amount_saved')&.to_i || DEFAULT_AMOUNT_SAVED
  end

  def self.monthly_payment
    redis.get('property:monthly_payment')&.to_i || DEFAULT_MONTHLY_PAYMENT
  end

  def self.interest_rate
    redis.get('property:interest_rate')&.to_f || DEFAULT_INTEREST_RATE
  end

  def self.redis
    Redis.new(url: REDIS_URL)
  end

  validates :label, :street_address, :status, :price, :bedrooms, :full_bathrooms, :half_bathrooms, :property_type, :date_added, :url, presence: true
  validates :label, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :property_type, inclusion: { in: PROPERTY_TYPES }

  def adjusted_monthly_payment
    (self.class.monthly_payment - (taxes || 0) - (hoa_fees || 0)).round
  end

  def max_loan
    monthly_rate = self.class.interest_rate / 12
    ((adjusted_monthly_payment * (((1 + monthly_rate)**LOAN_TERM_MONTHS) - 1)) /
      (monthly_rate * ((1 + monthly_rate)**LOAN_TERM_MONTHS))).round
  end

  def can_afford?
    price.present? && self.class.amount_saved >= price - max_loan
  end

  def actual_loan
    price - self.class.amount_saved
  end

  def amount_needed
    return nil unless price.present?
    price - max_loan - self.class.amount_saved
  end

  def actual_monthly_payment
    return self.class.monthly_payment unless can_afford?
    monthly_rate = self.class.interest_rate / 12
    (actual_loan * monthly_rate * ((1 + monthly_rate)**LOAN_TERM_MONTHS) /
      (((1 + monthly_rate)**LOAN_TERM_MONTHS) - 1)).round
  end

end
