var __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

define(['Baguette/ModelView'], function(ModelView) {
  var SearchTitle;
  return SearchTitle = (function(_super) {

    __extends(SearchTitle, _super);

    function SearchTitle() {
      return SearchTitle.__super__.constructor.apply(this, arguments);
    }

    SearchTitle.prototype.tpl = "Search results for <b>{{text}}</b>";

    SearchTitle.prototype.render = function() {
      if ((_.isUndefined(this.model.get('text'))) || (this.model.get('text').length === 0)) {
        this.$el.hide();
      } else {
        this.$el.show();
      }
      SearchTitle.__super__.render.apply(this, arguments);
      return this;
    };

    return SearchTitle;

  })(ModelView);
});
