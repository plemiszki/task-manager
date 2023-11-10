json.groceryList do
  json.id @grocery_list.id
  json.name @grocery_list.name
end
json.groceryListItems @grocery_list_items do |list_item|
  json.id list_item.id
  json.name list_item.grocery_item.name
end
json.groceryItems @grocery_items do |item|
  json.id item.id
  json.name item.name
end
