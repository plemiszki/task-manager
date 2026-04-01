#!/usr/bin/env ruby
# Fix ScheduleBlock start_time / end_time values that were created when the app
# timezone defaulted to UTC.
#
# Problem: Rails stores `time without time zone` columns in UTC and converts to
# the app timezone on read. When the app was UTC, storing "09:00" meant 9 AM.
# Now that config.time_zone = 'Eastern Time (US & Canada)', Rails shifts those
# UTC values by -4/-5 hours, so 9 AM UTC displays as 4 AM (or 5 AM) Eastern.
#
# Fix: shift every stored UTC time forward by the Eastern offset so that after
# the UTC→Eastern conversion the original intended time is restored.
#
# Usage:
#   rails runner scripts/fix_schedule_block_times.rb            # dry run (default)
#   rails runner scripts/fix_schedule_block_times.rb --commit   # write to DB

dry_run = !ARGV.include?('--commit')

eastern = ActiveSupport::TimeZone['Eastern Time (US & Canada)']

# Use today to determine whether we're currently in EST (-5h) or EDT (-4h).
# Since ScheduleBlock holds repeating weekly times (no date), there is an
# inherent ambiguity around DST transitions.  The offset used here is the
# one active on the day you run this script, so run it when standard/daylight
# time matches what you want going forward, or adjust OFFSET_HOURS manually.
offset_seconds = eastern.now.utc_offset   # e.g. -18000 (EST) or -14400 (EDT)
offset_hours   = offset_seconds / 3600    # e.g. -5 or -4

total = ScheduleBlock.count

puts "Eastern UTC offset : #{offset_hours}h (#{offset_hours == -5 ? 'EST' : 'EDT'})"
puts "Shift applied      : +#{-offset_hours}h to each stored time"
puts "Records to update  : #{total}"
puts dry_run ? "Mode               : DRY RUN (pass --commit to write)" : "Mode               : COMMIT"
puts "-" * 50

errors = []

ScheduleBlock.find_each do |block|
  # block.start_time / block.end_time are already converted to Eastern by Rails.
  # Calling .utc gives us back the raw value stored in the DB (the original UTC time,
  # which was the intended local time when the app timezone was UTC).
  original_start = block.start_time.utc
  original_end   = block.end_time.utc

  # Subtract the (negative) offset to shift the stored time forward so that
  # after Rails applies the UTC→Eastern conversion the result equals original.
  # e.g. offset_seconds = -18000  →  new = original - (-18000) = original + 5h
  new_start = original_start - offset_seconds
  new_end   = original_end   - offset_seconds

  new_start_str = new_start.strftime('%H:%M:%S')
  new_end_str   = new_end.strftime('%H:%M:%S')

  puts "Block ##{block.id} (weekday #{block.weekday}): " \
       "start #{original_start.strftime('%H:%M')} UTC → #{new_start_str} UTC, " \
       "end #{original_end.strftime('%H:%M')} UTC → #{new_end_str} UTC"

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
