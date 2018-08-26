class RecurringTasksController < ApplicationController

  before_action :require_login

  def index
    render 'index.html.erb'
  end

  def show
    @recurring_task = RecurringTask.find_by_id(params[:id])
    render 'show.html.erb'
  end

end
