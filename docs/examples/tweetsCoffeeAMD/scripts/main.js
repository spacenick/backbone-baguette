
requirejs.config({
  urlArgs: 'bust=' + new Date().getTime(),
  baseUrl: 'scripts/',
  shim: {
    'lib/backbone': {
      deps: ['lib/jquery', 'lib/lodash'],
      exports: 'Backbone'
    },
    'lib/lodash': {
      exports: '_'
    },
    'lib/jquery': {
      exports: '$'
    },
    'lib/handlebars': {
      exports: 'Handlebars'
    },
    'templates/templates': {
      deps: ['lib/handlebars']
    },
    'app': {
      deps: ['lib/backbone', 'templates/templates', 'lib/handlebars']
    }
  },
  paths: {
    Baguette: '../../../src'
  },
  map: {
    '*': {
      'Backbone': 'lib/backbone'
    }
  }
});

require(['app'], function(app) {
  return app.init();
});
