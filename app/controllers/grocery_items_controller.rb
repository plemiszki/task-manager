class GroceryItemsController < ApplicationController

  before_action :require_login

  def show
    @grocery_item = GroceryItem.find_by_id(params[:id])
  end

end
