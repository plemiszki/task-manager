json.groceryStore do
  json.id @grocery_store.id
  json.name @grocery_store.name
end
json.grocerySections @grocery_sections do |grocery_section|
  json.id grocery_section.id
  json.name grocery_section.name
  json.position grocery_section.position
end
