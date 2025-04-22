Rails.application.routes.draw do

  root to: 'static_pages#root'
  resources :future_tasks, only: [:index]
  resources :recurring_tasks, only: [:index, :show]
  resources :recipes, only: [:index, :show]
  resources :lists, only: [:show]
  resources :grocery_stores, only: [:show]
  resources :grocery_items, only: [:show]
  resources :grocery_lists, only: [:show]
  get '/settings' => 'static_pages#settings'
  get '/grocery_list' => 'static_pages#grocery_list'

  namespace :api, defaults: { format: :json } do
    resources :users, only: [:index]
    get '/user' => '/api/user#show'
    patch '/user' => '/api/user#update'
    resources :jobs, only: [:show]
    get '/congress' => '/api/congress#show'
    resources :tasks, only: [:index, :create, :destroy]
    post '/tasks/copy_incomplete' => '/api/tasks#copy_incomplete'
    put '/tasks' => '/api/tasks#update'
    delete '/tasks' => '/api/tasks#destroy'
    patch '/tasks/rearrange' => '/api/tasks#rearrange'
    patch '/tasks/move' => '/api/tasks#move_all'
    post '/tasks/copy' => '/api/tasks#copy_all'
    post '/tasks/:id/convert_to_future' => '/api/tasks#convert_to_future'
    post '/tasks/:task_id/add_subtasks_from_list/:list_id' => '/api/tasks#add_subtasks_from_list'
    patch '/tasks/:id/move' => '/api/tasks#move'
    resources :future_tasks, only: [:index, :create, :destroy]
    patch '/recurring_tasks/rearrange' => '/api/recurring_tasks#rearrange'
    patch '/recurring_tasks/toggle_active' => '/api/recurring_tasks#toggle_active'
    resources :recurring_tasks, only: [:index, :create, :show, :update, :destroy]
    resources :recipes, only: [:index, :create, :show, :update, :destroy]
    resources :lists, only: [:index, :create, :show, :update, :destroy]
    resources :list_items, only: [:create, :destroy]
    patch '/list_items/rearrange' => '/api/list_items#rearrange'
    resources :grocery_stores, only: [:index, :create, :show, :update, :destroy]
    resources :grocery_items, only: [:index, :create, :show, :update, :destroy]
    resources :grocery_lists, only: [:index, :create, :show, :update, :destroy]
    resources :grocery_list_items, only: [:create, :destroy]
    resources :recipe_items, only: [:create, :destroy]
    resources :grocery_sections, only: [:create, :destroy]
    resources :grocery_section_items, only: [:create, :destroy]
    patch '/grocery_section_items/rearrange' => '/api/grocery_section_items#rearrange'
    get '/active_list' => '/api/active_list#show'
    post '/active_list/:id' => '/api/active_list#add'
    post '/active_list/add_from_list/:id' => '/api/active_list#add_from_list'
    post '/active_list/add_from_recipe/:id' => '/api/active_list#add_from_recipe'
    delete '/active_list/:id' => '/api/active_list#remove'
    delete '/active_list' => '/api/active_list#clear'
    post '/reset_tasks_early' => '/api/actions#reset_tasks_early'
  end

end
