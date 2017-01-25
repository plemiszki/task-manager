source 'https://rubygems.org'
ruby '2.3.1'

gem 'rails', '4.2.5' # Bundle edge Rails instead: gem 'rails', github: 'rails/rails'
gem 'pg', '~> 0.15' # Use postgresql as the database for Active Record
gem 'sass-rails', '~> 5.0' # Use SCSS for stylesheets
gem 'uglifier', '>= 1.3.0' # Use Uglifier as compressor for JavaScript assets
gem 'jquery-rails' # Use jquery as the JavaScript library
gem 'jbuilder', '~> 2.0' # Build JSON APIs with ease. Read more: https://github.com/rails/jbuilder
gem 'sdoc', '~> 0.4.0', group: :doc # bundle exec rake doc:rails generates the API under doc/api.

# My Gems ----------------------
gem 'bootstrap-sass'
gem 'clearance', '~> 1.11'
gem 'database_cleaner'
# ------------------------------

group :development, :test do
  gem 'byebug'
  gem 'pry-rails'
  gem 'better_errors'
end

group :development do
  gem 'web-console', '~> 2.0' # see console on error pages (or <% console %>)
  gem 'spring' # Spring speeds up development by keeping your application running in the background. Read more: https://github.com/rails/spring
end

group :production do
  gem 'rails_12factor' # apparently heroku needs this
end
