class GroceryListsController < ApplicationController

  before_action :require_login

  def show
    @grocery_list = GroceryList.find_by_id(params[:id])
  end

end
