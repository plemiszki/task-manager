class Api::ListsController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @lists = all_user_lists
  end

  def show
    @list = List.find(params[:id])
  end

  def create
    @list = List.new(list_params.merge(user_id: current_user.id))
    if @list.save
      @lists = all_user_lists
      render 'index'
    else
      render_errors(@list)
    end
  end

  def update
    @list = List.find(params[:id])
    if @list.update(list_params)
      render 'show'
    else
      render_errors(@list)
    end
  end

  def destroy
    List.find(params[:id]).destroy
    @lists = all_user_lists
    render 'index'
  end

  private

  def list_params
    params.require(:list).permit(:name)
  end

  def all_user_lists
    List.where(user_id: current_user.id).order(:name)
  end

end
