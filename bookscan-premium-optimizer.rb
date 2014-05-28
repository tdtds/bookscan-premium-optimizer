#
# bookscan-premium-optimizer.rb
#
require 'sinatra/base'
require 'haml'
require 'json'
require 'mongoid'
require 'rack/csrf'

require_relative 'helpers/amazon'
require_relative 'helpers/book'
require_relative 'helpers/booklist'
require_relative 'models/candidate'

module BookscanPremiumOptimizer
	class App < Sinatra::Base
		BOOKS = {}

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

		def booklist(candidate)
			books = candidate.isbns.map do |isbn|
				amazon = BOOKS[isbn]
				unless amazon
					amazon = BookscanPremiumOptimizer::Amazon.new(isbn)
					BOOKS[isbn] = amazon
				end
				BookscanPremiumOptimizer::Book.new(amazon.title, amazon.url, amazon.pages)
			end
			BookscanPremiumOptimizer::Booklist.pack(books, true)
		end

		get '/' do
			haml :index
		end

		post '/' do
			candidate = Candidate.new_list
			p candidate
			redirect "/#{candidate.id}"
		end

		get '/:id' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate
			haml :list, locals: {booklist_id: booklist_id}
		end

		put '/:id' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate

			isbn = params[:isbn]
			candidate.add(isbn)
			list = booklist(candidate)
			return list.to_json
		end

		get '/:id/list' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate

			list = booklist(candidate)
			return list.to_json
		end
	end
end

BookscanPremiumOptimizer::App.run! if __FILE__ == $0
