#
# spec_helper.rb
#

$:.unshift File.expand_path(File.join(File.dirname(__FILE__), '..')).untaint
Bundler.require :test if defined?(Bundler)

RSpec.configure do |config|
	require 'mongoid'
	Mongoid::Config.load_configuration({
		sessions: {
			default: {
				uri: 'mongodb://localhost:27017/bpo_test'
			}
		}
	})
end
