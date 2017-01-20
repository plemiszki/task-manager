class Api::TasksController < ActionController::Base

  def index
    render json: Task.where(timeframe: params[:timeframe])
  end

  def create
    @task = Task.new(timeframe: params[:timeframe], parent_id: params[:parent_id], text: "New #{params[:timeframe]} task")
    @task.save!
    # expand parent task if a subtask was just created
    if params[:parent_id]
      @parent_task = Task.find(params[:parent_id])
      @parent_task.update(expanded: true)
    end
    render json: Task.where(timeframe: params[:timeframe])
  end

  def update
    @task = Task.find(params[:task][:id])
    @task.update(task_params)
    render json: Task.where(timeframe: params[:task][:timeframe])
  end

  def delete
    @task = Task.find(params[:id])
    @task.destroy
    render json: Task.where(timeframe: params[:timeframe])
  end

  private

  def task_params
    params.require(:task).permit(:text, :color, :complete, :duplicate_id, :parent_id, :expanded)
  end

end
