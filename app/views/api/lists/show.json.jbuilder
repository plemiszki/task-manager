json.list do
  json.id @list.id
  json.name @list.name
  json.listItems @list.list_items do |list_item|
    json.id list_item.id
    json.text list_item.text
    json.position list_item.position
  end
end
