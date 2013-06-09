define ['Baguette/CollectionView','views/results/SearchResultsTweet'], (CollectionView,SearchResultsTweet) -> 
	CollectionView.extend
		tagName:'ul'
		modelView:SearchResultsTweet
		loader:true
