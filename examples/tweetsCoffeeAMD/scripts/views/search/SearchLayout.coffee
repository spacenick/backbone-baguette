define ['Baguette/CompositeView','views/search/SearchInput','views/search/Hint'],(CompositeView,SearchInput,HintView) ->
	CompositeView.extend
		id:'search'
		noBind:true
		tpl:'<div class="searchBox"></div><div class="hint"></div>'
		nestedViews:
			'.searchBox':
				view:SearchInput,
				setElement:false
			'.hint':HintView
