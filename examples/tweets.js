// BACKBONE BAGUETTE EXAMPLE
// This is WAY much cleaner in an AMD environment obv

// Our models
// For this example we will use basic Backbone Models
var TweetSearch = Backbone.Model.extend({});
// Basic Tweet Model
var TweetModel = Backbone.Model.extend({});

// Tweets results collection
var Tweets = Backbone.Collection.extend({
	url:'http://search.twitter.com/search.json',
	model:TweetModel,
	initialize:function() {
		_.bindAll(this);
	},
	// Wrap the fetch function into a search method for a clean code
	search:function(text) {
		if (text.length == 0) this.reset([]);
		else this.fetch({data:{q:encodeURIComponent(text)},lang:"en"});
		this.currentSearch = text;
		return this;
	},
	// cross domain issue => let's go json p baby.
	sync:function(method,model,options) {
		options.dataType = 'jsonp';
		return Backbone.sync.call(this,method,model,options);
	},
	// Let's just get back the results attribute from Twitter API.
	parse:function(data) {
		return data.results;
	}
});

// Search Input
var SearchInput = Backbone.Baguette.ModelView.extend({
	tagName:'input',
	className:'inputSearch',
	attributes:{
		placeholder:'Type a word to search on Twitter'
	},
	events:{
		'keyup':'search'
	},
	// Override built-in function because we have a special case here : input text
	// No need to call super function - we don't need any templating here.
	render:function() {
		// only set val if model has been set from another source than our keyboard obv
		if (!this.model.get('typed')) this.$el.val(this.model.get('text'));
	},
	search:function() {
		var that = this;

		if (this.timeout != null) clearInterval(this.timeout);

		this.timeout = setTimeout(function(){
			that.model.set.call(that.model,{text:that.$el.val(),typed:true});
			that.collection.search(that.$el.val());
			that.timeout = null;
		},500);
	}
});

// Search title, will auto-update whenever we look for something
var SearchTitle = Backbone.Baguette.ModelView.extend({
	tpl:"Search results for <b>{{text}}</b>",
	render:function() {
		if (_.isUndefined(this.model.get('text')) || this.model.get('text').length == 0) this.$el.hide();
		else this.$el.show();
		// call super render. This is way more convenient when using CoffeeScript btw.
		Backbone.Baguette.ModelView.prototype.render.call(this);
	}
});

// Hint for a quick search

var HintLink = Backbone.View.extend({
	render:function() {
		this.$el.html('#MHSC');
	},
	events:{
		'click':'click'
	},
	click:function() {
		this.model.set({'text':this.$el.text(),typed:false});
		this.collection.search(this.$el.text());
	}
});

// CompositeView inside CompositeView ! (parented by SearchLayout)
var HintView = Backbone.Baguette.CompositeView.extend({
	tpl:'Too lazy to type? Why not searching for my hometown football club <a href="#"></a> then ?',
	nestedViews:{
		'a':HintLink
	}
})

// Our Search Layout
var SearchLayout = Backbone.Baguette.CompositeView.extend({
	id:'search',
	noBind:true,
	tpl:'<div class="searchBox"></div><div class="hint"></div>',
	nestedViews:{
		'.searchBox':{
			view:SearchInput,
			setElement:false
		},
		// HintView is a CompositeView! Blaaaa crazy composite chains BOOM (wat?)
		'.hint':HintView
	}
});

var SearchResultsTweet = Backbone.Baguette.ModelView.extend({
	tagName:'li',
	// We can also give a compiledTemplate to a modelView in order to speed up template compilation
	compiledTemplate:Handlebars.templates['tweet'],
	events:{
		click:'click'
	},
	click:function() {
		alert('Selected a tweet from '+this.model.get('from_user'));
	}
});

// Result list
var SearchResultsCollectionView = Backbone.Baguette.CollectionView.extend({
	tagName:'ul',
	modelView:SearchResultsTweet,
	loader:true
});

// Results
var SearchResultsLayout = Backbone.Baguette.CompositeView.extend({
	id:'results',
	tpl:'<div class="searchTitle"></div><div class="searchResults"></div>',
	nestedViews:{
		'.searchTitle':SearchTitle,
		'.searchResults':{
			view:SearchResultsCollectionView,
			setElement:false
		}
	}
});







// Initialize by rendering views
var tweetModelSearch = new TweetSearch({});
var tweetResults = new Tweets();

// Instantiating both layouts. As you can see you can pass them a model and also a collection references
// Both will be passed to inner views in order for them to process their data.
var searchLayout = new SearchLayout({model:tweetModelSearch,collection:tweetResults});

// For example here model will be used by the SearchTitle View (but he will not use collection at all)
// While the searchResultsCollectionView is obv going to use the collection data (and will have no use of our tweetModelSearch tho)
var searchResultsLayout = new SearchResultsLayout({model:tweetModelSearch,collection:tweetResults});
$('body').append(searchLayout.render().$el);
$('body').append(searchResultsLayout.render().$el);

