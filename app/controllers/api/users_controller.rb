class Api::UsersController < ActionController::Base

  def show
    render json: User.first
  end

  def update
    User.first.update(user_params)
    render json: User.first
  end

  private

  def user_params
    params.require(:user).permit(:long_weekend)
  end

end
