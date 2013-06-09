module.exports = function(grunt) {

	grunt.initConfig({
		coffee: {
	      compile: {
	        files: {
	          'scripts/*.js': ['scripts/*.coffee','scripts/**/*.coffee'] 
	        },
	        options: {
	          basePath: 'scripts',
	          bare:false
	        }
	      }
	    }

	});

};