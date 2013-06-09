
define(function() {
  return Backbone.View.extend({
    render: function() {
      this.$el.html('#MHSC');
      return this;
    },
    events: {
      'click': 'click'
    },
    click: function() {
      this.model.set({
        'text': this.$el.text(),
        typed: false
      });
      this.collection.search.call(this.collection, this.$el.text());
      return this;
    }
  });
});
