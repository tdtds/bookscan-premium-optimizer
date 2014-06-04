#
# bookscan-premium-optimizer.rb
#
require 'sinatra/base'
require 'haml'
require 'json'
require 'mongoid'
require 'rack/csrf'
require 'dalli'

require_relative 'helpers/amazon'
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
			set :cache, Dalli::Client.new(
				ENV["MEMCACHIER_SERVERS"],
				:username => ENV["MEMCACHIER_USERNAME"],
				:password => ENV["MEMCACHIER_PASSWORD"],
				:expires_in => 24 * 60 * 60)
		end

		configure :development, :test do
			Bundler.require :development
			register Sinatra::Reloader
			disable :protection
			set :logging, ::Logger::DEBUG
			Mongoid::Config.load_configuration({
				sessions: {default: {uri: 'mongodb://localhost:27017/bpo'}}
			})
			set :cache, Dalli::Client.new(nil, :expires_in => 24 * 60 * 60)
		end

		def amazon(isbn)
			amazon = settings.cache.get(isbn)
			unless amazon
				amazon = BookscanPremiumOptimizer::Amazon.new(isbn)
				settings.cache.set(amazon.isbn, amazon)
			end
			return amazon
		end

		def booklist(candidate)
			books = candidate.isbns.map do |isbn|
				begin
					a = amazon(isbn)
					BookscanPremiumOptimizer::Book.new(a.title, a.url, a.pages, a.isbn)
				rescue AmazonError
					nil
				end
			end
			BookscanPremiumOptimizer::Booklist.pack(books.compact, true)
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
			begin
				a = amazon(isbn)
				candidate.add(a.isbn)
				return booklist(candidate).to_json
			rescue AmazonError
				return 404
			end
		end

		delete '/:id/:isbn' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate

			isbn = params[:isbn]
			return booklist(candidate.delete(isbn)).to_json
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
