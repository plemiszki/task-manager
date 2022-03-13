class RecipesController < ApplicationController

  before_action :require_login

  def index
  end

  def show
    @recipe = Recipe.find_by_id(params[:id])
  end

end
