module.exports = function(grunt) {
	grunt.loadNpmTasks('grunt-jasmine-task');

	grunt.initConfig({
		min:{
			dist:{
				src:['backbone.baguette.js'],
				dest:'backbone.baguette.min.js'
			},
			modules:{
				src:['temp/concat.js'],
				dest:'backbone.baguette.min.js'
			}
		},
		lint:{
			dev:['backbone.baguette.js'],
			modules:['src/*.js']
		},
		concat:{
			modules:{
				src:['src/Utils.js','src/Loader.js','src/Templating.js','src/LoadableView.js','src/ModelView.js','src/CollectionView.js','src/CompositeView.js'],
				dest:'temp/concat.js'
			}
		},
		jasmine:{
			all:['tests/SpecRunner.html']
		}
	});

	grunt.registerTask('default',['lint:dev','min:dist']);
	grunt.registerTask('build',['lint:modules','concat:modules','min:modules','jasmine']);

};