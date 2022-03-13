class RecurringTasksController < ApplicationController

  before_action :require_login

  def index
  end

  def show
    @recurring_task = RecurringTask.find_by_id(params[:id])
  end

end
