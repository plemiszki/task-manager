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
    clean_url = params[:property][:url].split('?').first
    attributes = ScrapeStreetEasy.new(clean_url).call
    @property = Property.new(attributes)
    if @property.save
      render json: {}, status: :ok
    else
      render_errors(@property)
    end
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

end
