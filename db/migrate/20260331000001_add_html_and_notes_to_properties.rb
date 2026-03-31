class AddHtmlAndNotesToProperties < ActiveRecord::Migration[8.1]
  def change
    add_column :properties, :html, :text
    add_column :properties, :notes, :text
  end
end
