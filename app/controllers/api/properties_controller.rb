class Api::PropertiesController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @properties = Property.all.order(:label)
  end

  def show
    @property = Property.find(params[:id])
  end

  def create
    render json: {}, status: :ok
  end

end
