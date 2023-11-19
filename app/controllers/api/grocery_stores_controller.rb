class Api::GroceryStoresController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @grocery_stores = GroceryStore.all.order(:name)
  end

  def show
    @grocery_store = GroceryStore.find(params[:id])
    @grocery_sections = @grocery_store.sections.includes(grocery_section_items: [:grocery_item])
    @grocery_items = GroceryItem.where.not(id: @grocery_sections.map { |section| section.items.pluck(:id) }.flatten)
  end

  def create
    grocery_store = GroceryStore.new(grocery_store_params)
    if grocery_store.save
      @grocery_stores = GroceryStore.all.order(:name)
      render 'index'
    else
      render_errors(grocery_store)
    end
  end

  def update
    @grocery_store = GroceryStore.find(params[:id])
    if @grocery_store.update(grocery_store_params)
      render 'show'
    else
      render_errors(@grocery_store)
    end
  end

  def destroy
    GroceryStore.find(params[:id]).destroy
    @grocery_stores = GroceryStore.all.order(:name)
    render 'index'
  end

  private

  def grocery_store_params
    params.require(:grocery_store).permit(:name)
  end

end
