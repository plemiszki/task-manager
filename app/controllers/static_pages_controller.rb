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
    item_ids = redis.smembers(REDIS_KEY).map(&:to_i)

    all_item_ids_in_stores = grocery_stores.reduce([]) { |accum, store| accum += store.all_item_ids }
    misc_item_ids = item_ids - all_item_ids_in_stores
    @misc_items = GroceryItem.where(id: misc_item_ids)

    @result = []
    grocery_stores.select { |store| (store.all_item_ids & item_ids).present? }.each do |grocery_store|
      @result << {
        name: grocery_store.name,
        sections: grocery_store.sections.select { |section| (section.all_item_ids & item_ids).present? }.map do |section|
          {
            name: section.name,
            items: section.items.select { |item| item.id.in?(item_ids) }.map { |item| item.name },
          }
        end
      }
    end
  end

end
