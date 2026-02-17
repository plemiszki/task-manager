class ScheduleCategory < ActiveRecord::Base
  belongs_to :user

  validates :user, :name, presence: true
  validates :name, uniqueness: true
end
