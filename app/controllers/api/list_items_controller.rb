class Api::ListItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = ListItem.where(list_item_id: list_item_params[:list_item_id]).length
    list_item = ListItem.new({ position: current_length }.merge(list_item_params))
    if list_item.save
      @list_items = get_list_items
      render 'index'
    else
      render_errors(list_item)
    end
  end

  def destroy
    list_item = ListItem.find(params[:id]).destroy
    ListItem.where(list_id: list_item.list_id).order(:position).each_with_index do |list_item, index|
      list_item.update(position: index)
    end
    @list_items = get_list_items
    render 'index'
  end

  private

  def get_list_items
    ListItem.where(list_id: list_item.list_id).order(:position)
  end

  def list_item_params
    params.require(:list_item).permit(:grocery_item_id, :grocery_section_id, :grocery_store_id)
  end

end
