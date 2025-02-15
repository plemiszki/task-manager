class User < ActiveRecord::Base
  include Clearance::User

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]
  REDIS_KEY = "daily-reset-early"

  has_many :tasks, dependent: :destroy
  has_many :future_tasks, dependent: :destroy

  def remove_from_redis!
    redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
    redis.srem(REDIS_KEY, id)
  end
end
