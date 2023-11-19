json.grocerySections @grocery_sections do |grocery_section|
  json.id grocery_section.id
  json.name grocery_section.name
  json.position grocery_section.position
  json.grocerySectionItems grocery_section.grocery_section_items do |grocery_section_item|
    json.id grocery_section_item.id
    json.name grocery_section_item.grocery_item.name
  end
end
json.groceryItems @grocery_items do |grocery_item|
  json.id grocery_item.id
  json.name grocery_item.name
end
