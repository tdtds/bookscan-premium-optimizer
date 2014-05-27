#
# spec/helpers/book_spec.rb
#

require 'spec_helper'
require 'helpers/book'

describe 'BookscanPremiumOptimizer::Book' do
	describe '#count' do
		it('350'){expect(BookscanPremiumOptimizer::Book.new('', '', 350).count).to eq 1}
		it('550'){expect(BookscanPremiumOptimizer::Book.new('', '', 550).count).to eq 2}
		it('750'){expect(BookscanPremiumOptimizer::Book.new('', '', 750).count).to eq 3}
		it('950'){expect(BookscanPremiumOptimizer::Book.new('', '', 950).count).to eq 4}

		it('349'){expect(BookscanPremiumOptimizer::Book.new('', '', 349).count).to eq 1}
		it('351'){expect(BookscanPremiumOptimizer::Book.new('', '', 351).count).to eq 2}
		it('549'){expect(BookscanPremiumOptimizer::Book.new('', '', 549).count).to eq 2}
		it('551'){expect(BookscanPremiumOptimizer::Book.new('', '', 551).count).to eq 3}
		it('749'){expect(BookscanPremiumOptimizer::Book.new('', '', 749).count).to eq 3}
		it('751'){expect(BookscanPremiumOptimizer::Book.new('', '', 751).count).to eq 4}
	end
end

