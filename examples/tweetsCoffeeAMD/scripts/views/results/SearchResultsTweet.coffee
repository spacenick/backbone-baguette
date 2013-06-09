define ['Baguette/ModelView'], (ModelView) ->
	ModelView.extend
		tagName:'li'
		compiledTemplate:Handlebars.templates['tweet']
		events:
			click:'click'
		click:->
			window.open 'https://twitter.com/'+this.model.get('from_user')+'/status/'+this.model.get('id_str')