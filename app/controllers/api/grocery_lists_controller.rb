class Api::GroceryListsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @grocery_lists = GroceryList.all.order(:name)
  end

  def show
    @grocery_list = GroceryList.find(params[:id])
  end

  def create
    grocery_list = GroceryList.new(grocery_list_params)
    if grocery_list.save
      @grocery_lists = GroceryList.all.order(:name)
      render 'index'
    else
      render_errors(grocery_list)
    end
  end

  def update
    @grocery_list = GroceryList.find(params[:id])
    if @grocery_list.update(grocery_list_params)
      render 'show'
    else
      render_errors(@grocery_list)
    end
  end

  def destroy
    GroceryList.find(params[:id]).destroy
    @grocery_lists = GroceryList.all.order(:name)
    render 'index'
  end

  private

  def grocery_list_params
    params.require(:grocery_list).permit(:name)
  end

end
