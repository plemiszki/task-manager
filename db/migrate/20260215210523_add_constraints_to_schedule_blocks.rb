class AddConstraintsToScheduleBlocks < ActiveRecord::Migration[8.1]
  def change
    enable_extension 'btree_gist'

    change_column_null :schedule_blocks, :user_id, false

    reversible do |dir|
      dir.up do
        execute "CREATE TYPE timerange AS RANGE (subtype = time);"
        execute <<-SQL
          ALTER TABLE schedule_blocks
          ADD CONSTRAINT no_overlapping_schedule_blocks
          EXCLUDE USING gist (
            user_id WITH =,
            weekday WITH =,
            timerange(start_time, end_time) WITH &&
          );
        SQL
      end

      dir.down do
        execute "ALTER TABLE schedule_blocks DROP CONSTRAINT no_overlapping_schedule_blocks;"
        execute "DROP TYPE timerange;"
      end
    end
  end
end
