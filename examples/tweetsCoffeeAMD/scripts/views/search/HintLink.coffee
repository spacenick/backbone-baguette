define ->
	Backbone.View.extend
		render:->
			@$el.html '#MHSC'
			@
		events:
			'click':'click'
		click:->
			@model.set {'text':@$el.text(),typed:false}
			@collection.search.call @collection,@$el.text()
			@