class RecurringTask < ActiveRecord::Base

  belongs_to :user

  validates :text, :color, presence: true

end
