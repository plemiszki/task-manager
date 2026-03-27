class CreateProperties < ActiveRecord::Migration[8.1]
  def change
    create_table :properties do |t|
      t.string :label, null: false
      t.string :street_address, null: false
      t.string :apt_number
      t.string :neighborhood
      t.string :status, null: false, default: 'available'
      t.integer :price, null: false
      t.integer :bedrooms, null: false
      t.float :bathrooms, null: false
      t.string :property_type, null: false
      t.integer :area
      t.integer :school_district
      t.integer :school_zone
      t.float :taxes
      t.float :insurance
      t.float :hoa_fees

      t.timestamps
    end

    add_index :properties, :label, unique: true
  end
end
