#
# amazon helper
#

require 'resolv-replace'
require 'open-uri'
require 'timeout'
require 'rexml/document'
require 'thread'

module BookscanPremiumOptimizer
	class AmazonError < StandardError; end
	class AmazonTimeout < StandardError; end

	class Amazon
		SUBSCRIPTION_ID = '1CVA98NEF1G753PFESR2'.freeze
		REQUIRE_VERSION = '2011-08-01'.freeze
		RPA_PROXY = 'http://rpaproxy.tdiary.org/rpaproxy/jp/'.freeze

		attr_reader :xml

		def self.canonical(isbn)
			isbn.strip.gsub(/-/, '')
		end

		def initialize(isbn, aid = 'cshs-22')
			@isbn_org = isbn
			@xml = build_url(isbn, aid)
			@doc = REXML::Document::new(@xml).root.elements

			begin
				pages()
				title()
				url()
			rescue
			end
		end

		def isbn
			begin
				return @isbn ||= (@doc.to_a('*/Item/*/EAN').first || @doc.to_a('*/Item/*/ISBN').first).text
			rescue NoMethodError
				raise AmazonError.new('no ISBN')
			end
		end

		def pages
			begin
				return @pages ||= @doc.to_a('*/Item/*/NumberOfPages').first.text.to_i
			rescue NoMethodError
				raise AmazonError.new('no pages')
			end
		end

		def title
			begin
				return @title ||= @doc.to_a('*/Item/*/Title').first.text
			rescue NoMethodError
				raise AmazonError.new('no title')
			end
		end

		def url
			begin
				return @url ||= @doc.to_a('*/Item/DetailPageURL').first.text
			rescue NoMethodError
				raise AmazonError.new('no URL')
			end
		end

	private
		def build_url(isbn, aid)
			asin = isbn
			digit = isbn.gsub(/[^\d]/, '')
			if digit.length == 13 # ISBN-13
				asin = digit
				id_type = /^97[89]/ =~ digit ? 'ISBN' : 'EAN'
			else
				id_type = 'ASIN'
			end
			url = RPA_PROXY.dup
			url << "?Service=AWSECommerceService"
			url << "&SubscriptionId=#{SUBSCRIPTION_ID}"
			url << "&AssociateTag=#{aid}" if aid
			url << "&Operation=ItemLookup"
			url << "&ItemId=#{asin}"
			url << "&IdType=#{id_type}"
			url << "&SearchIndex=Books" if id_type == 'ISBN'
			url << "&SearchIndex=All"   if id_type == 'EAN'
			url << "&ResponseGroup=Medium"
			url << "&Version=#{REQUIRE_VERSION}"

			retry_count = 0
			begin
				Timeout::timeout(10){
					xml = open(url, &:read)
				}
			rescue Timeout::Error
				raise AmazonError('timeout')
			rescue OpenURI::HTTPError
				retry_count += 1
				raise AmazonError('retry over') if retry_count >= 5
				retry
			end
		end
	end

	class AmazonPool
		@@queue = nil
		@@reserve_mutex = Mutex.new
		@@reserve = {}

		def self.add(isbn, cache)
			init
			@@reserve_mutex.synchronize do
				if @@reserve[isbn]
					return
				else
					@@reserve[isbn] = true
				end
			end
			@@queue.push([isbn, cache])
		end

	private
		def self.init
			return if @@queue
			@@queue = Queue.new

			5.times do
				Thread.start do
					loop do
						isbn, cache = @@queue.pop
						if cache.get(isbn)
							@@reserve_mutex.synchronize{@@reserve.delete(isbn)}
							next
						end

						begin
							puts "getting book data from amazon (#{isbn})."
							amazon = BookscanPremiumOptimizer::Amazon.new(isbn)
							cache.set(amazon.isbn, amazon)
							cache.set(isbn, amazon) if isbn != amazon.isbn
						ensure
							@@reserve_mutex.synchronize{@@reserve.delete(isbn)}
						end
					end
				end
			end
		end
	end
end

