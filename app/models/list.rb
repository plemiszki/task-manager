class List < ActiveRecord::Base

  validates :name, :user_id, presence: true
  validates :name, uniqueness: { scope: :user_id }

end
