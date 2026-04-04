class Property < ActiveRecord::Base

  STATUSES = %w[available not_available].freeze
  PROPERTY_TYPES = %w[townhouse condo co-op single-family-house double-family-house multi-family-house].freeze

  AMOUNT_SAVED = 360_000
  MONTHLY_PAYMENT = 10_000
  INTEREST_RATE = 0.0699
  LOAN_TERM_MONTHS = 360

  validates :label, :street_address, :status, :price, :bedrooms, :full_bathrooms, :half_bathrooms, :property_type, :date_added, :url, presence: true
  validates :label, uniqueness: true
  validates :status, inclusion: { in: STATUSES }
  validates :property_type, inclusion: { in: PROPERTY_TYPES }

  def adjusted_monthly_payment
    (MONTHLY_PAYMENT - (taxes || 0) - (hoa_fees || 0)).round
  end

  def max_loan
    monthly_rate = INTEREST_RATE / 12
    ((adjusted_monthly_payment * (((1 + monthly_rate)**LOAN_TERM_MONTHS) - 1)) /
      (monthly_rate * ((1 + monthly_rate)**LOAN_TERM_MONTHS))).round
  end

  def can_afford?
    price.present? && AMOUNT_SAVED >= price - max_loan
  end

  def actual_loan
    price - AMOUNT_SAVED
  end

  def amount_needed
    return nil unless price.present?
    price - max_loan - AMOUNT_SAVED
  end

  def actual_monthly_payment
    return MONTHLY_PAYMENT unless can_afford?
    monthly_rate = INTEREST_RATE / 12
    (actual_loan * monthly_rate * ((1 + monthly_rate)**LOAN_TERM_MONTHS) /
      (((1 + monthly_rate)**LOAN_TERM_MONTHS) - 1)).round
  end

end
