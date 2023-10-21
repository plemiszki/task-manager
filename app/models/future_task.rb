class FutureTask < ActiveRecord::Base

  belongs_to :user

  validates :text, :color, presence: true
  validates :date, date: true

end
