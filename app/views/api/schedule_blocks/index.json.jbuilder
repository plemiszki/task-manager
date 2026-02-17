json.scheduleBlocks @schedule_blocks do |block|
  json.id block.id
  json.weekday block.weekday
  json.startTime block.start_time.strftime("%H:%M")
  json.endTime block.end_time.strftime("%H:%M")
  json.color block.color
  json.text block.text
  json.scheduleCategoryId block.schedule_category_id
end
