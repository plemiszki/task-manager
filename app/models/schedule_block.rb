class ScheduleBlock < ActiveRecord::Base
  belongs_to :user
  belongs_to :schedule_category, optional: true

  validates :user, :weekday, :start_time, :end_time, :color, :text, presence: true
  validate :no_overlapping_blocks

  private

  def no_overlapping_blocks
    return if user_id.blank? || weekday.blank? || start_time.blank? || end_time.blank?

    scope = ScheduleBlock.where(user_id: user_id, weekday: weekday)
      .where("start_time < ? AND end_time > ?", end_time, start_time)
    scope = scope.where.not(id: id) if persisted?

    if scope.exists?
      errors.add(:base, "overlaps with an existing schedule block")
    end
  end
end
