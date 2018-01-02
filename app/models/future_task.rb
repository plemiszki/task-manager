class FutureTask < ActiveRecord::Base

  belongs_to :user

  validate :presence, :text, :color

end
