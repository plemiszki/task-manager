class Api::PropertyConfigController < ActionController::Base

  include Clearance::Controller

  REDIS_URL = Rails.env == 'development' ? 'redis://localhost:6379' : ENV['REDIS_URL']

  FIELD_KEYS = {
    'monthlyPayment' => 'property:monthly_payment',
    'interestRate'   => 'property:interest_rate',
    'amountSaved'    => 'property:amount_saved',
  }.freeze

  PROPERTY_FIELD_KEYS = {
    'ourOffer' => ->(id) { "property:#{id}:our_offer" },
  }.freeze

  def destroy
    key_fn = PROPERTY_FIELD_KEYS[params[:field]]
    return render json: { error: 'Invalid field' }, status: :unprocessable_entity unless key_fn
    return render json: { error: 'Missing property_id' }, status: :unprocessable_entity unless params[:property_id].present?

    redis.del(key_fn.call(params[:property_id]))
    render json: {}, status: :ok
  end

  def update
    if PROPERTY_FIELD_KEYS.key?(params[:field])
      return render json: { error: 'Missing property_id' }, status: :unprocessable_entity unless params[:property_id].present?
      redis.set(PROPERTY_FIELD_KEYS[params[:field]].call(params[:property_id]), params[:value].to_s)
      return render json: {}, status: :ok
    end

    redis_key = FIELD_KEYS[params[:field]]
    return render json: { error: 'Invalid field' }, status: :unprocessable_entity unless redis_key

    redis.set(redis_key, params[:value].to_s)
    Property.reload_config!
    render json: {}, status: :ok
  end

  private

  def redis
    Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  end

end
