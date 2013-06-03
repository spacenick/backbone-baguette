module.exports = function(grunt) {

  // Loading tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Config begins
  grunt.initConfig({
    uglify:{
      dist:{
        src:['backbone.baguette.js'],
        dest:'backbone.baguette.min.js'
      }
    },
    jshint:{
      dev:['backbone.baguette.js'],
      modules:['src/*.js']
    },
    concat:{
      modules:{
        src:['src/Utils.js','src/Loader.js','src/Templating.js','src/LoadableView.js','src/ModelView.js','src/CollectionView.js','src/CompositeView.js'],
        dest:'backbone.baguette.js'
      }
    },
    // jasmine:{
    //   all:['tests/SpecRunner.html']
    // }
    jasmine: {
      dev: {
        src: 'backbone.baguette.js',
        options: {
          helpers:['tests/lodash.js','tests/jquery.js','tests/handlebars.js','tests/backbone.js'],
          specs: 'tests/spec/*Spec.js'
        }
      },
      compiled:{
        src: 'backbone.baguette.min.js',
        options: {
          helpers:['tests/lodash.js','tests/jquery.js','tests/handlebars.js','tests/backbone.js'],
          specs: 'tests/spec/*Spec.js'
        }
      }
    },
    watch: {
      dev: {
        files: 'src/*.js',
        tasks: ['compile']
      }
    }
  });

  grunt.registerTask('compile',['jshint:modules','concat:modules']);
  grunt.registerTask('build',['compile','uglify','jasmine']);
  grunt.registerTask('default',['compile']);


};