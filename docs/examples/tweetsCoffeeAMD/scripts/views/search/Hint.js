
define(['Baguette/CompositeView', 'views/search/HintLink'], function(CompositeView, HintLink) {
  return CompositeView.extend({
    tpl: 'Too lazy to type? Why not searching for my hometown football club <a href="#"></a> then ?',
    nestedViews: {
      'a': HintLink
    }
  });
});
