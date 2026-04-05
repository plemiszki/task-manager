class Api::ActionsController < ActionController::Base

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]
  REDIS_KEY = "daily-reset-early"

  include Clearance::Controller

  def reset_tasks_early
    time_started = Time.now.to_s
    job = Job.create!(job_id: time_started, name: "daily reset", first_line: "Deleting Completed/Expired Tasks", second_line: false, current_value: 0, total_value: 0, metadata: {})
    ResetTasks.perform_async(time_started, current_user.id, true)
    redis = create_redis_instance
    redis.sadd(REDIS_KEY, current_user.id)
    render json: { job: job.render_json }
  end

  private

  def create_redis_instance
    Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  end

end
