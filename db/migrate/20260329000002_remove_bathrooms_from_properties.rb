class RemoveBathroomsFromProperties < ActiveRecord::Migration[8.1]
  def change
    remove_column :properties, :bathrooms, :decimal
  end
end
