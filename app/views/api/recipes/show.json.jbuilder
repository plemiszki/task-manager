json.recipe do
  json.id @recipe.id
  json.name @recipe.name
  json.category @recipe.category
  json.ingredients @recipe.ingredients
  json.prep @recipe.prep
  json.time @recipe.time
end
