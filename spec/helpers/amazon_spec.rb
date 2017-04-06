#
# spec/helpers/amazon_spec.rb
#

require 'spec_helper'
require 'helpers/amazon'

describe 'BookscanPremiumOptimizer::Amazon' do
	def good_book; '978-4757541450'; end
	def fail_book; '978-4757541443'; end

	before :all do
		@good_book = BookscanPremiumOptimizer::Amazon.new(good_book)
		@fail_book = BookscanPremiumOptimizer::Amazon.new(fail_book)
	end

	describe 'good book' do
		it('#xml') {
			expect(@good_book.xml).to match /<NumberOfPages>198</
		}
		it('#pages') {
			expect(@good_book.pages).to eq 198
		}
		it('#title') {
			expect(@good_book.title).to match /ガールズ ニュージェネレーションズ/
		}
		it('#url') {
			expect(@good_book.url).to match 'cshs-22'
		}
	end

	describe 'Fail book' do
		it('#xml') {
			pending('sample has information of number of pages.')
			expect(@fail_book.xml).not_to match /<NumberOfPages>/
		}
		it('#pages') {
			pending('sample has information of number of pages.')
			expect{@fail_book.pages}.to raise_error(BookscanPremiumOptimizer::AmazonError)
		}
	end
end
