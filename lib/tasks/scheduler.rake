REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_TLS_URL"]

task :clear_daily_tasks => :environment do
  puts "--- NIGHTLY CLEAR DAILY TASKS!!!! ---"
  redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  user_ids_early_reset = redis.smembers("daily-reset-early")
  User.all.each do |user|
    next if user_ids_early_reset.include?(user.id)
    Task.clear_daily_tasks!(user: user)
  end
  redis.del('daily-reset-early')
end
