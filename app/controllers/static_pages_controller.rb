class StaticPagesController < ApplicationController

  REDIS_URL = Rails.env == "development" ? "redis://localhost:6379" : ENV["REDIS_TLS_URL"]
  REDIS_KEY = "active-list"

  before_action :require_login

  def root
  end

  def groceries
  end

  def grocery_list
    grocery_stores = GroceryStore.all.includes(grocery_sections: [:grocery_items]).order(:name)
    redis = Redis.new(url: REDIS_URL, ssl_params: { verify_mode: OpenSSL::SSL::VERIFY_NONE })
    item_ids = redis.smembers(REDIS_KEY)
    @result = []
    grocery_stores.each do |grocery_store|
      @result << {
        name: grocery_store.name,
        sections: grocery_store.sections.map do |section|
          {
            name: section.name,
            items: section.items.map { |item| item.name },
          }
        end
      }
    end
  end

end
