source 'https://rubygems.org'

ruby '2.2.2'

gem 'sinatra', require: 'sinatra/base'
gem 'sinatra-asset-pipeline', require: 'sinatra/asset_pipeline'
gem 'sprockets-helpers', '= 1.1.0'
gem 'react-jsx-sprockets', require: 'react-jsx-sprockets'
gem 'uglifier'
gem 'yui-compressor'

gem 'thin'
gem 'haml', require: 'haml'
gem 'mongoid', require: 'mongoid'
gem 'bson_ext'
gem 'rack_csrf', require: 'rack/csrf'
gem 'algorithm-genetic', require: 'algorithm/genetic'
gem 'dalli', require: 'dalli'

source 'https://rails-assets.org' do
	gem 'rails-assets-jquery'
	gem 'rails-assets-react'
end

group :development, :test do
	gem 'rake'
	gem 'rspec'
	gem 'autotest'
	gem 'sinatra-reloader', require: 'sinatra/reloader'
	gem 'pry'
end
