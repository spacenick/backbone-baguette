backbone-baguette [![Build Status](https://travis-ci.org/spacenick/backbone-baguette.png?branch=master)](https://travis-ci.org/spacenick/backbone-baguette)
=================

As a Backbone fanatic, I quickly noticed that I was running into the rewriting of a lot of similar code. I also did not wanted to use an on-top framework for small applications.
This project is highly inspired by Aura and Backbone Marionnette, but is aiming at smaller projects, which don't necessarily require all the great features provided by this kind of on-top frameworks.

[DOCS and EXAMPLES](http://spacenick.github.com/backbone-baguette)


Features to be added very soon :

CollectionView:
-----------------
* headers, footers and betweens : arrays of view or plain html that offer a better flow control of the collectionView rendering process, and allow you to insert static views before, after, or in the middle (depending on the index or so)
* modelView can be a function who is passed the current model, and has to return a view to be instantiated as the model view.
Useful if you want to have different views for your models depending on an attribute (like if you have a collection of tweets but some are favorited, and you want a view having a different style or a different behavior or so)
* add:true when you know that your collection has always the same order (ascending), the add event won't re-render everything but will just append a new model view at the end. Saves a lot of performances (if you build a chat system for instance)
