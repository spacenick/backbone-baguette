describe("Baguette ModelView",function(){
	var View, Model, view, model;

	// Before each spec instantiate
	beforeEach(function(){
		
		Model = Backbone.Model;
		View = Backbone.Baguette.ModelView;
		spyOn(View.prototype,'render').andCallThrough();

		model = new Model();
		view = new View({model:model, tpl:"{{name}}"});
		
	});


	it("should bind to model automatically & set $el to templated content",function(){

		expect(view.bindings.length).toEqual(1);

		model.set({name:"test"});

		expect(view.render).toHaveBeenCalled();
		expect(view.el.innerHTML).toEqual("test");
	
	});

	it("should not bind automatically if noBind is set",function(){
		// We need to create another model variable in this scope
		// Because view is also listening on "model" variable changes
		// And share the same prototype (so the same render function) than our noBindView
		var model2 = new Model();
		var noBindView = new View({model:model2, noBind:true});
		model2.set({name:"test"});
		
		expect(noBindView.render).not.toHaveBeenCalled();
	
	});

	it("should empty the view when calling clean",function(){
		view.clean();
		expect(view.el.innerHTML.length).toEqual(0);
	});

	it("should clean model binding when calling unbindFromAll",function(){

		view.unbindFromAll();
		expect(view.bindings.length).toEqual(0);
		model.set({name:"hepla"});
		expect(view.render).not.toHaveBeenCalled();

	});


});


describe("Baguette CollectionView",function(){

	var View, Model, view, model, Collection, CollectionView, collection, collectionView, collectionArray, model1, model2, model3;

	beforeEach(function(){
		
		Model = Backbone.Model;
		spyOn(Backbone.Baguette.BaseView.prototype,'destroy');
		View = Backbone.Baguette.ModelView.extend({tpl:"{{name}}",tagName:'li'});


		Collection = Backbone.Collection;
		CollectionView = Backbone.Baguette.CollectionView;
		// Spy before instantiating obv
		spyOn(CollectionView.prototype,'render').andCallThrough();
		spyOn(View.prototype,'render').andCallThrough();


		model1 = new Model({name:"Michel"});
		model2 = new Model({name:"Tatus"});
		model3 = new Model({name:"Jean-Marie"});
		collectionArray = [model1,model2,model3];

		collection = new Collection(collectionArray);

		collectionView = new CollectionView({collection:collection, modelView:View, tagName:'ul'});
	});

	it("should bind automatically to collection on any events & refresh view accordingly",function(){

		expect(collectionView.bindings.length).toEqual(1);
		expect(collectionView.bindings[0].ev).toEqual('add reset remove');
		expect(collectionView.bindings[0].model).toEqual(collection);

		var newModel = new Model({name:"Pascalounet"});
		collection.add(newModel);
		expect(collectionView.render).toHaveBeenCalled();

		expect(collectionView._views.length).toEqual(4);
		expect(collectionView.$el.find('li').size()).toEqual(4);
	
		collection.reset(collectionArray);
		expect(collectionView.render.calls.length).toEqual(2);
		expect(collectionView._views.length).toEqual(3);

		collection.remove(model1);
		expect(collectionView.render.calls.length).toEqual(3);
		expect(collectionView._views.length).toEqual(2);
		expect(collectionView.el.innerHTML).toEqual("<li>Tatus</li><li>Jean-Marie</li>");


	});

	it("should render each collection item in the correct modelView & auto template it",function(){

		collectionView.render();
		expect(collectionView.el.innerHTML).toEqual("<li>Michel</li><li>Tatus</li><li>Jean-Marie</li>");
		expect(collectionView._views.length).toEqual(3);
		_.each(collectionView._views,function(curView,i){
			expect(curView.model).toEqual(collectionArray[i]);
			expect(curView.constructor).toEqual(View);
		})

	});

	it("nested child views must auto-render themselves if models change, without repaiting the collection view",function(){
		collectionView.render();
		model1.set({name:"Jean-Louis"});
		// We're checking that our first inner view (corresponding to model1) has actually called its render method
		expect((collectionView._views[0]).render).toHaveBeenCalled();

		// expect to be one obv because we called it manually just 3 lines above
		expect(collectionView.render.calls.length).toEqual(1);
	});


	it("should destroy nested views when cleaning collection view & obv cleaning from DOM",function(){

		collectionView.render();
		collectionView.clean();
		// We have 3 BaseView inherited subviews (Modelviews) so it should have been called 3 times
		expect(Backbone.Baguette.BaseView.prototype.destroy.calls.length).toBe(3);
		expect(collectionView.el.parentNode).toBeNull();


	});

	it("should be able to create generic views from parameter object",function(){
		var collectionViewParameter = new CollectionView({collection:collection, modelView:{tagName:'li', tpl:"*{{name}}*"}, tagName:'ul'});
		collectionViewParameter.render();
		var expectedTemplateParameters = ["*Michel*","*Tatus*","*Jean-Marie*"];
		_.each(collectionViewParameter._views,function(curView,i){
			expect(curView.tagName).toEqual('li');
			expect(curView instanceof Backbone.Baguette.ModelView).toBeTruthy();
			expect(curView.el.innerHTML).toEqual(expectedTemplateParameters[i]);
		});
	});



});
