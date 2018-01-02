class User < ActiveRecord::Base
  include Clearance::User

  has_many :tasks, dependent: :destroy
  has_many :future_tasks, dependent: :destroy
end
