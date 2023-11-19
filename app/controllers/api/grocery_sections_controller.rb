class Api::GrocerySectionsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = GrocerySection.where(grocery_store_id: grocery_section_params[:grocery_store_id]).length
    grocery_section = GrocerySection.new({ position: current_length }.merge(grocery_section_params))
    if grocery_section.save
      @grocery_sections = GrocerySection.where(grocery_store_id: grocery_section.grocery_store_id).includes(grocery_section_items: [:grocery_item])
      @grocery_items = GroceryItem.where.not(id: @grocery_sections.map { |section| section.items.pluck(:id) }.flatten)
      render 'index'
    else
      render_errors(grocery_section)
    end
  end

  def destroy
    grocery_section = GrocerySection.find(params[:id]).destroy
    GrocerySection.where(grocery_store_id: grocery_section.grocery_store_id).order(:position).each_with_index do |grocery_section, index|
      grocery_section.update(position: index)
    end
    @grocery_sections = GrocerySection.where(grocery_store_id: grocery_section.grocery_store_id)
    @grocery_items = GroceryItem.where.not(id: @grocery_sections.map { |section| section.items.pluck(:id) }.flatten)
    render 'index'
  end

  private

  def grocery_section_params
    params.require(:grocery_section).permit(:grocery_store_id, :name)
  end

end
