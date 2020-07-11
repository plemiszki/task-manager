class AddJointIdColumn < ActiveRecord::Migration[5.2]
  def change
    add_column :tasks, :joint_id, :integer
  end
end
