class Api::FutureTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @future_tasks = FutureTask.where(user_id: current_user.id).order(:date)
    render "index.json.jbuilder"
  end

  def create
    @future_task = FutureTask.new(future_task_params)
    @future_task.user_id = current_user.id
    if @future_task.save
      @future_tasks = FutureTask.where(user_id: current_user.id).order(:date)
      render "index.json.jbuilder"
    else
      render json: @future_task.errors.full_messages, status: 422
    end
  end

  def destroy
    FutureTask.find(params[:id]).destroy
    @future_tasks = FutureTask.where(user_id: current_user.id).order(:date)
    render "index.json.jbuilder"
  end

  private

  def future_task_params
    params.require(:future_task).permit(:text, :color, :timeframe, :order, :date, :add_to_end)
  end

end
