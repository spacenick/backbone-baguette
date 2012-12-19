module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		coffee: {
	      compile: {
	        files: {
	          'scripts/*.js': ['scripts/*.coffee','scripts/**/*.coffee'] 
	        },
	        options: {
	          basePath: 'scripts',
	          bare:true
	        }
	      }
	    },
	    watch:{
	    	coffee: {
        		files: 'scripts/**/*.coffee',
        		tasks: 'coffee'
        	}
	    }

	});

	grunt.registerTask('default','coffee');

};