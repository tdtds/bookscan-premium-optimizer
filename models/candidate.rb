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
		field :title, type: String

		def self.new_list(title = '')
			candidate = create(title: title, isbns: [])
			candidate.save
			return candidate
		end

		def add(isbn)
			isbn = canonical isbn
			unless self.isbns.index(isbn)
				self.isbns << canonical(isbn)
				save
			end
			return self
		end

		def delete(isbn)
			self.isbns.delete(canonical isbn)
			save
			return self
		end

	private
		def canonical(isbn)
			isbn.strip.gsub(/-/, '')
		end
	end
end
