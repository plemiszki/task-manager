class Task < ActiveRecord::Base

  has_many(
    :subtasks,
    class_name: "Task",
    foreign_key: :parent_id,
    primary_key: :id,
    dependent: :destroy
  )

  has_many(
    :duplicates,
    class_name: "Task",
    foreign_key: :duplicate_id,
    primary_key: :id
  )

end
