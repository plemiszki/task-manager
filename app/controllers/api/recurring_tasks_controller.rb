class Api::RecurringTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day')
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend')
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Monthly')
    render "index.json.jbuilder"
  end

  def create
    @recurring_task = RecurringTask.new(future_task_params)
    @recurring_task.user_id = current_user.id
    if @recurring_task.save
      @recurring_tasks = RecurringTask.where(user_id: current_user.id)
      render "index.json.jbuilder"
    else
      render json: @recurring_task.errors.full_messages, status: 422
    end
  end

  def destroy
    RecurringTask.find(params[:id]).destroy
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day')
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend')
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Monthly')
    render "index.json.jbuilder"
  end

  private

  def recurring_task_params
    # params.require(:recurring_task).permit(:text, :color, :timeframe, :order, :date, :add_to_end)
  end

end
