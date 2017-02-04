class Api::TasksController < ActionController::Base

  def index
    render json: Task.all.order(:order)
  end

  def create
    if params[:task]
      @task = Task.new(task_params)
      @task.order = Task.where(timeframe: params[:timeframe], parent_id: nil).length
      @task.save!
    else
      tasks_length = Task.where(timeframe: params[:timeframe], parent_id: params[:parent_id]).length
      @task = Task.new(timeframe: params[:timeframe], parent_id: params[:parent_id], text: "New #{params[:timeframe]} task", order: tasks_length)
      @task.save!
      # expand parent task if a subtask was just created
      if params[:parent_id]
        @parent_task = Task.find(params[:parent_id])
        @parent_task.update(expanded: true)
      end
    end
    render json: Task.all.order(:order)
  end

  def update
    @task = Task.find(params[:task][:id])
    @task.update(task_params)
    check_if_all_siblings_complete(@task)
    if @task.complete && @task.duplicate_id
      mark_dups_complete(@task.duplicate_id)
    end
    render json: Task.all.order(:order)
  end

  def rearrange
    @tasks = params[:tasks]
    @tasks.each do |index, id|
      task = Task.find(id)
      task.update(order: index)
    end
    render json: Task.all.order(:order)
  end

  def delete
    id = params[:id]
    timeframe = params[:timeframe]
    while id
      @task = Task.find(id)
      @task.destroy

      siblings = Task.where(timeframe: @task.timeframe, parent_id: @task.parent_id).order(:order)
      # close parent task if no siblings left
      if @task.parent_id && siblings.length == 0
        Task.find(@task.parent_id).update(expanded: false)
      end
      # reassign order to siblings
      siblings.each_with_index do |task, index|
        task.update(order: index)
      end

      # now let's start it all again if there's a duplicate
      @dup_task = Task.where(duplicate_id: id).first
      id = @dup_task ? @dup_task.id : nil
    end
    render json: Task.all.order(:order)
  end

  private

  def mark_dups_complete(id)
    while id
      @task = Task.find(id)
      @task.update!(complete: true)
      id = @task.duplicate_id
    end
    check_if_all_siblings_complete(@task)
  end

  def check_if_all_siblings_complete(task)
    return if !task.parent_id
    tasks = Task.where(parent_id: task.parent_id)
    tasks.each do |task|
      return if !task.complete
    end
    parent_task = Task.find(task.parent_id)
    parent_task.update(complete: true, expanded: false)
    check_if_all_siblings_complete(parent_task)
  end

  def task_params
    params.require(:task).permit(:text, :color, :complete, :duplicate_id, :parent_id, :expanded, :timeframe)
  end

end
