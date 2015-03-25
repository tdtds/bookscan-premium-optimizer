begin
	require 'rubygems'
	require 'rake'
	require 'rspec/core/rake_task'
	require 'sinatra/asset_pipeline/task'
	require './bookscan-premium-optimizer'
	
	task :default => [:spec]
	
	desc 'Run the code in specs'
	RSpec::Core::RakeTask.new(:spec) do |t|
		t.pattern = "spec/**/*_spec.rb"
	end

	Sinatra::AssetPipeline::Task.define! BookscanPremiumOptimizer::App
rescue LoadError => e
	puts e
end

# Local Variables:
# mode: ruby
# indent-tabs-mode: t
# tab-width: 3
# ruby-indent-level: 3
# End:
# vim: ts=3
