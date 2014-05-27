#
# amazon helper
#

require 'open-uri'
require 'rexml/document'

module BookscanPremiumOptimizer
	class Amazon
		SUBSCRIPTION_ID = '1CVA98NEF1G753PFESR2'
		REQUIRE_VERSION = '2011-08-01'
		RPA_PROXY = 'http://rpaproxy.tdiary.org/rpaproxy/jp/'

		attr_reader :xml

		def initialize(isbn, aid = 'cshs-22')
			@xml = build_url(isbn, aid)
			@doc = REXML::Document::new( @xml ).root.elements
		end

		def pages
			begin
				@pages ||= @doc.to_a('*/Item/*/NumberOfPages').first.text.to_i
			rescue NoMethodError
				@pages = nil
			end
			return @pages
		end

		def title
			begin
				@title ||= @doc.to_a('*/Item/*/Title').first.text
			rescue NoMethodError
				@title = nil
			end
			return @title
		end

		def url
			begin
				@url ||= @doc.to_a('*/Item/DetailPageURL').first.text
			rescue NoMethodError
				@url = nil
			end
			return @url
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

