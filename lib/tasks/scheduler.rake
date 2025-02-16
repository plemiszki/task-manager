REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]

task :clear_daily_tasks => :environment do
  redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  user_ids_early_reset = redis.smembers("daily-reset-early").map(&:to_i)
  User.all.each do |user|
    next if user_ids_early_reset.include?(user.id)
    ResetTasks.perform_async(nil, user.id, false)
  end
  redis.del('daily-reset-early')
end
