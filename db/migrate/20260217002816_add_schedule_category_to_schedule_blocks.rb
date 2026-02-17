class AddScheduleCategoryToScheduleBlocks < ActiveRecord::Migration[8.1]
  def change
    add_reference :schedule_blocks, :schedule_category, foreign_key: true
  end
end
