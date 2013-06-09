define ['Baguette/ModelView'], (ModelView) ->
	ModelView.extend
		tagName:'input'
		className:'inputSearch'
		attributes:
			placeholder:'Type a word to search on Twitter'
		events:
			'keyup':'search'
		render:->
			if !@model.get 'typed' 
				@$el.val @model.get('text')
			@
		search:->
			if (@timeout != null) 
				clearInterval @timeout
			@timeout = setTimeout =>
				@model.set.call @model,{text:@$el.val(),typed:true}
				@collection.search @$el.val()
				@timeout = null;
			,500
			@
