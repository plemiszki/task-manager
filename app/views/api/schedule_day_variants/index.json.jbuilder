json.scheduleDayVariants @schedule_day_variants do |variant|
  json.id variant.id
  json.name variant.name
  json.weekday variant.weekday
end
