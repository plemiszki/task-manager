task :clear_daily_tasks => :environment do
  puts "woo"
  Task.clear_daily_tasks
  puts "done"
end
