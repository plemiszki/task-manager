#!/usr/bin/env ruby
# Fix ScheduleBlock start_time / end_time values that were created when the app
# timezone defaulted to UTC.
#
# Problem: Rails stores `time without time zone` columns in UTC and converts to
# the app timezone on read. When the app was UTC, storing "09:00" meant 9 AM.
# Now that config.time_zone = 'Eastern Time (US & Canada)', Rails shifts those
# UTC values by 5 hours (EST), so 9 AM UTC displays as 4 AM Eastern.
#
# Important: for `time without time zone` columns (no date component), Rails
# always uses a reference date in January to resolve the offset, which means it
# always applies the standard-time offset (EST = UTC-5), never the DST offset.
# Using eastern.now.utc_offset would be wrong during Daylight Saving Time.
#
# Usage:
#   rails runner scripts/fix_schedule_block_times.rb              # dry run (default)
#   rails runner scripts/fix_schedule_block_times.rb --commit     # write to DB
#   rails runner scripts/fix_schedule_block_times.rb --correction # +1h correction only (if full shift already applied)
#   rails runner scripts/fix_schedule_block_times.rb --correction --commit

dry_run    = !ARGV.include?('--commit')
correction = ARGV.include?('--correction')

eastern = ActiveSupport::TimeZone['Eastern Time (US & Canada)']

# Use a January date to always get the standard-time (EST) offset regardless of
# when this script is run. This matches how Rails resolves time-only values.
est_offset_seconds = eastern.parse('2000-01-15 00:00:00').utc_offset  # -18000 (EST = -5h)

# If the full shift (+5h) was already partially applied (+4h was applied instead),
# only add the remaining 1h correction.
shift_seconds = correction ? 3600 : -est_offset_seconds

total = ScheduleBlock.count

puts "Mode               : #{correction ? 'CORRECTION (+1h only)' : 'FULL SHIFT (+5h)'}"
puts "Shift applied      : +#{shift_seconds / 3600}h to each stored time"
puts "Records to update  : #{total}"
puts dry_run ? "Commit             : DRY RUN (pass --commit to write)" : "Commit             : YES"
puts "-" * 50

errors = []

ScheduleBlock.find_each do |block|
  # block.start_time / .end_time are already converted to Eastern by Rails.
  # .utc gives us back the raw UTC value stored in the DB.
  original_start = block.start_time.utc
  original_end   = block.end_time.utc

  new_start = original_start + shift_seconds
  new_end   = original_end   + shift_seconds

  new_start_str = new_start.strftime('%H:%M:%S')
  new_end_str   = new_end.strftime('%H:%M:%S')

  puts "Block ##{block.id} (weekday #{block.weekday}): " \
       "start #{original_start.strftime('%H:%M')} → #{new_start_str}, " \
       "end #{original_end.strftime('%H:%M')} → #{new_end_str}"

  unless dry_run
    # update_columns skips validations/callbacks (intentional for a data migration)
    block.update_columns(start_time: new_start_str, end_time: new_end_str)
  end
rescue => e
  errors << "Block ##{block.id}: #{e.message}"
end

puts "-" * 50
if errors.any?
  puts "ERRORS (#{errors.size}):"
  errors.each { |e| puts "  #{e}" }
end

if dry_run
  puts "Dry run complete. No records were modified. Re-run with --commit to apply."
else
  puts "Done. #{total - errors.size} records updated."
end
