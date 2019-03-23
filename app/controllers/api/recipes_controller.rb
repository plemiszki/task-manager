class Api::RecipesController < ActionController::Base

  include Clearance::Controller

  def index
    @recipes = Recipe.all
    render 'index.json.jbuilder'
  end

  def show
    @recipes = Recipe.where(id: params[:id])
    render 'show.json.jbuilder'
  end

  def create
    @recipe = Recipe.new(recipe_params)
    if @recipe.save
      @recipes = Recipe.all
      render 'index.json.jbuilder'
    else
      render json: @recipe.errors.full_messages, status: 422
    end
  end

  def update
    @recipe = Recipe.find(params[:id])
    if @recipe.update(recipe_params)
      @recipes = Recipe.where(id: params[:id])
      render 'show.json.jbuilder'
    else
      render json: @recipe.errors.full_messages, status: 422
    end
  end

  def destroy
    Recipe.find(params[:id]).destroy
    @recipes = Recipe.all
    render 'index.json.jbuilder'
  end

  private

  def recipe_params
    params.require(:recipe).permit(:name, :category, :ingredients, :prep)
  end

end
