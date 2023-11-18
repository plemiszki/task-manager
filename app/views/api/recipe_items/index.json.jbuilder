json.recipeItems @recipe_items do |recipe_item|
  json.id recipe_item.id
  json.name recipe_item.grocery_item.name
end
json.groceryItems @grocery_items do |item|
  json.id item.id
  json.name item.name
end
