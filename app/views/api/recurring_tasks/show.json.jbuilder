json.recurringTask do
  json.id @recurring_task.id
  json.text @recurring_task.text
  json.color @recurring_task.color
  json.timeframe @recurring_task.timeframe
  json.recurrence @recurring_task.recurrence
  json.addToEnd @recurring_task.add_to_end
  json.expires @recurring_task.expires
  json.jointUserId @recurring_task.joint_user_id.to_s || ""
  json.jointText @recurring_task.joint_text || ""
  json.active @recurring_task.active
  json.nextOccurrence @recurring_task.next_occurrence.strftime("%m/%d/%Y")
  json.nextOccurrenceNoYear @recurring_task.next_occurrence.strftime("%m/%d")
end
json.users @users do |user|
  json.id user.id
  json.email user.email
end
