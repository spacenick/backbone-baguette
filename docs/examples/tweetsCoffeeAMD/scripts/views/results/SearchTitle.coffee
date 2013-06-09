define ['Baguette/ModelView'], (ModelView) ->
	class SearchTitle extends ModelView
		tpl:"Search results for <b>{{text}}</b>",
		render:->
			if (_.isUndefined @model.get('text')) || (@model.get('text').length == 0)
				@$el.hide()
			else 
				@$el.show()
			super
			@