class Api::RecurringTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:order)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:order)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:order)
    render 'index.json.jbuilder'
  end

  def create
  end

  def show
    @recurring_tasks = RecurringTask.where(id: params[:id])
    @users = User.where.not(id: current_user.id)
    render 'show.json.jbuilder'
  end

  def update
    @recurring_task = RecurringTask.find(params[:id])
    if @recurring_task.update(recurring_task_params)
      @recurring_tasks = RecurringTask.where(id: params[:id])
      render 'show.json.jbuilder'
    else
      render json: @recurring_task.errors.full_messages, status: 422
    end
  end

  def destroy
    RecurringTask.find(params[:id]).destroy
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:order)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:order)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:order)
    render 'index.json.jbuilder'
  end

  private

  def recurring_task_params
    params[:recurring_task].permit(:text, :color, :timeframe, :recurrence, :add_to_end, :expires, :joint_user_id, :joint_text)
  end

end
