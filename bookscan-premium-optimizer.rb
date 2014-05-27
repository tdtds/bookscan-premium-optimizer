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
require_relative 'models/candidate'

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
				sessions: {default: {uri: 'mongodb://localhost:27017/bpo'}}
			})
		end

		get '/' do
			haml :index
		end

		post '/' do
			candidate = Candidate.new_list
			redirect "/#{candidate.id}"
		end

		get '/:id' do
			id = params[:id]
			candidate = Candidate.where(id: id).first
			return 404 unless candidate
			p candidate.title
			haml :list
		end
	end
end

BookscanPremiumOptimizer::App.run! if __FILE__ == $0
