class CreateListItems < ActiveRecord::Migration[7.1]
  def change
    create_table :list_items do |t|
      t.integer :list_id, null: false
      t.string :text, null: false
      t.integer :position, null: false

      t.timestamps
    end

    add_index :list_items, :list_id
  end
end
