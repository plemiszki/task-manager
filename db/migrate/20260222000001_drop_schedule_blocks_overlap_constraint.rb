class DropScheduleBlocksOverlapConstraint < ActiveRecord::Migration[8.1]
  def up
    execute "ALTER TABLE schedule_blocks DROP CONSTRAINT no_overlapping_schedule_blocks"
  end

  def down
    execute <<~SQL
      ALTER TABLE schedule_blocks
        ADD CONSTRAINT no_overlapping_schedule_blocks
        EXCLUDE USING gist (
          user_id WITH =,
          weekday WITH =,
          public.timerange(start_time, end_time) WITH &&
        )
    SQL
  end
end
