var Store = require('flux/utils').Store;
var AppDispatcher = require('../dispatcher/dispatcher.js');
var HandyTools = require('handy-tools');

var RecipesStore = new Store(AppDispatcher);

var _recipes = {};

RecipesStore.setRecipes = function(recipes) {
  _recipes = {};
  recipes.forEach(function(recipe) {
    _recipes[recipe.id] = recipe;
  });
};

RecipesStore.find = function(id) {
  return _recipes[id];
};

RecipesStore.all = function() {
  var recipes = [];
  Object.keys(_recipes).forEach(function(id) {
    recipes.push(_recipes[id]);
  });
  return HandyTools.alphabetizeArrayOfObjects(recipes, 'name');
};

RecipesStore.__onDispatch = function(payload) {
  switch(payload.actionType){
    case "RECIPES_RECEIVED":
      this.setRecipes(payload.recipes);
      this.__emitChange();
      break;
  }
};

module.exports = RecipesStore;
