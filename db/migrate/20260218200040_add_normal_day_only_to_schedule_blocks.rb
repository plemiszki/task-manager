class AddNormalDayOnlyToScheduleBlocks < ActiveRecord::Migration[8.1]
  def change
    add_column :schedule_blocks, :normal_day_only, :boolean, default: false, null: false
  end
end
