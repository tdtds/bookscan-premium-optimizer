#
# bookscan-premium-optimizer.rb
#
Bundler.require
require 'json'

require_relative 'helpers/amazon'
require_relative 'helpers/book'
require_relative 'helpers/booklist'
require_relative 'models/candidate'

module BookscanPremiumOptimizer
	class App < Sinatra::Base
		set :haml, {format: :html5, escape_html: true}
		enable :logging

		set :assets_precompile, %w(app.js app.css *.png *.jpg *.svg)
		set :assets_css_compressor, :yui
		set :assets_js_compressor, :uglifier
		register Sinatra::AssetPipeline
		if defined?(RailsAssets)
			RailsAssets.load_paths.each do |path|
				settings.sprockets.append_path(path)
			end
		end

		configure :production do
			Mongo::Logger.level = Logger::WARN
			Mongoid::Config.load_configuration({
				clients: {default: {uri: ENV['MONGODB_URI'] || ENV['MONGOLAB_URI']}}
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
			Mongo::Logger.level = Logger::WARN
			Mongoid::Config.load_configuration({
				clients: {default: {uri: 'mongodb://localhost:27017/bpo'}}
			})
			set :cache, Dalli::Client.new(nil, :expires_in => 24 * 60 * 60)
		end

		def amazon(isbn, async = true)
			amazon = settings.cache.get(isbn)
			return amazon if amazon

			if async
				AmazonPool.add(isbn, settings.cache);
				raise AmazonTimeout.new('no amazon data in cache, retry.');
			else
				amazon = Amazon.new(isbn)
				settings.cache.set(isbn, amazon)
				settings.cache.set(amazon.isbn, amazon) if isbn != amazon.isbn
				return amazon
			end
		end

		def convert2long(candidate, isbns)
			isbns.map do |short, long|
				candidate.delete(short)
				candidate.add(long)
			end
		end

		def booklist(candidate, async = true)
			timeout = nil
			convert = {}
			books = candidate.isbns.map do |isbn|
				begin
					a = amazon(isbn, async)
					if isbn.length < 13 # convert short ISBN to long
						convert[isbn] = a.isbn
					end
					BookscanPremiumOptimizer::Book.new(a.title, a.url, a.pages, a.isbn)
				rescue AmazonError
					nil
				rescue AmazonTimeout => e
					timeout = e
				end
			end
			convert2long(candidate, convert)
			raise timeout if timeout
			return BookscanPremiumOptimizer::Booklist.pack(books.compact, true)
		end

		get '/' do
			haml :index
		end

		post '/' do
			candidate = Candidate.new_list
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
				a = amazon(isbn, false)
				candidate.add(a.isbn)
				return booklist(candidate, false).to_json
			rescue AmazonError
				return 404
			end
		end

		delete '/:id/:isbn' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate

			isbn = params[:isbn]
			return booklist(candidate.delete(isbn), false).to_json
		end

		get '/:id/list' do
			booklist_id = params[:id]
			candidate = Candidate.where(id: booklist_id).first
			return 404 unless candidate

			begin
				return booklist(candidate).to_json
			rescue AmazonTimeout
				return 408 # Timeout
			end
		end
	end
end

BookscanPremiumOptimizer::App.run! if __FILE__ == $0
