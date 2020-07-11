class AddUserIdColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :user_id, :integer
    add_index :tasks, :user_id
  end
end
