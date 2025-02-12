class Api::ActionsController < ActionController::Base

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]
  REDIS_KEY = "daily-reset-early"

  include Clearance::Controller

  def reset_tasks_early
    Task.clear_daily_tasks!(user: current_user, date: DateTime.now.in_time_zone('America/New_York').to_date + 1.day)
    redis = create_redis_instance
    redis.sadd(REDIS_KEY, current_user.id)
    render json: { message: 'ok' }
  end

  private

  def create_redis_instance
    Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  end

end
