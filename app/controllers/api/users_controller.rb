class Api::UsersController < ActionController::Base

  include Clearance::Controller

  def show
    render json: current_user
  end

  def update
    current_user.update(user_params)
    render json: current_user
  end

  private

  def user_params
    params.require(:user).permit(:long_weekend)
  end

end
