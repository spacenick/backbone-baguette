

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
	it("should be able to be a generic model-less view if needed",function(){

		var staticView = new View({tpl:"This is SO static but can BE needed sometimes"});
		staticView.render();
		expect(staticView.el.innerHTML).toEqual("This is SO static but can BE needed sometimes");
	});


	it("should bind to model automatically & set $el to templated content",function(){

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




});


describe("Baguette CollectionView",function(){

	var View, Model, view, model, Collection, CollectionView, collection, collectionView, collectionArray, model1, model2, model3;

	beforeEach(function(){
		
		Model = Backbone.Model;

		View = Backbone.Baguette.ModelView.extend({tpl:"{{name}}",tagName:'li'});


		Collection = Backbone.Collection;
		CollectionView = Backbone.Baguette.CollectionView;
		// Spy before instantiating obv
		spyOn(CollectionView.prototype,'render').andCallThrough();
		spyOn(View.prototype,'render').andCallThrough();
		spyOn(Backbone.View.prototype,'remove').andCallThrough();

		model1 = new Model({name:"Michel"});
		model2 = new Model({name:"Tatus"});
		model3 = new Model({name:"Jean-Marie"});
		collectionArray = [model1,model2,model3];

		collection = new Collection(collectionArray);

		collectionView = new CollectionView({collection:collection, modelView:View, tagName:'ul'});
	});

	it("should bind automatically to collection on any events & refresh view accordingly",function(){



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
		expect(Backbone.View.prototype.remove.calls.length).toBe(3);
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

describe("Baguette CompositeView",function(){

	var Model, model, ModelView, CompositeView, modelView, compositeView;

	beforeEach(function(){
		Model = Backbone.Model;

		ModelView = Backbone.Baguette.ModelView.extend({
			tpl:"Buy {{name}}",
			tagName:'a'
		});
		CompositeView = Backbone.Baguette.CompositeView.extend({
			tpl:'<p>{{name}}</p><p class="checkout"></p>',
			nestedViews:{
				".checkout":ModelView
			}
		});
		spyOn(ModelView.prototype,'render').andCallThrough();
		model = new Model({name:"Toyota Baby"});

		

	});

	it("should be able to render trivial nested views (be used as a layout manager)",function(){
		var InnerOne = Backbone.View.extend({
			render:function() {
				this.$el.html('Inner1');
				return this;
			}
		});
		var InnerTwo = Backbone.View.extend({
			render:function() {
				this.$el.html('Inner2');
				return this;
			}
		});
		var SimpleCompositeView = Backbone.Baguette.CompositeView.extend({
			tpl:'<p class="inner1"></p><p class="inner2"></p>',
			nestedViews:{
				'.inner1':InnerOne,
				'.inner2':InnerTwo
			}
		});


		var simpleCompositeView = new SimpleCompositeView();
		simpleCompositeView.render();
		expect(simpleCompositeView.el.innerHTML).toEqual('<p class="inner1">Inner1</p><p class="inner2">Inner2</p>');

	});

	it("should render nested views with just a view passed as argument",function(){
		var compositeView = new CompositeView({model:model});
		compositeView.render();

		expect(compositeView.el.innerHTML).toEqual('<p>Toyota Baby</p><p class="checkout">Buy Toyota Baby</p>');
		expect(compositeView._views.length).toEqual(1);
		expect(compositeView._views[0].el).toEqual(compositeView.$el.find('.checkout')[0])

	});

	it("should render nestedViews INSIDE parent container with setElement false",function(){
		var CompositeViewOptions = Backbone.Baguette.CompositeView.extend({
			tpl:'<p>{{name}}</p><p class="checkout"></p>',
			nestedViews:{
				".checkout":{
					view:ModelView,
					setElement:false
				}
			}
		});

		var compositeView = new CompositeViewOptions({model:model});
		compositeView.render();

		expect(compositeView.el.innerHTML).toEqual('<p>Toyota Baby</p><p class="checkout"><a>Buy Toyota Baby</a></p>');
		expect(compositeView._views.length).toEqual(1);
		expect(compositeView._views[0].render).toHaveBeenCalled();
		expect(compositeView._views[0].el.parentNode).toEqual(compositeView.$el.find('.checkout')[0])

	});

	it("should NOT render nested views if render==false",function(){
		var CompositeViewOptions = Backbone.Baguette.CompositeView.extend({
			tpl:'<p>{{name}}</p><p class="checkout"></p>',
			nestedViews:{
				".checkout":{
					view:ModelView,
					render:false
				}
			}
		});

		var compositeView = new CompositeViewOptions({model:model});
		compositeView.render();

		expect(compositeView.el.innerHTML).toEqual('<p>Toyota Baby</p><p class="checkout"></p>');
		expect(compositeView._views.length).toEqual(1);
		expect(compositeView._views[0].render).not.toHaveBeenCalled();

	});

	it("should give correct inner-model if modelAttribute is specified",function(){
		var complexModel = new Backbone.Model({car:model,owner:"name"});
		var CompositeViewComplex = Backbone.Baguette.CompositeView.extend({
			tpl:'<p>{{owner}}</p><p class="car"></p>',
			nestedViews:{
				".car":{
					view:ModelView,
					modelAttribute:'car'
				}
			}
		});

		var compositeView = new CompositeViewComplex({model:complexModel});
		compositeView.render();
		expect(compositeView.el.innerHTML).toEqual('<p>name</p><p class="car">Buy Toyota Baby</p>');

	});

	it("should pass correct 'model' attribute depending if modelAttribute is defined or not",function(){
		var CheckoutView = Backbone.Baguette.ModelView.extend({
			tpl:"{{price}}"
		});
		var complexModel = new Backbone.Model({car:model,owner:"name",price:'99'});
		var CompositeViewComplex = Backbone.Baguette.CompositeView.extend({
			tpl:'<p>{{owner}}</p><p class="car"></p><p class="checkout"></p>',
			nestedViews:{
				".car":{
					view:ModelView,
					modelAttribute:'car'
				},
				'.checkout':CheckoutView
			}
		});

		var compositeView = new CompositeViewComplex({model:complexModel});
		compositeView.render();
		expect(compositeView.el.innerHTML).toEqual('<p>name</p><p class="car">Buy Toyota Baby</p><p class="checkout">99</p>');

	});

	it('should been able to render sub collection view if collectionAttribute is passed',function(){


	});


});
