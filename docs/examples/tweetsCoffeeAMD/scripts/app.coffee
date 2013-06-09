define ['models/TweetSearch','collections/Tweets','views/search/SearchLayout','views/results/SearchResultsLayout'],(TweetSearch,Tweets, SearchLayout,SearchResultsLayout)->
	init: ->
		tweetModelSearch = new TweetSearch
		tweetResults = new Tweets

		searchLayout = new SearchLayout {model:tweetModelSearch,collection:tweetResults}
		searchResultsLayout = new SearchResultsLayout {model:tweetModelSearch,collection:tweetResults}

		$('body').append searchLayout.render().$el
		$('body').append searchResultsLayout.render().$el
