module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-compass');

  grunt.initConfig({
    compass: {                  // Task
      dist: {                   // Target
        options: {              // Target options
          sassDir: 'styles',
          cssDir: 'css',
          environment: 'production'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-sass');

  grunt.registerTask('default', ['sass']);

}