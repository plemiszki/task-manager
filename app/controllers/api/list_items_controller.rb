class Api::ListItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = ListItem.where(list_id: list_item_params[:list_id]).length
    @list_item = ListItem.new({ position: current_length }.merge(list_item_params))
    if @list_item.save
      @list_items = get_list_items
      render 'index'
    else
      render_errors(@list_item)
    end
  end

  def destroy
    @list_item = ListItem.find(params[:id]).destroy
    ListItem.where(list_id: @list_item.list_id).order(:position).each_with_index do |list_item, index|
      list_item.update(position: index)
    end
    @list_items = get_list_items
    render 'index'
  end

  def rearrange
    params[:new_order].each do |index, id|
      listItem = ListItem.find(id)
      listItem.update(position: index)
    end
    @list_item = ListItem.find(params["new_order"]["0"])
    @list_items = get_list_items
    render 'index', formats: [:json], handlers: [:jbuilder]
  end

  private

  def get_list_items
    ListItem.where(list_id: @list_item.list_id).order(:position)
  end

  def list_item_params
    params.require(:list_item).permit(:text, :list_id)
  end

end
