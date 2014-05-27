#
# candidate model
#
require 'mongoid'

module BookscanPremiumOptimizer
	class Candidate
		include Mongoid::Document
		include Mongoid::Timestamps
		store_in collection: "candidates"

		field :name, type: String
		field :isbns, type: Array

		def self.new_list(title = '')
			candidate = create(title: title, isbns: [])
			candidate.save
			return candidate
		end

		def add(isbn)
			self.isbns << isbn.strip.gsub(/-/, '')
			save
			return self
		end
	end
end
