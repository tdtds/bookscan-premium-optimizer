#
# bookscan-premium-optimizer.rb
#
require 'sinatra/base'
require 'haml'
require 'json'
require 'mongoid'
require 'rack/csrf'

require_relative 'helpers/book'
require_relative 'helpers/booklist'

module BookscanPremiumOptimizer
	class App < Sinatra::Base
		set :haml, {format: :html5, escape_html: true}
		enable :logging

		configure :production do
			Mongoid::Config.load_configuration({
				sessions: {default: {uri: ENV['MONGOLAB_URI']}}
			})
		end

		configure :development, :test do
			Bundler.require :development
			register Sinatra::Reloader
			disable :protection
			set :logging, ::Logger::DEBUG
			Mongoid::Config.load_configuration({
				sessions: {default: {uri: 'mongodb://localhost:27017/mrat'}}
			})
		end

		get '/' do
			haml :index
		end
	end
end

BookscanPremiumOptimizer::App.run! if __FILE__ == $0
