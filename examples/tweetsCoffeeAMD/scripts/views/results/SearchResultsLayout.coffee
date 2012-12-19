define ['Baguette/CompositeView','views/results/SearchTitle','views/results/SearchResults'],(CompositeView,SearchTitle, SearchResults) ->
	CompositeView.extend
		id:'results'
		tpl:'<div class="searchTitle"></div><div class="searchResults"></div>'
		nestedViews:
			'.searchTitle':SearchTitle,
			'.searchResults':
				view:SearchResults,
				setElement:false