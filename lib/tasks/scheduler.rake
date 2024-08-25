REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_TLS_URL"]

task :clear_daily_tasks => :environment do
  Task.clear_daily_tasks!
  redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  redis.del('daily-reset-early')
end
