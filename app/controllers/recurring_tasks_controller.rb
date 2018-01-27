class RecurringTasksController < ApplicationController

  before_action :require_login

  def index
    render "index.html.erb"
  end

end
