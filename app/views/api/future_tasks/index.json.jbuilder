json.tasks @future_tasks do |task|
  json.id task.id
  json.text task.text
  json.date task.date
  json.color task.color
  json.timeframe task.timeframe
end
