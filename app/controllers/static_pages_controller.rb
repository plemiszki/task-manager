class StaticPagesController < ApplicationController

  before_action :require_login

  def root
    render 'root.html.erb'
  end

  def on_call_auth
    google_client = GoogleClient.new
    redirect_to google_client.authorization_uri
  end

  def on_call_callback
    google_client = GoogleClient.new
    google_client.print_refresh_token(params[:code])
    redirect_to '/'
  end

end
