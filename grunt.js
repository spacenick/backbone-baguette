module.exports = function(grunt) {

	grunt.initConfig({
		min:{
			dist:{
				src:['backbone.baguette.js'],
				dest:'backbone.baguette.min.js'
			}
		},
		lint:{
			dev:['backbone.baguette.js']
		}
	});

	grunt.registerTask('default',['lint:dev','min']);

};