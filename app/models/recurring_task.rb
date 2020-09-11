class RecurringTask < ActiveRecord::Base

  belongs_to :user

  validates :text, :color, presence: true
  validate :joint_id_and_task

  def joint_id_and_task
    if joint_user_id && joint_text.empty?
      errors.add(:joint_text, "can't be blank")
    end
  end

  def montrose_object
    Montrose.r(JSON.parse(recurrence))
  end

  def next_occurence
    obj = montrose_object
    i = 1
    until obj.events.take(i).last.to_date >= Date.today
      i += 1
    end
    obj.events.take(i).last
  end

end
