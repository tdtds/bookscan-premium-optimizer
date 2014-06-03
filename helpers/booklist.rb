#
# booklist helper
#

require 'algorithm/genetic'
require 'algorithm/genetic/selection/elite'
require 'algorithm/genetic/crossover/order'
require 'algorithm/genetic/mutation/swap'
require_relative 'book'

module BookscanPremiumOptimizer
	class BookscanEvaluator < Algorithm::Genetic::Evaluator
		def initialize(max = 10)
			@max = max
		end
	
		def fitness(gene)
			fit = 0.0
			count = 0
			pages = 0
			gene.code.each do |book|
				if count + book.count > @max
					fit = fit * 10000 + pages
					count = 0
					pages = 0
				end
				count += book.count
				pages += book.pages
			end
			return fit + (pages / 10000.0)
		end
	
		def terminated?(gene)
			# cannot know termination by gene.
			# stop yourself by limitation of generation count
			return false
		end
	end

	module Booklist
		def self.pack(list, lite = false)
			max = lite ? 10 : 50

			# check 1 box
			count = list.inject(0){|count, book| count += book.count}
			return [list] if count <= max

			# over 1 box, using GA
			groups = 10
			population = Algorithm::Genetic::Population.new(
				groups, BookscanEvaluator.new(max),
				selection: [:elite, groups - 2],
				crossover: [:order],
				mutation: [:swap],
				mutation_chance: 0.3
			){list.shuffle}
			1000.times{population.generate}

			boxes = []
			tmp = []
			count = 0
			population.first.code.each do |book|
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

