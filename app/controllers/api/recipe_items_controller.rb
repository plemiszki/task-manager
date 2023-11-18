class Api::RecipeItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    recipe_item = RecipeItem.new(recipe_item_params)
    if recipe_item.save
      @recipe_items = Recipe.find(recipe_item_params[:recipe_id]).sorted_list_items
      @grocery_items = GroceryItem.where.not(id: @recipe_items.pluck(:grocery_item_id))
      render 'index'
    else
      render_errors(recipe_item)
    end
  end

  def destroy
    recipe_item = RecipeItem.find(params[:id]).destroy
    @recipe_items = Recipe.find(recipe_item.recipe_id).sorted_list_items
    @grocery_items = GroceryItem.where.not(id: @recipe_items.pluck(:grocery_item_id))
    render 'index'
  end

  private

  def recipe_item_params
    params.require(:recipe_item).permit(:grocery_item_id, :recipe_id)
  end

end
