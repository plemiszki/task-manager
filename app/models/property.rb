class Property < ActiveRecord::Base

  STATUSES = %w[available not_available].freeze
  PROPERTY_TYPES = %w[townhouse condo co-op single-family-house double-family-house multi-family-house].freeze

  DEFAULT_AMOUNT_SAVED = 360_000
  DEFAULT_MONTHLY_PAYMENT = 10_000
  DEFAULT_INTEREST_RATE = 0.0699
  LOAN_TERM_MONTHS = 360

  REDIS_URL = Rails.env == 'development' ? 'redis://localhost:6379' : ENV['REDIS_URL']

  def self.amount_saved
    @amount_saved ||= redis.get('property:amount_saved')&.to_i || DEFAULT_AMOUNT_SAVED
  end

  def self.monthly_payment
    @monthly_payment ||= redis.get('property:monthly_payment')&.to_i || DEFAULT_MONTHLY_PAYMENT
  end

  def self.interest_rate
    @interest_rate ||= redis.get('property:interest_rate')&.to_f || DEFAULT_INTEREST_RATE
  end

  def self.reload_config!
    @amount_saved = @monthly_payment = @interest_rate = nil
  end

  def self.redis
    @redis ||= Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  end

  validates :label, :street_address, :status, :price, :bedrooms, :full_bathrooms, :half_bathrooms, :property_type, :date_added, :url, presence: true
  validates :label, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :property_type, inclusion: { in: PROPERTY_TYPES }

  CLOSING_COSTS = 100_000
  DOWN_PAYMENT_RATE = 0.20

  def total_carrying_costs
    (taxes || 0) + (hoa_fees || 0)
  end

  def pi_budget
    self.class.monthly_payment - total_carrying_costs
  end

  def down_payment
    return nil unless price.present?
    (price * DOWN_PAYMENT_RATE).round
  end

  def cash_to_close
    return nil unless price.present?
    down_payment + CLOSING_COSTS
  end

  def can_afford_close?
    return false unless price.present?
    self.class.amount_saved >= cash_to_close
  end

  def remainder
    return nil unless can_afford_close?
    self.class.amount_saved - cash_to_close
  end

  def amount_needed_for_close
    return nil if !price.present? || can_afford_close?
    cash_to_close - self.class.amount_saved
  end

  def pi_payment
    return nil unless price.present?
    loan = price - down_payment
    monthly_rate = self.class.interest_rate / 12
    (loan * monthly_rate * ((1 + monthly_rate)**LOAN_TERM_MONTHS) /
      (((1 + monthly_rate)**LOAN_TERM_MONTHS) - 1)).round
  end

  def can_afford_pi?
    return false unless price.present?
    pi_payment <= pi_budget
  end

  def pi_remainder
    return nil unless can_afford_pi?
    pi_budget - pi_payment
  end

  def adjusted_monthly_payment
    (self.class.monthly_payment - total_carrying_costs).round
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
