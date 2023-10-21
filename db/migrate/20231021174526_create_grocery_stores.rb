class CreateGroceryStores < ActiveRecord::Migration[7.0]
  def change

    create_table :grocery_stores do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :grocery_stores, :name, unique: true

    create_table :grocery_items do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :grocery_items, :name, unique: true

    create_table :grocery_sections do |t|
      t.string :name, null: false
      t.integer :position, null: false
      t.integer :grocery_store_id, null: false
      t.timestamps
    end
    add_index :grocery_sections, :grocery_store_id
    add_index :grocery_sections, [:grocery_store_id, :name], unique: true

    create_table :grocery_section_items do |t|
      t.integer :position, null: false
      t.integer :grocery_item_id, null: false
      t.integer :grocery_section_id, null: false
      t.timestamps
    end
    add_index :grocery_section_items, [:grocery_section_id, :grocery_item_id], unique: true, name: 'no_duplicate_grocery_section_items'

    create_table :recipe_items do |t|
      t.integer :position
      t.integer :recipe_id
      t.timestamps
    end
    add_index :recipe_items, :recipe_id

    create_table :grocery_lists do |t|
      t.string :name, null: false
      t.timestamps
    end
    add_index :grocery_lists, :name, unique: true

    create_table :grocery_list_items do |t|
      t.integer :grocery_item_id, null: false
      t.timestamps
    end
    add_index :grocery_list_items, :grocery_item_id
  end
end
