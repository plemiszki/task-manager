class Api::PropertyConfigController < ActionController::Base

  include Clearance::Controller

  REDIS_URL = Rails.env == 'development' ? 'redis://localhost:6379' : ENV['REDIS_URL']

  FIELD_KEYS = {
    'monthlyPayment' => 'property:monthly_payment',
    'interestRate'   => 'property:interest_rate',
    'amountSaved'    => 'property:amount_saved',
  }.freeze

  def update
    redis_key = FIELD_KEYS[params[:field]]
    return render json: { error: 'Invalid field' }, status: :unprocessable_entity unless redis_key

    redis.set(redis_key, params[:value].to_s)
    render json: {}, status: :ok
  end

  private

  def redis
    Redis.new(url: REDIS_URL)
  end

end
