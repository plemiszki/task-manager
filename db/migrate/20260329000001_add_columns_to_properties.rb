class AddColumnsToProperties < ActiveRecord::Migration[8.1]
  def change
    add_column :properties, :image_url, :string
    add_column :properties, :full_bathrooms, :integer, null: false, default: 0
    add_column :properties, :half_bathrooms, :integer, null: false, default: 0
    add_column :properties, :date_seen, :datetime
  end
end
