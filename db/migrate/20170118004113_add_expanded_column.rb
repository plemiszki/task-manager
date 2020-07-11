class AddExpandedColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :expanded, :boolean
    change_column :tasks, :expanded, :boolean, default: false
  end
end
