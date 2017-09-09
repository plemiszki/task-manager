class AddJointIdColumn < ActiveRecord::Migration
  def change
    add_column :tasks, :joint_id, :integer
  end
end
