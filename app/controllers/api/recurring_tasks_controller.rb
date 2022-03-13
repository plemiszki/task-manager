class Api::RecurringTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:position)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:position)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:position)
    @users = User.where.not(id: current_user.id)
  end

  def create
    current_length = RecurringTask.where(user_id: current_user.id, timeframe: recurring_task_params[:timeframe]).length
    @recurring_task = RecurringTask.new(recurring_task_params.merge({ position: current_length }))
    @recurring_task.user_id = current_user.id
    if @recurring_task.save
      @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:position)
      @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:position)
      @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:position)
      @users = User.where.not(id: current_user.id)
      render 'index'
    else
      render json: @recurring_task.errors.full_messages, status: 422
    end
  end

  def show
    @recurring_task = RecurringTask.find(params[:id])
    @users = User.where.not(id: current_user.id)
    render 'show'
  end

  def update
    @recurring_task = RecurringTask.find(params[:id])
    if @recurring_task.update(recurring_task_params)
      render 'show'
    else
      render json: @recurring_task.errors.full_messages, status: 422
    end
  end

  def destroy
    recurring_task = RecurringTask.find(params[:id])
    recurring_task.destroy
    other_recurring_tasks = RecurringTask.where(user_id: recurring_task.user_id, timeframe: recurring_task.timeframe).order(:position).each_with_index do |rt, i|
      rt.update(position: i)
    end
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:position)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:position)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:position)
    render 'index'
  end

  def rearrange
    record_ids = RecurringTask.where(user_id: current_user.id, timeframe: params[:timeframe]).pluck(:id).sort
    param_ids = params[:new_order].to_unsafe_h.values.map(&:to_i).sort
    if record_ids != param_ids
      if (record_ids - param_ids).count > 0
        render json: { message: "ERROR: Missing IDs in request: #{record_ids - param_ids}" }, status: 422
      else
        render json: { message: "ERROR: Extra IDs in request: #{param_ids - record_ids}" }, status: 422
      end
      return
    end

    params[:new_order].each do |index, id|
      recurring_task = RecurringTask.find(id)
      recurring_task.update(position: index)
    end
    @daily_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Day').order(:position)
    @weekend_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Weekend').order(:position)
    @monthly_recurring_tasks = RecurringTask.where(user_id: current_user.id, timeframe: 'Month').order(:position)
    render 'index'
  end

  private

  def recurring_task_params
    params[:recurring_task].permit(:text, :color, :timeframe, :recurrence, :add_to_end, :expires, :joint_user_id, :joint_text, :position, :active)
  end

end
