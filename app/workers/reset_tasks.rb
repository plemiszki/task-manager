class ResetTasks
  include Sidekiq::Worker
  include ActionView::Helpers::NumberHelper
  sidekiq_options retry: false

  def perform(job_id, user_id, date)
    job = Job.find_by_job_id(job_id)
    (1...20).each do |i|
      p i
      sleep 1
      job.update!(current_value: i)
    end
    job.update!({
      status: :success,
    })
  end

end
