class CreateScheduleBlocks < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_blocks do |t|
      t.integer :weekday, null: false
      t.time :start_time, null: false
      t.time :end_time, null: false
      t.string :color, null: false
      t.string :text, null: false
      t.references :user, foreign_key: true
      t.timestamps
    end
  end
end
