#
# spec/helpers/booklist_spec.rb
#

require 'spec_helper'
require 'helpers/booklist'

describe 'BookscanPremiumOptimizer::Booklist' do
	Book = BookscanPremiumOptimizer::Book
	Booklist = BookscanPremiumOptimizer::Booklist

	describe 'Booklist.pack' do
		before do
			@all = Array.new(100) {|i|
				pages = i * 10 + 300
				Book.new("book-#{'%03d' % pages}", '', pages)
			}
		end

		it('1 box') {
			expect(Booklist.pack(@all[0,1], true)[0].first.title).to eq 'book-300'
			expect(Booklist.pack(@all[0,8], true)[0].last.title).to eq 'book-370'
			expect(Booklist.pack(@all[0,8], true)[1]).to eq nil
		}

		it('2 boxes') {
			expect(Booklist.pack(@all[0,9], true)[0].last.title).to eq 'book-370'
			expect(Booklist.pack(@all[0,9], true)[1].last.title).to eq 'book-380'
			expect(Booklist.pack(@all[0,11], true)[1].last.title).to eq 'book-400'
		}
	end
end
