class Api::TasksController < ActionController::Base

  def index
    render json: Task.where(timeframe: params[:timeframe]).order(:order)
  end

  def create
    tasks_length = Task.where(timeframe: params[:timeframe], parent_id: params[:parent_id]).length
    @task = Task.new(timeframe: params[:timeframe], parent_id: params[:parent_id], text: "New #{params[:timeframe]} task", order: tasks_length)
    @task.save!
    # expand parent task if a subtask was just created
    if params[:parent_id]
      @parent_task = Task.find(params[:parent_id])
      @parent_task.update(expanded: true)
    end
    render json: Task.where(timeframe: params[:timeframe]).order(:order)
  end

  def update
    @task = Task.find(params[:task][:id])
    @task.update(task_params)
    render json: Task.where(timeframe: params[:task][:timeframe]).order(:order)
  end

  def rearrange
    @tasks = params[:tasks]
    @tasks.each do |index, id|
      task = Task.find(id)
      task.update(order: index)
    end
    render json: Task.where(timeframe: params[:timeframe]).order(:order)
  end

  def delete
    @task = Task.find(params[:id])
    task_parent_id = @task.parent_id
    @task.destroy
    Task.where(timeframe: params[:timeframe], parent_id: task_parent_id).order(:order).each_with_index do |task, index|
      task.update(order: index)
    end
    render json: Task.where(timeframe: params[:timeframe]).order(:order)
  end

  private

  def task_params
    params.require(:task).permit(:text, :color, :complete, :duplicate_id, :parent_id, :expanded)
  end

end
