class Task < ActiveRecord::Base

  has_many(
    :subtasks,
    class_name: "Task",
    foreign_key: :parent_id,
    primary_key: :id,
    dependent: :destroy
  )

end
