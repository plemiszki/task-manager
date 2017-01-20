class CreateTasks < ActiveRecord::Migration
  def change
    create_table :tasks do |t|
      t.string :text, null: false
      t.string :timeframe,  default: "day"
      t.string :color, default: "yellow"
      t.integer :parent_id
      t.integer :duplicate_id
      t.integer :order, default: 0
      t.boolean :complete, default: false
      t.boolean :template, default: false
    end

    add_index :tasks, :parent_id
    add_index :tasks, :duplicate_id
  end
end
