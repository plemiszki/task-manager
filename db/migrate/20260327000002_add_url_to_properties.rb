class AddUrlToProperties < ActiveRecord::Migration[8.1]
  def change
    add_column :properties, :url, :string, null: false, default: ''
  end
end
