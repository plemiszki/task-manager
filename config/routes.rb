Rails.application.routes.draw do

  root to: "static_pages#root"
  resources :future_tasks, only: [:index]
  resources :recurring_tasks, only: [:index, :show]

  namespace :api, defaults: { format: :json } do
    get '/user' => '/api/users#show'
    post '/user' => '/api/users#update'

    get '/congress' => '/api/congress#show'

    get '/tasks' => '/api/tasks#index'
    post '/tasks' => '/api/tasks#create'
    patch '/tasks' => '/api/tasks#update'
    patch '/tasks/rearrange' => '/api/tasks#rearrange'
    delete '/tasks' => '/api/tasks#delete'

    resources :future_tasks, only: [:index, :create, :destroy]
    patch '/recurring_tasks/rearrange' => '/api/recurring_tasks#rearrange'
    resources :recurring_tasks, only: [:index, :create, :show, :update, :destroy]
  end

end
