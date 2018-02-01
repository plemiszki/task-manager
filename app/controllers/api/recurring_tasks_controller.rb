class Api::RecurringTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:order)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:order)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:order)
    render "index.json.jbuilder"
  end

  def create
  end

  def destroy
    RecurringTask.find(params[:id]).destroy
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:order)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:order)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:order)
    render "index.json.jbuilder"
  end

  private

  def recurring_task_params
  end

end
