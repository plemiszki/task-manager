Rails.application.routes.draw do

  root to: "static_pages#root"

  namespace :api, defaults: { format: :json } do
    get '/tasks' => '/api/tasks#index'
    post '/tasks' => '/api/tasks#create'
    patch '/tasks' => '/api/tasks#update'
    delete '/tasks' => '/api/tasks#delete'
  end

end
