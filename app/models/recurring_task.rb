class RecurringTask < ActiveRecord::Base

  belongs_to :user

  validates :text, :color, presence: true
  validate :joint_id_and_task

  def joint_id_and_task
    if joint_user_id && joint_text.empty?
      errors.add(:joint_text, "can't be blank")
    end
  end

end
