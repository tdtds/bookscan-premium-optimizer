#
# amazon helper
#

require 'open-uri'
require 'rexml/document'

module BookscanPremiumOptimizer
	class AmazonError < StandardError; end

	class Amazon
		SUBSCRIPTION_ID = '1CVA98NEF1G753PFESR2'
		REQUIRE_VERSION = '2011-08-01'
		RPA_PROXY = 'http://rpaproxy.tdiary.org/rpaproxy/jp/'

		attr_reader :xml

		def self.canonical(isbn)
			isbn.strip.gsub(/-/, '')
		end

		def initialize(isbn, aid = 'cshs-22')
			@xml = build_url(isbn, aid)
			@doc = REXML::Document::new( @xml ).root.elements

			isbn()
			pages()
			title()
			url()
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
			url = RPA_PROXY
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
			begin
				xml = open(url, &:read)
			rescue OpenURI::HTTPError
				retry
			end
		end
	end
end

