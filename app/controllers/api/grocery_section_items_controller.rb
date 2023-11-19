class Api::GrocerySectionItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = GrocerySectionItem.where(grocery_section_id: grocery_section_item_params[:grocery_section_id]).length
    grocery_section_item = GrocerySectionItem.new({ position: current_length }.merge(grocery_section_item_params.except(:grocery_store_id)))
    if grocery_section_item.save
      @grocery_sections = GrocerySection.where(grocery_store_id: grocery_section_item_params[:grocery_store_id]).includes(grocery_section_items: [:grocery_item])
      render 'index'
    else
      render_errors(grocery_section_item)
    end
  end

  # def destroy
  #   deleted_list_item = GroceryListItem.find(params[:id]).destroy
  #   @grocery_list_items = GroceryList.find(deleted_list_item.grocery_list_id).sorted_list_items
  #   @grocery_items = GroceryItem.where.not(id: @grocery_list_items.pluck(:grocery_item_id))
  #   render 'index'
  # end

  private

  def grocery_section_item_params
    params.require(:grocery_section_item).permit(:grocery_item_id, :grocery_section_id, :grocery_store_id)
  end

end
