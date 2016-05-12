require 'rubygems'
require 'rake'

begin
	require 'rspec/core/rake_task'
	desc 'Run the code in specs'
	RSpec::Core::RakeTask.new(:spec) do |t|
		t.pattern = "spec/**/*_spec.rb"
	end
	task :default => [:spec]
rescue LoadError => e
end

require 'sinatra/asset_pipeline/task'
require './bookscan-premium-optimizer'
Sinatra::AssetPipeline::Task.define! BookscanPremiumOptimizer::App

desc 'watch jsx'
task :watch_jsx do
	sh 'jsx -w -x jsx --harmony assets/jsx assets/js'
end

# Local Variables:
# mode: ruby
# indent-tabs-mode: t
# tab-width: 3
# ruby-indent-level: 3
# End:
# vim: ts=3
