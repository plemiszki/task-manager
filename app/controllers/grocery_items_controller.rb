class GroceryItemsController < ApplicationController

  before_action :require_login

  def index
  end

  def show
    @grocery_item = GroceryItem.find_by_id(params[:id])
  end

end
