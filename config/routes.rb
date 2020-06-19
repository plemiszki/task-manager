Rails.application.routes.draw do

  root to: 'static_pages#root'
  resources :future_tasks, only: [:index]
  resources :recurring_tasks, only: [:index, :show]
  resources :recipes, only: [:index, :show]
  get '/on_call_auth' => 'static_pages#on_call_auth'
  get '/on_call_callback' => 'static_pages#on_call_callback'

  namespace :api, defaults: { format: :json } do
    get '/user' => '/api/user#show'
    post '/user' => '/api/user#update'
    get '/congress' => '/api/congress#show'
    resources :tasks, only: [:index, :create]
    patch '/tasks' => '/api/tasks#update'
    patch '/tasks/rearrange' => '/api/tasks#rearrange'
    delete '/tasks' => '/api/tasks#destroy'
    resources :future_tasks, only: [:index, :create, :destroy]
    patch '/recurring_tasks/rearrange' => '/api/recurring_tasks#rearrange'
    resources :recurring_tasks, only: [:index, :create, :show, :update, :destroy]
    resources :recipes, only: [:index, :create, :show, :update, :destroy]
  end

end
