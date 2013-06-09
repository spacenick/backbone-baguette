module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    less:{
      development: {
        // options: {
        //   paths: ["assets/css"]
        // },
        files: {
          "css/main.css": "less/flat-ui.less"
        }
      }
    },
    watch:{
      css: {
        files: 'less/**/*.less',
        tasks: ['less'],
        options: {
          livereload: true,
        },
      }
    }
  });


  grunt.registerTask('default', ['less']);

}