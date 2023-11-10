json.groceryListItems @grocery_list_items do |grocery_list_item|
  json.id grocery_list_item.id
  json.name grocery_list_item.grocery_item.name
end
json.groceryItems @grocery_items do |item|
  json.id item.id
  json.name item.name
end
