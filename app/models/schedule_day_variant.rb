class ScheduleDayVariant < ActiveRecord::Base
  belongs_to :user
  has_many :schedule_blocks, dependent: :destroy

  validates :user, :name, :weekday, presence: true
  validates :name, uniqueness: { scope: [:user_id, :weekday] }
end
