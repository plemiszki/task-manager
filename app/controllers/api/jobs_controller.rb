class Api::JobsController < ActionController::Base

  def show
    job = Job.find(params[:id])
    render json: { job: job.render_json }
  end

end
