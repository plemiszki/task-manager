class CreateRecurringTasks < ActiveRecord::Migration
  def change
    create_table :recurring_tasks do |t|
      t.string :text, null: false
      t.string :color, default: "210, 206, 200"
      t.string :timeframe, default: "day"
      t.integer :user_id, null: false
      t.integer :order
      t.string :recurring_info, null: false
      t.string :recurrence, null: false
      t.boolean :add_to_end, default: false
    end
  end
end
