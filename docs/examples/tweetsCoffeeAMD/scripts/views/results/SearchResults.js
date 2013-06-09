
define(['Baguette/CollectionView', 'views/results/SearchResultsTweet'], function(CollectionView, SearchResultsTweet) {
  return CollectionView.extend({
    tagName: 'ul',
    modelView: SearchResultsTweet,
    loader: true
  });
});
