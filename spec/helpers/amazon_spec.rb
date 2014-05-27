#
# spec/helpers/amazon_spec.rb
#

require 'spec_helper'
require 'helpers/amazon'

describe 'BookscanPremiumOptimizer::Amazon' do
	def good_book; '978-4757541450'; end
	def fail_book; '978-4757541443'; end
	describe 'constructor' do
		it('Good book') {
			expect(BookscanPremiumOptimizer::Amazon.new(good_book).xml).to match /<NumberOfPages>198</
		}
		it('Fail book') {
			expect(BookscanPremiumOptimizer::Amazon.new(fail_book).xml).not_to match /<NumberOfPages>/
		}
	end

	describe 'pages' do
		it('Good book') {
			expect(BookscanPremiumOptimizer::Amazon.new(good_book).pages).to eq 198
		}
		it('Fail book') {
			expect(BookscanPremiumOptimizer::Amazon.new(fail_book).pages).to eq nil
		}
	end

	describe 'title' do
		it('Good book') {
			expect(BookscanPremiumOptimizer::Amazon.new(good_book).title).to match /ガールズ ニュージェネレーションズ/
		}
	end

	describe 'url' do
		it('Good book') {
			expect(BookscanPremiumOptimizer::Amazon.new(good_book).url).to match 'cshs-22'
		}
	end
end
