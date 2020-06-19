json.futureTasks @future_tasks do |task|
  json.id task.id
  json.text task.text
  json.date task.date
  json.color task.color
  json.timeframe task.timeframe
  json.addToEnd task.add_to_end
end
