class Api::ScheduleCategoriesController < ActionController::Base
  include Clearance::Controller
  include RenderErrors

  def index
    @schedule_categories = ScheduleCategory.where(user_id: current_user.id).order(:name)
  end

  def create
    @schedule_category = ScheduleCategory.new(schedule_category_params.merge(user_id: current_user.id))
    if @schedule_category.save
      @schedule_categories = ScheduleCategory.where(user_id: current_user.id).order(:name)
      render 'index'
    else
      render_errors(@schedule_category)
    end
  end

  def update
    @schedule_category = ScheduleCategory.find(params[:id])
    if @schedule_category.update(schedule_category_params)
      @schedule_categories = ScheduleCategory.where(user_id: current_user.id).order(:name)
      render 'index'
    else
      render_errors(@schedule_category)
    end
  end

  def destroy
    ScheduleCategory.find(params[:id]).destroy
    @schedule_categories = ScheduleCategory.where(user_id: current_user.id).order(:name)
    render 'index'
  end

  private

  def schedule_category_params
    params.require(:schedule_category).permit(:name)
  end
end
