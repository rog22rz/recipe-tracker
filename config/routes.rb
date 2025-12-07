Rails.application.routes.draw do
  # Authentication
  resource :session
  resource :registration, only: [:new, :create]
  resources :passwords, param: :token

  # Recipes
  resources :recipes do
    resources :cooking_logs, only: [:create, :destroy]
  end

  # Health check
  get "up" => "rails/health#show", as: :rails_health_check

  # Root
  root "recipes#index"
end
