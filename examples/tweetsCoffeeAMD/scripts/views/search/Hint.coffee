define ['Baguette/CompositeView','views/search/HintLink'],(CompositeView,HintLink) ->
	CompositeView.extend
		tpl:'Too lazy to type? Why not searching for my hometown football club <a href="#"></a> then ?'
		nestedViews:
			'a':HintLink
		