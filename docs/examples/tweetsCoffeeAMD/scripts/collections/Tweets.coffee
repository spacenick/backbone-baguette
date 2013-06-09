define ['models/Tweet'],(TweetModel) ->
	Backbone.Collection.extend
		url:'http://search.twitter.com/search.json'
		model:TweetModel
		search:(text) ->
			if text.length == 0 
				@reset []
			else @fetch 
				data:
					q:encodeURIComponent text
					lang:"en"
			@currentSearch = text;
			@
		sync:(method,model,options) ->
			options.dataType = 'jsonp'
			Backbone.sync.call @,method,model,options
			@
		parse:(data) ->
			data.results
		
