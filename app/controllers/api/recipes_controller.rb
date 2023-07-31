class Api::RecipesController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @recipes = Recipe.all.order(:name)
  end

  def show
    @recipe = Recipe.find(params[:id])
  end

  def create
    @recipe = Recipe.new(recipe_params)
    if @recipe.save
      @recipes = Recipe.all.order(:name)
      render 'index'
    else
      render_errors(@recipe)
    end
  end

  def update
    @recipe = Recipe.find(params[:id])
    if @recipe.update(recipe_params)
      render 'show'
    else
      render_errors(@recipe)
    end
  end

  def destroy
    Recipe.find(params[:id]).destroy
    @recipes = Recipe.all.order(:name)
    render 'index'
  end

  private

  def recipe_params
    params.require(:recipe).permit(:name, :category, :ingredients, :prep, :time)
  end

end
