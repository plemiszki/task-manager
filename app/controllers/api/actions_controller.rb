class Api::ActionsController < ActionController::Base

  include Clearance::Controller

  def clear_daily_tasks
    Task.clear_daily_tasks!(date: DateTime.now.in_time_zone('America/New_York') + 1.day)
    render json: { message: 'ok '}
  end

end
