class Api::PropertiesController < ActionController::Base

  include Clearance::Controller
  include RenderErrors

  def index
    @properties = Property.all.order(:label)
  end

  def show
    @property = Property.find(params[:id])
  end

  def update
    @property = Property.find(params[:id])
    if @property.update(property_params)
      render 'show'
    else
      render_errors(@property)
    end
  end

  def destroy
    Property.find(params[:id]).destroy
    render json: {}, status: :ok
  end

  def refetch
    property = Property.find(params[:id])
    attributes = ScrapeStreetEasy.new(property.url).call.except(:image_url)
    render json: { property: attributes.transform_keys { |k| k.to_s.camelize(:lower) } }
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def create
    errors = {}
    errors[:url]  = ["URL can't be blank"] if params[:property][:url].blank?
    errors[:html] = ["HTML can't be blank"] if params[:property][:html].blank?
    return render json: { errors: errors }, status: :unprocessable_entity if errors.any?

    clean_url = params[:property][:url].split('?').first
    html      = params[:property][:html]
    attributes = ExtractPropertyFromHtml.new(html, clean_url).call
    @property = Property.new(attributes.merge(date_added: Time.current))
    if @property.save
      render json: {}, status: :ok
    else
      render_errors(@property)
    end
  rescue => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  private

  def property_params
    params.require(:property).permit(
      :label, :street_address, :apt_number, :neighborhood, :status,
      :price, :bedrooms, :full_bathrooms, :half_bathrooms, :property_type, :area,
      :school_district, :school_zone, :taxes, :insurance, :hoa_fees,
      :date_added, :url
    )
  end

end
