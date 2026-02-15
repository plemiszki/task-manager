class Api::ScheduleBlocksController < ActionController::Base
  include Clearance::Controller
  include RenderErrors

  def index
    @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
  end
end
