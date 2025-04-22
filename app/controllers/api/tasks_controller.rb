class Api::TasksController < ActionController::Base
  include Clearance::Controller

  def index
    build_response
  end

  def create
    if task_params[:duplicate_of]
      task_to_copy = Task.find(task_params[:duplicate_of])
      if task_to_copy.existing_copy?
        render_error = true
      else
        task = task_to_copy.dup
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
        Task.rearrange_after_position!(tasks: Task.where(parent_id: task_params[:parent_id]),
                                       position: task_params[:position].to_i)
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
      parent_task.update(expanded: true) unless parent_task.expanded

      # if duplicates exist of the parent task, we need to create duplicates of the new subtask
      if parent_task
        duped_tasks = Task.where(duplicate_id: parent_task.id)
        while duped_tasks.length == 1
          dup_parent_task = duped_tasks.first
          dup_child_task = Task.new(
            user_id: current_user.id,
            timeframe: dup_parent_task.timeframe,
            parent_id: dup_parent_task.id,
            duplicate_id: task.id,
            text: task.text,
            color: task.color,
            position: task_params[:position] || tasks_length
          )
          dup_child_task.save!
          task = dup_child_task
          duped_tasks = Task.where(duplicate_id: dup_parent_task.id)
        end
      end

    else
      timeframe_root_tasks = Task.where(user_id: current_user.id, timeframe: task_params[:timeframe],
                                        parent_id: nil).order(:position)
      if task_params[:position]
        Task.rearrange_after_position!(tasks: timeframe_root_tasks, position: task_params[:position].to_i)
      end
      task = Task.new(
        user_id: current_user.id,
        timeframe: task_params[:timeframe],
        text: "New #{task_params[:timeframe]} task",
        position: task_params[:position] || timeframe_root_tasks.length,
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
      task = Task.find(id)
      original_color = task.color
      if updating_dups
        task.update!(
          complete: params[:task][:complete],
          text: params[:task][:text],
          color: params[:task][:color]
        )
      else
        task_text = params[:task][:text]
        numbered_subtasks_regex = /\$-- (?<text>.*)\$(?<n>\d+)/
        numbered_subtasks_match_data = numbered_subtasks_regex.match(task_text)
        if numbered_subtasks_match_data && task.parent_id
          n = numbered_subtasks_match_data[:n].to_i
          text = numbered_subtasks_match_data[:text]

          # update the text of the "mother" task and all duplicates
          mother_task = task
          mother_task.update_self_and_duplicates!({ text: "#{text}1" })

          # create additional tasks
          current_length = mother_task.siblings.length
          additional_tasks = []
          (n - 1).times do |index|
            additional_task = Task.new(
              task_params.merge({
                                  text: "#{text}#{index + 2}",
                                  position: current_length + index
                                })
            )
            additional_task.user_id = current_user.id
            additional_task.save!
            additional_tasks << additional_task
          end

          # create duplicates of additional tasks for every duplicate of the mother task
          mother_task.duplicates.each do |duplicate_task|
            new_additional_tasks = []
            additional_tasks.each do |additional_task|
              duplicate_additional_task = Task.new(
                task_params.merge({
                                    timeframe: duplicate_task.timeframe,
                                    parent_id: duplicate_task.parent_id,
                                    duplicate_id: additional_task.id,
                                    text: additional_task.text,
                                    position: additional_task.position
                                  })
              )
              duplicate_additional_task.user_id = current_user.id
              duplicate_additional_task.save!
              new_additional_tasks << duplicate_additional_task
            end
            additional_tasks = new_additional_tasks
          end
        else
          task.update(task_params)
          if task.joint_id
            joint_task = Task.find(task.joint_id)
            joint_task.update!(
              complete: params[:task][:complete]
            )
          end
          mark_master_complete(task.duplicate_id, params[:task][:complete]) if task.duplicate_id
          update_subtask_colors(task) if original_color != task.color
        end
      end
      if numbered_subtasks_match_data # <-- if this is a multiple subtask creation, duplicates are dealt with above
        id = nil
      else
        @dup_task = Task.where(duplicate_id: id).first
        id = @dup_task ? @dup_task.id : nil
        updating_dups = true
      end
      check_if_all_siblings_complete(task)
    end

    timeframe = task.timeframe == 'day' && !task.duplicate_id ? 'day' : nil
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
                                      color: task.color
                                    })
      duplicates.each do |duplicate|
        Task.create!({
                       duplicate_id: task_from_item.id,
                       parent_id: duplicate.id,
                       timeframe: duplicate.timeframe,
                       position: current_subtasks_length + index,
                       text: item.text,
                       user_id: current_user.id,
                       color: task.color
                     })
      end
    end
    task.update!(expanded: true) unless list_items.empty?

    build_response
  end

  def convert_to_future
    today = DateTime.now.in_time_zone('America/New_York').to_date
    tomorrow = today + 1.day
    in_three_days = today + 3.days

    task = Task.find(params[:id])
    task.convert_to_future_task!(date: params[:monday] ? in_three_days : tomorrow)
    task.delete
    Task.where(user: current_user, timeframe: task.timeframe,
               parent_id: nil).order(:position).each_with_index do |task, index|
      task.update(position: index)
    end

    build_response
  end

  def move
    task = Task.find(params[:id])
    task.move!(new_timeframe: params[:timeframe])

    build_response
  end

  def move_all
    tasks = Task.find(params[:tasks])
    tasks.each do |task|
      task.move!(new_timeframe: params[:timeframe])
    end

    build_response
  end

  def copy_all
    tasks_to_copy = Task.find(params[:tasks])
    copied_tasks = 0
    tasks_to_copy.each do |task_to_copy|
      next if task_to_copy.existing_copy?
      task = task_to_copy.dup
      task.parent_id = nil
      task.duplicate_id = task_to_copy.id
      task.timeframe = params[:timeframe]
      if task_params[:position]
        adjusted_position = task_params[:position] + copied_tasks
        update_existing_positions(timeframe: task_params[:timeframe], position: adjusted_position)
        task.position = adjusted_position
      else
        task.position = Task.where(user: current_user, timeframe: task_params[:timeframe], parent_id: nil).length
      end
      task.save!
      copied_tasks += 1
      create_duplicate_subtasks(task)
    end

    build_response
  end

  def rearrange(tasks = params[:tasks])
    tasks.each do |index, id|
      task = Task.find(id)
      task.update(position: index)
      next unless task.parent_id

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

    build_rearrange_response(tasks: tasks)
  end

  def destroy
    if params[:id]
      task = Task.find(params[:id])
      timeframe = nil
      if task.timeframe == 'day'
        timeframe = 'day'
      elsif !task.has_dups?
        timeframe = task.timeframe
      end
      Task.delete_task_and_subs_and_dups(task)
      build_response(timeframe: timeframe)
    elsif params[:task_ids]
      Task.find(params[:task_ids]).each do |task|
        Task.delete_task_and_subs_and_dups(task)
      end
      build_response
    end
  end

  def copy_incomplete
    task = Task.find(params[:task_id])
    incomplete_subtasks = task.subtasks.select { |task| !task.complete }
    # TODO abort if a copy of an incomplete subtask exists in a LOWER timeframe than the target
    # (for example, if the user wants to copy a monthly task's subtasks to the weekend, but a copy of one or more substasks already exist for the day)

    timeframe_root_tasks = Task.where(user_id: current_user.id, timeframe: params[:timeframe],
                                      parent_id: nil).order(:position)
    starting_position = timeframe_root_tasks.length
    incomplete_subtasks.each_with_index do |task, index|
      existing_copies = Task.where(
        user_id: current_user.id,
        timeframe: params[:timeframe],
        duplicate_id: task.id,
      )
      unless existing_copies.length > 0
        task = Task.new(
          user_id: current_user.id,
          timeframe: params[:timeframe],
          text: task.text,
          position: starting_position + index,
          color: task.color,
          duplicate_id: task.id
        )
        task.save!
      end
    end
    build_response
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
      tasks = Task.where(timeframe: @timeframe, user_id: current_user.id,
                         parent_id: nil).includes(subtasks: [subtasks: [:subtasks]]).order(:position)
      @tasks = tasks.map(&:serialize)
      render 'index'
    else
      tasks = Task.where(user_id: current_user.id,
                         parent_id: nil).includes(subtasks: [subtasks: [:subtasks]]).order(:position)
      @timeframes = Hash.new { |h, k| h[k] = [] }
      tasks.each do |task|
        @timeframes[task.timeframe] << task.serialize
      end
      render 'api/tasks/all'
    end
  end

  def check_if_all_siblings_complete(task)
    return unless task.parent_id

    tasks = Task.where(parent_id: task.parent_id)
    tasks.each do |task|
      return unless task.complete
    end
    parent_task = Task.find(task.parent_id)
    parent_task.update(complete: true, expanded: false)
    check_if_all_siblings_complete(parent_task)
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
      :duplicate_of
    )
  end
end
