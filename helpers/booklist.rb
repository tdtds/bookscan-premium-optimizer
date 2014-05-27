#
# booklist helper
#

require_relative 'book'

module BookscanPremiumOptimizer
	module Booklist
		def self.pack(list, lite = false)
			max = lite ? 10 : 50

			# check 1 box
			count = list.inject(0){|count, book| count += book.count}
			return [list] if count <= max

			# over 1 box
			boxes = []
			tmp = []
			count = 0
			list.dup.each do |book|
				if count + book.count > max
					boxes << tmp
					tmp = []
					count = 0
				end
				tmp << book
				count += book.count
			end
			boxes << tmp unless tmp.empty?
			return boxes
		end
	end
end

