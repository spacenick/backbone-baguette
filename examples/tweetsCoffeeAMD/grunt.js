module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-coffee');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.initConfig({
		coffee: {
	      compile: {
	        files: {
	          'scripts/compiled.js': ['scripts/*.coffee','scripts/**/*.coffee'],
	          'scripts/compiled2.js' : ['scripts2/test1.coffee'] 
	        },
	        options: {
	          basePath: 'scripts',
	          bare:false,
	          join:true
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