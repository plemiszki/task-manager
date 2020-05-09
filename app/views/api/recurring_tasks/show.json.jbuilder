json.recurringTasks @recurring_tasks do |recurringTask|
  json.id recurringTask.id
  json.text recurringTask.text
  json.color recurringTask.color
  json.timeframe recurringTask.timeframe
  json.recurrence recurringTask.recurrence
  json.addToEnd recurringTask.add_to_end
  json.expires recurringTask.expires
  json.jointUserId recurringTask.joint_user_id.to_s || ""
  json.jointText recurringTask.joint_text || ""
  json.active recurringTask.active
end
json.users @users do |user|
  json.id user.id
  json.email user.email
end
