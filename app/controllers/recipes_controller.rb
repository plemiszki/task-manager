class RecipesController < ApplicationController

  before_action :require_login

  def index
    render 'index.html.erb'
  end

  def show
    @recipe = Recipe.find_by_id(params[:id])
    render 'show.html.erb'
  end

end
