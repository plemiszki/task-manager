class CreateFutureTasks < ActiveRecord::Migration
  def change
    create_table :future_tasks do |t|
      t.string :text, null: false
      t.string :timeframe, default: "day"
      t.string :color, default: "210, 206, 200"
      t.integer :order, default: 0
      t.integer :user_id
      t.date :date, null: false
      t.boolean :add_to_end, default: false
    end
  end
end
