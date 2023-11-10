class Api::GroceryListItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    grocery_list_item = GroceryListItem.new(grocery_list_item_params)
    if grocery_list_item.save
      @grocery_list_items = GroceryList.find(grocery_list_item_params[:grocery_list_id]).sorted_list_items
      @grocery_items = GroceryItem.where.not(id: @grocery_list_items.pluck(:grocery_item_id))
      render 'index'
    else
      render_errors(grocery_list_item)
    end
  end

  def destroy
    deleted_list_item = GroceryListItem.find(params[:id]).destroy
    @grocery_list_items = GroceryList.find(deleted_list_item.grocery_list_id).sorted_list_items
    @grocery_items = GroceryItem.where.not(id: @grocery_list_items.pluck(:grocery_item_id))
    render 'index'
  end

  private

  def grocery_list_item_params
    params.require(:grocery_list_item).permit(:grocery_item_id, :grocery_list_id)
  end

end
