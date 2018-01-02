class Api::FutureTasksController < ActionController::Base

  include Clearance::Controller

  def index
    @future_tasks = FutureTask.where(user_id: current_user.id)
    render "index.json.jbuilder"
  end

  # def create
  #   if params[:task]
  #     if existing_dup?
  #       render json: [], status: 422
  #     else
  #       @task = Task.new(task_params)
  #       @task.user_id = current_user.id
  #       @task.save!
  #       create_duplicate_subtasks(@task)
  #       rearrange(params[:new_order] || {})
  #     end
  #   else
  #     tasks_length = Task.where(user_id: current_user.id, timeframe: params[:timeframe], parent_id: params[:parent_id]).length
  #     @task = Task.new(user_id: current_user.id, timeframe: params[:timeframe], parent_id: params[:parent_id], text: "New #{params[:timeframe]} task", order: tasks_length)
  #
  #     # assign the proper color
  #     color = "210, 206, 200"
  #     if params[:parent_id]
  #       @parent_task = Task.find(params[:parent_id])
  #       color = @parent_task.color
  #     end
  #     @task.color = color
  #     @task.save!
  #
  #     # expand parent task if a subtask was just created
  #     if @parent_task && !@parent_task.expanded
  #       @parent_task.update(expanded: true)
  #     end
  #
  #     # if a subtask was added, and duplicates exist of the parent task, we need to create duplicates for the subtask
  #     if @parent_task
  #       duped_tasks = Task.where(duplicate_id: @parent_task.id)
  #       while duped_tasks.length == 1
  #         @dup_parent_task = duped_tasks.first
  #         @dup_child_task = Task.new(user_id: current_user.id, timeframe: @dup_parent_task.timeframe, parent_id: @dup_parent_task.id, duplicate_id: @task.id, text: @task.text, color: @task.color, order: tasks_length)
  #         @dup_child_task.save!
  #
  #         @task = @dup_child_task
  #         duped_tasks = Task.where(duplicate_id: @dup_parent_task.id)
  #       end
  #     end
  #
  #     render json: Task.where(user_id: current_user.id).order(:order)
  #   end
  # end

  def destroy
    FutureTask.find(params[:id]).destroy
    @future_tasks = FutureTask.where(user_id: current_user.id)
    render "index.json.jbuilder"
  end

  private

  def future_task_params
    params.require(:future_task).permit(:text, :color, :timeframe, :order)
  end

end
