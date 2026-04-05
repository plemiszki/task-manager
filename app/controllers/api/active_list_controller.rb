class Api::ActiveListController < ActionController::Base

  include Clearance::Controller

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_URL"]
  REDIS_KEY = "active-list"

  def show
    @grocery_items = GroceryItem.all.order(:name)
    @grocery_lists = GroceryList.all.order(:name)
    @grocery_stores = GroceryStore.all.order(:name)
    @recipes = Recipe.where.associated(:recipe_items).order(:name).uniq
    redis = create_redis_instance
    @ids = redis.smembers(REDIS_KEY)
  end

  def add
    redis = create_redis_instance
    redis.sadd(REDIS_KEY, params[:id])
    render json: { ids: redis.smembers(REDIS_KEY) }
  end

  def add_from_list
    list = GroceryList.find(params[:id])
    redis = create_redis_instance
    redis.sadd(REDIS_KEY, list.grocery_items.pluck(:id))
    render json: { ids: redis.smembers(REDIS_KEY) }
  end

  def add_from_recipe
    recipe = Recipe.find(params[:id])
    redis = create_redis_instance
    redis.sadd(REDIS_KEY, recipe.grocery_items.pluck(:id))
    render json: { ids: redis.smembers(REDIS_KEY) }
  end

  def remove
    redis = create_redis_instance
    redis.srem(REDIS_KEY, params[:id])
    render json: { ids: redis.smembers(REDIS_KEY) }
  end

  def clear
    redis = create_redis_instance
    redis.del(REDIS_KEY)
    render json: { ids: redis.smembers(REDIS_KEY) }
  end

  private

  def create_redis_instance
    Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
  end

end
