class Api::UserController < ActionController::Base

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]

  include Clearance::Controller

  def show
    redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
    render json: { user: current_user, resetEarly: redis.smembers("daily-reset-early").include?(current_user.id.to_s) }
  end

  def update
    current_user.update(user_params)
    render json: { user: current_user }
  end

  private

  def user_params
    params.require(:user).permit(:long_weekend)
  end

end
