class AddShowParentPrefixToTasks < ActiveRecord::Migration[8.1]
  def change
    add_column :tasks, :show_parent_prefix, :boolean, default: false
  end
end
