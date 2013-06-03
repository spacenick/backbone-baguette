module.exports = function(grunt) {

  // Loading tasks
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-jasmine');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  // Config begins
  grunt.initConfig({
    uglify:{
      dist:{
        src:['backbone.baguette.js'],
        dest:'backbone.baguette.min.js'
      },
      modules:{
        src:['temp/concat.js'],
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
        dest:'temp/concat.js'
      }
    },
    // jasmine:{
    //   all:['tests/SpecRunner.html']
    // }
    jasmine: {
      build: {
        src: 'backbone.baguette.min.js',
        options: {
          helpers:['tests/lodash.js','tests/jquery.js','tests/handlebars.js','tests/backbone.js'],
          specs: 'tests/spec/*Spec.js'
        }
      }
    }
  });

  grunt.registerTask('default',['jshint:dev','min:dist']);
  grunt.registerTask('build',['jshint:modules','concat:modules','uglify:modules','jasmine:build']);

};