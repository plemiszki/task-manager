class Api::ActiveListController < ActionController::Base

  include Clearance::Controller

  def show
    @grocery_items = GroceryItem.all.order(:name)
    @grocery_lists = GroceryList.all.order(:name)
    @grocery_stores = GroceryStore.all.order(:name)
    @recipes = Recipe.all_with_items.order(:name)
  end

  def add
  end

  def add_from_list
  end

  def add_from_recipe
  end

  def remove
  end

  def clear
  end

end
