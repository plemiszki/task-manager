class Api::UsersController < ActionController::Base

  include Clearance::Controller

  def index
    @users = User.all.order(:email)
  end

end
