json.dailyTasks @daily_recurring_tasks do |task|
  json.id task.id
  json.text task.text
  json.recurrence convert(task)
  json.color task.color
  json.expires task.expires
  json.addToEnd task.add_to_end
  json.position task.position
  json.jointUserId task.joint_user_id
  json.active task.active
end
json.weekendTasks @weekend_recurring_tasks do |task|
  json.id task.id
  json.text task.text
  json.recurrence convert(task)
  json.color task.color
  json.expires task.expires
  json.addToEnd task.add_to_end
  json.position task.position
  json.jointUserId task.joint_user_id
  json.active task.active
end
json.monthlyTasks @monthly_recurring_tasks do |task|
  json.id task.id
  json.text task.text
  json.recurrence convert(task)
  json.color task.color
  json.expires task.expires
  json.addToEnd task.add_to_end
  json.position task.position
  json.jointUserId task.joint_user_id
  json.active task.active
end
json.users @users do |user|
  json.id user.id
  json.email user.email
end
