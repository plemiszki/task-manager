class Api::TasksController < ActionController::Base

  include Clearance::Controller

  def index
    render json: Task.where(user_id: current_user.id).order(:order)
  end

  def create
    if params[:task]
      if existing_dup?
        render json: [], status: 422
      else
        @task = Task.new(task_params)
        @task.user_id = current_user.id
        @task.save!
        create_duplicate_subtasks(@task)
        rearrange(params[:new_order] || {})
      end
    else
      tasks_length = Task.where(timeframe: params[:timeframe], parent_id: params[:parent_id]).length
      @task = Task.new(user_id: current_user.id, timeframe: params[:timeframe], parent_id: params[:parent_id], text: "New #{params[:timeframe]} task", order: tasks_length)

      # assign the proper color
      color = "210, 206, 200"
      if params[:parent_id]
        @parent_task = Task.find(params[:parent_id])
        color = @parent_task.color
      end
      @task.color = color
      @task.save!

      # expand parent task if a subtask was just created
      if @parent_task && !@parent_task.expanded
        @parent_task.update(expanded: true)
      end

      # if a subtask was added, and duplicates exist of the parent task, we need to create duplicates for the subtask
      if @parent_task
        duped_tasks = Task.where(duplicate_id: @parent_task.id)
        while duped_tasks.length == 1
          @dup_parent_task = duped_tasks.first
          @dup_child_task = Task.new(user_id: current_user.id, timeframe: @dup_parent_task.timeframe, parent_id: @dup_parent_task.id, duplicate_id: @task.id, text: @task.text, color: @task.color, order: tasks_length)
          @dup_child_task.save!

          @task = @dup_child_task
          duped_tasks = Task.where(duplicate_id: @dup_parent_task.id)
        end
      end

      render json: Task.where(user_id: current_user.id).order(:order)
    end
  end

  def update
    id = params[:task][:id]
    updating_dups = false
    while id
      @task = Task.find(id)
      original_color = @task.color
      if updating_dups
        @task.update!(
          complete: params[:task][:complete],
          text: params[:task][:text],
          color: params[:task][:color]
        )
      else
        @task.update(task_params)
        if @task.duplicate_id
          mark_master_complete(@task.duplicate_id, params[:task][:complete])
        end
        update_subtask_colors(@task) if (original_color != @task.color)
      end
      check_if_all_siblings_complete(@task)
      @dup_task = Task.where(duplicate_id: id).first
      id = @dup_task ? @dup_task.id : nil
      updating_dups = true
    end
    render json: Task.where(user_id: current_user.id).order(:order)
  end

  def rearrange(tasks = params[:tasks])
    tasks.each do |index, id|
      task = Task.find(id)
      task.update(order: index)
      if task.parent_id
        duped_parents = Task.where(duplicate_id: task.parent_id)
        until duped_parents.empty?
          duped_task = Task.where(duplicate_id: task.id).first
          duped_task.update(order: index)

          duped_parents = Task.where(duplicate_id: duped_task.parent_id)
          task = duped_task
        end
        master_parents = Task.where(id: task.parent.duplicate_id)
        until master_parents.empty?
          master_task = Task.where(id: task.duplicate_id).first
          master_task.update(order: index)

          master_parents = Task.where(id: master_task.parent.duplicate_id)
          task = master_task
        end
      end
    end
    render json: Task.where(user_id: current_user.id).order(:order)
  end

  def delete
    @task = Task.find(params[:id])
    Task.delete_task_and_subs_and_dups(@task)
    render json: Task.where(user_id: current_user.id).order(:order)
  end

  def daily
    Task.clear_daily_tasks
  end

  private

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

  def existing_dup?
    master_task = Task.find_by(id: params[:task][:duplicate_id])
    return true if Task.find_by(duplicate_id: master_task.id)
    tasks_queue = master_task.subtasks.to_a
    ids = []
    until tasks_queue.empty?
      ids << tasks_queue.first.id
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue.shift
    end
    ids.each do |id|
      return true if Task.find_by(duplicate_id: id)
    end
    false
  end

  def create_duplicate_subtasks(task)
    master_task = task.master
    master_queue = master_task.subtasks.to_a
    until master_queue.empty?
      master_queue += master_queue.first.subtasks.to_a
      @subtask = Task.new(
        user_id: current_user.id,
        timeframe: task.timeframe,
        duplicate_id: master_queue.first.id,
        parent_id: Task.find(master_queue.first.parent_id).duplicates[0].id,
        text: master_queue.first.text,
        complete: master_queue.first.complete,
        expanded: false,
        color: master_queue.first.color,
        order: master_queue.first.order,
        template: master_queue.first.template
      )
      @subtask.save!
      master_queue.shift
    end
  end

  def mark_master_complete(id, complete)
    while id
      task = Task.find(id)
      task.update!(complete: complete)
      check_if_all_siblings_complete(task)
      id = task.duplicate_id
    end
  end

  def update_subtask_colors(task)
    tasks_queue = task.subtasks.to_a
    ids = []
    until tasks_queue.empty?
      ids << tasks_queue.first.id
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue += tasks_queue.first.duplicates.to_a
      tasks_queue.shift
    end
    Task.where(id: ids).update_all(color: task.color)
  end

  def task_params
    params.require(:task).permit(:text, :color, :complete, :duplicate_id, :parent_id, :expanded, :timeframe, :order)
  end

end
