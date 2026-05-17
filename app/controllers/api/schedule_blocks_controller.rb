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

  def update
    @schedule_block = ScheduleBlock.find(params[:id])
    if @schedule_block.update(schedule_block_params)
      @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
      render 'index'
    else
      render_errors(@schedule_block)
    end
  end

  def destroy
    ScheduleBlock.find(params[:id]).destroy
    @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
    render 'index'
  end

  def copy
    blocks_to_copy = ScheduleBlock.where(id: params[:ids], user_id: current_user.id)
    target_weekday = params[:weekday]
    failed_block = nil

    ActiveRecord::Base.transaction do
      blocks_to_copy.each do |block|
        duplicate = block.dup
        duplicate.weekday = target_weekday
        unless duplicate.save
          failed_block = duplicate
          raise ActiveRecord::Rollback
        end
      end
    end

    if failed_block
      render_errors(failed_block)
    else
      @schedule_blocks = ScheduleBlock.where(user_id: current_user.id).order(:weekday, :start_time)
      render 'index'
    end
  end

  private

  def schedule_block_params
    params.require(:schedule_block).permit(:weekday, :start_time, :end_time, :color, :text, :schedule_category_id, :schedule_day_variant_id, :normal_day_only)
  end
end
