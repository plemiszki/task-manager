class ListsController < ApplicationController

  before_action :require_login

  def show
    @list = List.find_by_id(params[:id])
  end

end
