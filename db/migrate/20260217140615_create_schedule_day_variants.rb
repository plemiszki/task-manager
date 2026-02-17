class CreateScheduleDayVariants < ActiveRecord::Migration[8.1]
  def change
    create_table :schedule_day_variants do |t|
      t.string :name, null: false
      t.integer :weekday, null: false
      t.references :user, null: false, foreign_key: true

      t.timestamps
    end

    add_index :schedule_day_variants, [:user_id, :name, :weekday], unique: true
  end
end
