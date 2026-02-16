class Api::ScheduleBlocksController < ActionController::Base
  include Clearance::Controller
  include RenderErrors

  def index
    @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
  end

  def create
    @schedule_block = ScheduleBlock.new(schedule_block_params.merge(user_id: current_user.id))
    if @schedule_block.save
      @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
      render 'index'
    else
      render_errors(@schedule_block)
    end
  end

  private

  def schedule_block_params
    params.require(:schedule_block).permit(:weekday, :start_time, :end_time, :color, :text)
  end
end
