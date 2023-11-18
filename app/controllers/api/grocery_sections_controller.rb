class Api::GrocerySectionsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def create
    current_length = GrocerySection.where(grocery_store_id: grocery_section_params[:grocery_store_id]).length
    grocery_section = GrocerySection.new({ position: current_length }.merge(grocery_section_params))
    if grocery_section.save
      @grocery_sections = GrocerySection.where(grocery_store_id: grocery_section.grocery_store_id)
      render 'index'
    else
      render_errors(grocery_section)
    end
  end

  # def destroy
  #   grocery_section = RecipeItem.find(params[:id]).destroy
  #   @grocery_sections = Recipe.find(grocery_section.recipe_id).sorted_list_items
  #   @grocery_items = GroceryItem.where.not(id: @grocery_sections.pluck(:grocery_item_id))
  #   render 'index'
  # end

  private

  def grocery_section_params
    params.require(:grocery_section).permit(:grocery_store_id, :name)
  end

end
