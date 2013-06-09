
define(['Baguette/ModelView'], function(ModelView) {
  return ModelView.extend({
    tagName: 'input',
    className: 'inputSearch',
    attributes: {
      placeholder: 'Type a word to search on Twitter'
    },
    events: {
      'keyup': 'search'
    },
    render: function() {
      if (!this.model.get('typed')) {
        this.$el.val(this.model.get('text'));
      }
      return this;
    },
    search: function() {
      var _this = this;
      if (this.timeout !== null) {
        clearInterval(this.timeout);
      }
      this.timeout = setTimeout(function() {
        _this.model.set.call(_this.model, {
          text: _this.$el.val(),
          typed: true
        });
        _this.collection.search(_this.$el.val());
        return _this.timeout = null;
      }, 500);
      return this;
    }
  });
});
