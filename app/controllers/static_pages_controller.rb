class StaticPagesController < ApplicationController

  before_action :require_login

  def root
    render "root.html.erb"
  end

end
