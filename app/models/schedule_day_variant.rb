class ScheduleDayVariant < ActiveRecord::Base
  belongs_to :user

  validates :user, :name, :weekday, presence: true
  validates :name, uniqueness: { scope: [:user_id, :weekday] }
end
