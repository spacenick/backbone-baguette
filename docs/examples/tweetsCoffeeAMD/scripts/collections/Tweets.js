
define(['models/Tweet'], function(TweetModel) {
  return Backbone.Collection.extend({
    url: 'http://search.twitter.com/search.json',
    model: TweetModel,
    search: function(text) {
      if (text.length === 0) {
        this.reset([]);
      } else {
        this.fetch({
          data: {
            q: encodeURIComponent(text),
            lang: "en"
          }
        });
      }
      this.currentSearch = text;
      return this;
    },
    sync: function(method, model, options) {
      options.dataType = 'jsonp';
      Backbone.sync.call(this, method, model, options);
      return this;
    },
    parse: function(data) {
      return data.results;
    }
  });
});
