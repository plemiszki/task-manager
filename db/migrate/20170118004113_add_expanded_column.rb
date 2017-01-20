class AddExpandedColumn < ActiveRecord::Migration
  def change
    add_column :tasks, :expanded, :boolean
    change_column :tasks, :expanded, :boolean, default: false
  end
end
