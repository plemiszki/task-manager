json.tasks do
  json.set! 'day' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['day']
  end
  json.set! 'weekend' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['weekend']
  end
  json.set! 'month' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['month']
  end
  json.set! 'year' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['year']
  end
  json.set! 'life' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['life']
  end
  json.set! 'backlog' do
    json.partial! 'api/tasks/tasks', tasks: @timeframes['backlog']
  end
end
