
define(['models/TweetSearch', 'collections/Tweets', 'views/search/SearchLayout', 'views/results/SearchResultsLayout'], function(TweetSearch, Tweets, SearchLayout, SearchResultsLayout) {
  return {
    init: function() {
      var searchLayout, searchResultsLayout, tweetModelSearch, tweetResults;
      tweetModelSearch = new TweetSearch;
      tweetResults = new Tweets;
      searchLayout = new SearchLayout({
        model: tweetModelSearch,
        collection: tweetResults
      });
      searchResultsLayout = new SearchResultsLayout({
        model: tweetModelSearch,
        collection: tweetResults
      });
      $('body').append(searchLayout.render().$el);
      return $('body').append(searchResultsLayout.render().$el);
    }
  };
});
