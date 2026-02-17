class Api::ScheduleDayVariantsController < ActionController::Base
  include Clearance::Controller
  include RenderErrors

  def index
    @schedule_day_variants = ScheduleDayVariant.where(user_id: current_user.id).order(:weekday, :name)
  end

  def create
    @schedule_day_variant = ScheduleDayVariant.new(schedule_day_variant_params.merge(user_id: current_user.id))
    if @schedule_day_variant.save
      @schedule_day_variants = ScheduleDayVariant.where(user_id: current_user.id).order(:weekday, :name)
      render 'index'
    else
      render_errors(@schedule_day_variant)
    end
  end

  def update
    @schedule_day_variant = ScheduleDayVariant.find(params[:id])
    if @schedule_day_variant.update(schedule_day_variant_params)
      @schedule_day_variants = ScheduleDayVariant.where(user_id: current_user.id).order(:weekday, :name)
      render 'index'
    else
      render_errors(@schedule_day_variant)
    end
  end

  def activate
    weekday = params[:weekday].to_i
    ScheduleDayVariant.where(user_id: current_user.id, weekday: weekday).update_all(active: false)
    if params[:id].present?
      ScheduleDayVariant.where(id: params[:id], user_id: current_user.id).update_all(active: true)
    end
    @schedule_day_variants = ScheduleDayVariant.where(user_id: current_user.id).order(:weekday, :name)
    render 'index'
  end

  def destroy
    ScheduleDayVariant.find(params[:id]).destroy
    @schedule_day_variants = ScheduleDayVariant.where(user_id: current_user.id).order(:weekday, :name)
    render 'index'
  end

  private

  def schedule_day_variant_params
    params.require(:schedule_day_variant).permit(:name, :weekday)
  end
end
