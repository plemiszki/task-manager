json.recipes @recipes do |recipe|
  json.id recipe.id
  json.name recipe.name
  json.category recipe.category
  json.ingredients recipe.ingredients
  json.prep recipe.prep
end