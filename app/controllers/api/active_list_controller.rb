class Api::ActiveListController < ActionController::Base

  include Clearance::Controller

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ""
  REDIS_KEY = "active-list"

  def show
    @grocery_items = GroceryItem.all.order(:name)
    @grocery_lists = GroceryList.all.order(:name)
    @grocery_stores = GroceryStore.all.order(:name)
    @recipes = Recipe.where.associated(:recipe_items).order(:name).uniq
    redis = Redis.new(url: REDIS_URL)
    @ids = redis.smembers(REDIS_KEY)
  end

  def add
    redis = Redis.new(url: REDIS_URL)
    redis.sadd(REDIS_KEY, params[:id])
    render json: { ids: redis.smembers(REDIS_KEY) }
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
