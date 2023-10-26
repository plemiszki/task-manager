class Api::GroceryItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @grocery_items = GroceryItem.all.order(:name)
  end

  def show
    @grocery_item = GroceryItem.find(params[:id])
  end

  def create
    grocery_item = GroceryItem.new(grocery_item_params)
    if grocery_item.save
      @grocery_items = GroceryItem.all.order(:name)
      render 'index'
    else
      render_errors(grocery_item)
    end
  end

  def update
    @grocery_item = GroceryItem.find(params[:id])
    if @grocery_item.update(grocery_item_params)
      render 'show'
    else
      render_errors(@grocery_item)
    end
  end

  def destroy
    GroceryItem.find(params[:id]).destroy
    @grocery_items = GroceryItem.all.order(:name)
    render 'index'
  end

  private

  def grocery_item_params
    params.require(:grocery_item).permit(:name)
  end

end
