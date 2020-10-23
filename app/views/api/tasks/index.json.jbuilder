json.tasks do
  json.set! @timeframe do
    json.partial! 'api/tasks/tasks', tasks: @tasks
  end
end
