class Api::ActionsController < ActionController::Base

  include Clearance::Controller

  def clear_daily_tasks
    Task.clear_daily_tasks
    render json: { message: 'ok '}
  end

end
