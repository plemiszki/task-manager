class Api::TasksController < ActionController::Base

  include Clearance::Controller

  def index
    build_response
  end

  def create
    if task_params[:duplicate_of]
      if existing_dup?
        render_error = true
      else
        task = Task.find(task_params[:duplicate_of]).dup
        task.parent_id = nil
        task.duplicate_id = task_params[:duplicate_of]
        task.timeframe = task_params[:timeframe]
        if task_params[:position]
          update_existing_positions(timeframe: task_params[:timeframe], position: task_params[:position])
          task.position = task_params[:position]
        else
          task.position = Task.where(user: current_user, timeframe: task_params[:timeframe], parent_id: nil).length
        end
        task.save!
        create_duplicate_subtasks(task)
      end
    elsif task_params[:parent_id]

      # reorder siblings if necessary
      if task_params[:position]
        Task.rearrange_after_position!(tasks: Task.where(parent_id: task_params[:parent_id]), position: task_params[:position].to_i)
      end

      # create the new task
      parent_task = Task.find(task_params[:parent_id])
      tasks_length = Task.where(user_id: current_user.id, parent_id: task_params[:parent_id]).length
      task = Task.new(
        user_id: current_user.id,
        timeframe: parent_task.timeframe,
        parent_id: parent_task.id,
        text: "New #{task_params[:timeframe]} task",
        position: task_params[:position] || tasks_length,
        color: parent_task.color
      )
      task.save!

      # expand parent task if necessary
      unless parent_task.expanded
        parent_task.update(expanded: true)
      end

      # if duplicates exist of the parent task, we need to create duplicates of the new subtask
      if parent_task
        duped_tasks = Task.where(duplicate_id: parent_task.id)
        while duped_tasks.length == 1
          dup_parent_task = duped_tasks.first
          dup_child_task = Task.new(user_id: current_user.id, timeframe: dup_parent_task.timeframe, parent_id: dup_parent_task.id, duplicate_id: task.id, text: task.text, color: task.color, position: task_params[:position] || tasks_length)
          dup_child_task.save!
          task = dup_child_task
          duped_tasks = Task.where(duplicate_id: dup_parent_task.id)
        end
      end

    else
      timeframe_root_tasks = Task.where(user_id: current_user.id, timeframe: task_params[:timeframe], parent_id: nil).order(:position)
      if task_params[:position]
        Task.rearrange_after_position!(tasks: timeframe_root_tasks, position: task_params[:position].to_i)
      end
      task = Task.new(
        user_id: current_user.id,
        timeframe: task_params[:timeframe],
        text: "New #{task_params[:timeframe]} task",
        position: (task_params[:position] || timeframe_root_tasks.length),
        color: task_params[:color]
      )
      task.save!
    end

    if render_error
      render json: [], status: 422
    else
      build_response(timeframe: (task_params[:duplicate_of] || task_params[:parent_id] ? nil : task.timeframe))
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
        task_text = params[:task][:text]
        numbered_subtasks_regex = /\$-- (?<text>.*)\$(?<n>\d+)/
        numbered_subtasks_match_data = numbered_subtasks_regex.match(task_text)
        if numbered_subtasks_match_data && @task.parent_id
          n = numbered_subtasks_match_data[:n].to_i
          text = numbered_subtasks_match_data[:text]
          duplicates = @task.duplicates
          @task.update(task_params.merge({ text: "#{text}1" }))
          duplicates.each do |duplicate|
            duplicate.update({ text: "#{text}1" })
          end
          current_length = @task.parent.subtasks.length
          (n - 1).times do |index|
            extra_task = Task.new(task_params.merge({ text: "#{text}#{index + 2}", position: current_length + index }))
            extra_task.user_id = current_user.id
            extra_task.save!
            duplicates.each do |duplicate|
              duplicate_extra_task = Task.new(task_params.merge({ timeframe: duplicate.timeframe, duplicate_id: extra_task.id ,parent_id: duplicate.parent_id, text: "#{text}#{index + 2}", position: current_length + index }))
              duplicate_extra_task.user_id = current_user.id
              duplicate_extra_task.save!
            end
          end
        else
          @task.update(task_params)
          if @task.joint_id
            joint_task = Task.find(@task.joint_id)
            joint_task.update!(
              complete: params[:task][:complete]
            )
          end
          if @task.duplicate_id
            mark_master_complete(@task.duplicate_id, params[:task][:complete])
          end
          update_subtask_colors(@task) if (original_color != @task.color)
        end
      end
      if numbered_subtasks_match_data # <-- if this is a multiple subtask creation, duplicates are dealt with above
        id = nil
      else
        check_if_all_siblings_complete(@task)
        @dup_task = Task.where(duplicate_id: id).first
        id = @dup_task ? @dup_task.id : nil
        updating_dups = true
      end
    end

    timeframe = (@task.timeframe == 'day' && !@task.duplicate_id) ? 'day' : nil
    build_response(timeframe: timeframe)
  end

  def add_subtasks_from_list
    task = Task.find(params[:task_id])
    duplicates = task.duplicates
    current_subtasks_length = task.subtasks.length
    list = List.find(params[:list_id])
    list_items = list.items
    list_items.each_with_index do |item, index|
      task_from_item = Task.create!({
        parent_id: task.id,
        user_id: current_user.id,
        timeframe: task.timeframe,
        position: current_subtasks_length + index,
        text: item.text,
        color: task.color,
      })
      duplicates.each do |duplicate|
        Task.create!({
          duplicate_id: task_from_item.id,
          parent_id: duplicate.id,
          timeframe: duplicate.timeframe,
          position: current_subtasks_length + index,
          text: item.text,
          user_id: current_user.id,
          color: task.color,
        })
      end
    end
    task.update!(expanded: true) unless list_items.empty?

    build_response
  end

  def convert_to_future
    task = Task.find(params[:id])
    task.convert_to_future_task!
    task.delete
    Task.where(user: current_user, timeframe: task.timeframe, parent_id: nil).order(:position).each_with_index do |task, index|
      task.update(position: index)
    end

    build_response
  end

  def move
    task = Task.find(params[:id])
    siblings = Task.where(user: current_user, timeframe: task.timeframe, parent_id: nil).order(:position)
    task.update!(
      timeframe: params[:timeframe],
      position: Task.where(user: current_user, timeframe: params[:timeframe], parent_id: nil).length
    )
    task.subtasks.update_all(timeframe: params[:timeframe])
    siblings.each_with_index do |task, index|
      task.update(position: index)
    end

    build_response
  end

  def rearrange(tasks = params[:tasks])
    tasks.each do |index, id|
      task = Task.find(id)
      task.update(position: index)
      if task.parent_id
        duped_parents = Task.where(duplicate_id: task.parent_id)
        until duped_parents.empty?
          duped_task = Task.where(duplicate_id: task.id).first
          duped_task.update(position: index)

          duped_parents = Task.where(duplicate_id: duped_task.parent_id)
          task = duped_task
        end
        master_parents = Task.where(id: task.parent.duplicate_id)
        until master_parents.empty?
          master_task = Task.where(id: task.duplicate_id).first
          master_task.update(position: index)

          master_parents = Task.where(id: master_task.parent.duplicate_id)
          task = master_task
        end
      end
    end

    build_rearrange_response(tasks: tasks)
  end

  def destroy
    @task = Task.find(params[:id])
    timeframe = nil
    if @task.timeframe == 'day'
      timeframe = 'day'
    elsif !@task.has_dups?
      timeframe = @task.timeframe
    end
    Task.delete_task_and_subs_and_dups(@task)
    build_response(timeframe: timeframe)
  end

  private

  def build_rearrange_response(tasks:)
    sample_task = Task.find(tasks['0'])
    if sample_task.parent_id
      parent = sample_task.parent
      if parent.duplicate_id || parent.has_dups?
        build_response
      else
        build_response(timeframe: sample_task.timeframe)
      end
    else
      build_response(timeframe: sample_task.timeframe)
    end
  end

  def update_existing_positions(timeframe:, position:)
    tasks = Task.where(user: current_user, timeframe: timeframe, parent_id: nil).order(:position).to_a
    tasks.insert(position.to_i, nil)
    tasks.each_with_index do |task, index|
      next if task.nil?
      task.update!(position: index)
    end
  end

  def build_response(timeframe: nil)
    if timeframe
      @timeframe = timeframe
      tasks = Task.where(timeframe: @timeframe, user_id: current_user.id, parent_id: nil).includes(subtasks: [subtasks: [:subtasks]]).order(:position)
      @tasks = tasks.map(&:serialize)
      render 'index'
    else
      tasks = Task.where(user_id: current_user.id, parent_id: nil).includes(subtasks: [subtasks: [:subtasks]]).order(:position)
      @timeframes = Hash.new { |h, k| h[k] = [] }
      tasks.each do |task|
        @timeframes[task.timeframe] << task.serialize
      end
      render 'api/tasks/all'
    end
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

  def existing_dup?
    master_task = Task.find(task_params[:duplicate_of])
    return true if Task.exists?(duplicate_id: master_task.id)
    tasks_queue = master_task.subtasks.to_a
    ids = []
    until tasks_queue.empty?
      ids << tasks_queue.first.id
      tasks_queue += tasks_queue.first.subtasks.to_a
      tasks_queue.shift
    end
    ids.each do |id|
      return true if Task.exists?(duplicate_id: master_task.id)
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
        position: master_queue.first.position,
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
    params.require(:task).permit(
      :text,
      :color,
      :complete,
      :duplicate_id,
      :parent_id,
      :expanded,
      :timeframe,
      :position,
      :duplicate_of,
    )
  end

end
