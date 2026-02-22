class ScheduleBlock < ActiveRecord::Base
  belongs_to :user
  belongs_to :schedule_category, optional: true
  belongs_to :schedule_day_variant, optional: true

  validates :user, :weekday, :start_time, :end_time, :color, :text, presence: true
  validate :no_overlapping_blocks

  private

  def no_overlapping_blocks
    return if user_id.blank? || weekday.blank? || start_time.blank? || end_time.blank?

    scope = ScheduleBlock.where(user_id: user_id, weekday: weekday)
      .where("start_time < ? AND end_time > ?", end_time, start_time)
    scope = scope.where.not(id: id) if persisted?

    # Narrow to blocks that share the same day type as self.
    # A variant block only conflicts with blocks for the same variant or "all-days" blocks.
    # A normal-day-only block only conflicts with other normal-day-only or "all-days" blocks.
    # An all-days block conflicts with everything.
    if schedule_day_variant_id.present?
      scope = scope.where(
        "schedule_day_variant_id = ? OR (schedule_day_variant_id IS NULL AND normal_day_only = ?)",
        schedule_day_variant_id, false
      )
    elsif normal_day_only?
      scope = scope.where(schedule_day_variant_id: nil)
    end

    errors.add(:base, "overlaps with an existing schedule block") if scope.exists?
  end
end
