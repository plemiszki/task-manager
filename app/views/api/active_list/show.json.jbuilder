json.groceryItems @grocery_items do |grocery_item|
  json.id grocery_item.id
  json.name grocery_item.name
end
json.groceryStores @grocery_stores do |grocery_store|
  json.id grocery_store.id
  json.name grocery_store.name
end
json.groceryLists @grocery_lists do |grocery_list|
  json.id grocery_list.id
  json.name grocery_list.name
end
