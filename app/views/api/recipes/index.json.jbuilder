json.recipes @recipes do |recipe|
  json.id recipe.id
  json.name recipe.name
  json.ingredients recipe.ingredients
  json.prep recipe.prep
  json.category recipe.category
end
