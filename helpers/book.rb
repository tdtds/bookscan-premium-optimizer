#
# book helper
#

module BookscanPremiumOptimizer
	class Book
		attr_reader :title, :url, :pages

		def initialize(title, url, pages)
			@title, @url, @pages = title, url, pages
		end

		def count
			if pages <= 350
				1
			else
				((pages - 350) / 200.0).ceil + 1
			end
		end
	end
end


