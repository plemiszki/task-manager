class Api::GrocerySectionItemsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = GrocerySectionItem.where(grocery_section_id: grocery_section_item_params[:grocery_section_id]).length
    grocery_section_item = GrocerySectionItem.new({ position: current_length }.merge(grocery_section_item_params.except(:grocery_store_id)))
    if grocery_section_item.save
      @grocery_sections = GrocerySection.where(grocery_store_id: grocery_section_item_params[:grocery_store_id]).includes(grocery_section_items: [:grocery_item])
      @grocery_items = GroceryItem.where.not(id: @grocery_sections.map { |section| section.items.pluck(:id) }.flatten)
      render 'index'
    else
      render_errors(grocery_section_item)
    end
  end

  def destroy
    grocery_section_item = GrocerySectionItem.find(params[:id]).destroy
    GrocerySectionItem.where(grocery_section_id: grocery_section_item.grocery_section_id).order(:position).each_with_index do |grocery_section_item, index|
      grocery_section_item.update(position: index)
    end
    @grocery_sections = GrocerySection.where(grocery_store: grocery_section_item.section.store).includes(grocery_section_items: [:grocery_item])
    @grocery_items = GroceryItem.where.not(id: @grocery_sections.map { |section| section.items.pluck(:id) }.flatten)
    render 'index'
  end

  def rearrange
    grocery_section = GrocerySection.find(params[:grocery_section_id])
    params[:new_order].each do |index, id|
      grocerySectionItem = GrocerySectionItem.find(id)
      grocerySectionItem.update(position: index)
    end

    @grocery_sections = GrocerySection.where(grocery_store: grocery_section.store).includes(grocery_section_items: [:grocery_item])
    render 'index'
  end

  private

  def grocery_section_item_params
    params.require(:grocery_section_item).permit(:grocery_item_id, :grocery_section_id, :grocery_store_id)
  end

end
