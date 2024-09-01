class RecurringTask < ActiveRecord::Base

  belongs_to :user

  validates :text, :color, presence: true
  validate :joint_id_and_task

  def self.get_joint_tasks_for_user(user:)
    RecurringTask.where(joint_user_id: user.id)
  end

  def update_start_date_to_today!
    update_start_date!(date: Date.today)
  end

  def update_start_date_to_next_occurrence!
    update_start_date!(date: next_occurrence)
  end

  def update_start_date!(date:)
    hash = JSON.parse(self.recurrence)
    if hash.has_key?('starts')
      hash['starts'] = date.strftime('%Y-%m-%d')
      self.update!(
        recurrence: hash.to_json
      )
    end
  end

  def joint_id_and_task
    if joint_user_id && joint_text.empty?
      errors.add(:joint_text, "can't be blank")
    end
  end

  def montrose_object
    Montrose.r(JSON.parse(recurrence))
  end

  def next_occurrence
    obj = montrose_object
    i = 1
    until obj.events.take(i).last.to_date > Date.today
      i += 1
    end
    obj.events.take(i).last.to_date
  end

end
