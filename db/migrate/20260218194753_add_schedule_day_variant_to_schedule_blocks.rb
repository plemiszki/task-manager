class AddScheduleDayVariantToScheduleBlocks < ActiveRecord::Migration[8.1]
  def change
    add_reference :schedule_blocks, :schedule_day_variant, foreign_key: true
  end
end
