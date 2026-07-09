json.tasks do
  json.set! 'patch' do
    json.partial! 'api/tasks/task_flat', tasks: @patch_tasks
  end
end
