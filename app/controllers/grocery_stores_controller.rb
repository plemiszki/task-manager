class GroceryStoresController < ApplicationController

  before_action :require_login

  def show
    @grocery_store = GroceryStore.find_by_id(params[:id])
  end

end
