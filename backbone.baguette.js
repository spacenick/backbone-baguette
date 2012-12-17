// Backbone Baguette v 0.0.3
// Updated 12/14/12
// Wrote by Nicolas KERMARC
// @spacenick
// License info coming soon. Seriously do whatever you want with it
// DOCS here http://spacenick.github.com/backbone-baguette

(function(root){

    if (typeof root.Backbone == 'undefined' || typeof root._ == 'undefined') throw new Error('Backbone & underscore required!');
    var Backbone = root.Backbone;
    var _ = root._;

    // underscore compatibility (lo-dash used here). to be dropped as it may not be cross browser
    if (_.isUndefined(_.isPlainObject)) {
        var plainObjectFunction = function(obj) {
            if (!_.isObject(obj)) return false;
            else {
                return obj.constructor == Object;
            }
        };
        _.isPlainObject = plainObjectFunction;
    }

    // backbone namespace
    Backbone.Baguette = {};

    // Default templating function, based on Handlebars
    var TemplatingFunction = function(tpl,data) {

        return Handlebars.compile(tpl)(data);

    };


    // Keep it in our baguette namespace.
    Backbone.Baguette.Templating = TemplatingFunction;

    // List of our attributes
    var BaguetteCustomAttributes = ["noBind","tpl","modelView","templating","nestedViews","loaderView","loader"];

    // Simple helper functions that will override the default prototype attribute of CompositeView if they are passed as options
    var optionsToObject = function(object) {
        _.each(BaguetteCustomAttributes,function(attr){
            if (!_.isUndefined(object.options[attr])) {
                object[attr] = object.options[attr];
            }
        });
    };

    // Simple helper to remove DOM related options
    var removeDomOptions = function(options) {
        delete options.el;
        delete options.tagName;
        delete options.tagName;
        delete options.id;
        delete options.className;
        delete options.attributes;
    };

    // TO be Removed
    Backbone.Baguette.BaseView = Backbone.View;

    // ----------------------------------------------------------------//
    // --- -----------GENERIC LOADER VIEW---------------------------- //
    //  Binded by default on a model or collection (model is prioritary)//
    // -------------------------------------------------------------- //
    var LoaderView = Backbone.View.extend({
        className:'loader'
    });

    // export
    Backbone.Baguette.LoaderView = LoaderView;

    // ----------------------------------------------------------------//
    // --- -----------LOADABLE VIEW----------------------------------- //
    //  Inherited view to handle loader Views !                       //
    // -------------------------------------------------------------- //   

    var LoadableView = Backbone.View.extend({
        loader:false,
        initialize:function(options) {
            // Loader! b00m magic
            if (this.loader) {
                var loaderView;
                // We can also override only on a view the loaderView for custom purposes
                if (!_.isUndefined(this.loaderView)) loaderView = this.loaderView;
                else loaderView = Backbone.Baguette.LoaderView;
                // Cehck what kind of son is extending us : CollectionView ModelView or what?
                if (!_.isUndefined(this.model)) instOpts = {model:this.model,ref:this.model};
                else if (!_.isUndefined(this.collection)) instOpts = {collection:this.collection,ref:this.collection};
                // Instantiate the loader, keep a reference to loaderView and append to our $el
                this.loaderViewInstance = new loaderView(instOpts);
                // If we have a loader, when we do request we need to clean the $el in order for him to properly show up
                // The loader is not cleaned when calling clean
                this.listenTo(instOpts.ref,'request',this.renderLoader);
            }
            _.bindAll(this);
        },
        renderLoader:function() {
            // Let implementation of clean to inherited classes : for instance
            // CollectionView will destroy any child ModelView when cleaning!
            this.clean();
            this.$el.html(this.loaderViewInstance.render().$el);
        }
    });

    // export
    Backbone.Baguette.LoadableView = LoadableView;


    // ----------------------------------------------------------------//
    // --- -----------MODEL VIEW ------------------------------------ //
    // Render a model with a simple tpl using the templating function //
    // -------------------------------------------------------------- //

    var ModelView = LoadableView.extend({
        tpl:"",
        noBind:false,
        templating:Backbone.Baguette.Templating,
        loader:false,
        initialize:function(options) {

            // Options to class attributes overriding
            optionsToObject(this);
            ModelView.__super__.initialize.call(this,options);
            // We assume that most of the time a model will be given
            this.noModel=false;
            // No? Let's act as a raw static view then.
            if (_.isUndefined(this.model)) this.noModel=true;
            // Bind it except if we specifically said NO or if we use a generic empty model
            if (!this.noBind && !this.noModel) this.listenTo(this.model,'change',this.render);
            _.bindAll(this);
        },
        render:function() {

            if (!this.noModel) {

                // Check if we passed a compiledTemplate function (to use for instance Handlebars precompiled template directly)
                if (!_.isUndefined(this.compiledTemplate)) this.$el.html(this.compiledTemplate(this.model.toJSON()));
                // Otherwise compile template on the fly!
                else this.$el.html(this.templating(this.tpl,this.model.toJSON()));
            }
            // No templating needed, just set raw template to $el....
            else this.$el.html(this.tpl);
            // Let's get chained! Oh yeah.
            return this;
        },
        clean:function() {
            this.$el.empty();
            return this;
        }

    });

    Backbone.Baguette.ModelView = ModelView;

    // ----------------------------------------------------------------//
    // --- -----------COMPOSITE MODEL VIEW --------------------------- //
    // Render a model + nested views and inner collections/models of the model //
    // -------------------------------------------------------------- //

    var CompositeView = ModelView.extend({

        _views:[],
        // Nested Views object : "string_selector":BackboneViewName
        nestedViews:{
            // "#elem":ViewName
            // additional syntax
            // "#elem" : { view : ViewName, setElement : true/false, render:true/false, collectionAttribute : 'model_collection_field', modelAttribute : 'model_field' }
            // setElement to true will use the selector as $el for the view. Otherwise view will be rendered INSIDE selector
            //
        },
        initialize:function(options) {

            CompositeView.__super__.initialize.call(this,options);
            this._views = [];
            _.bindAll(this);
        },
        // Method to render all the nested views
        renderNestedViews:function() {
            // Reference for callbacks
            var that = this;

            // We're basically giving our nested views the same options, in order to share model/collection references.
            // obviously we don't want to give the "el" option as it would basically break everything :')
            var thisOptions = _.clone(this.options);
            removeDomOptions(thisOptions);

            
            // Loop on our views array, getting back key/value
            _.each(this.nestedViews,function(currentView,selector){


                // For each nested view reset model & collection attribute as they may have been affected in the loop
                thisOptions.collection = that.options.collection;
                thisOptions.model = that.options.model;

                // Default behavior : do setElement on nested view and auto render it.
                var setElement = true;
                var render = true;

                // selector references, don't parse the DOM each time.
                var sel = that.$el.find(selector);

                if (sel.length === 0) throw new Error("Your selector "+selector+" didn't match anything!");

                // If we are giving options, override default "view" and "setElement" variables. Also try to see if render is cancelled.
                if (_.isPlainObject(currentView)) {

                    if (_.isUndefined(currentView.view)) throw new Error('Object for selector must contains a "view" attribute boy!');
                    if (!_.isUndefined(currentView.render)) render=currentView.render;
                    var objReference = currentView;

                    // get back good view
                    currentView = currentView.view;
                    if (!_.isUndefined(objReference.setElement)) setElement = objReference.setElement;

                    // Check if we are given a model or collection attribute
                    if (!_.isUndefined(objReference.modelAttribute)) {
                        // Delete collection attribute as it may have been affected in the loop
                        delete thisOptions.collection;
                        _.extend(thisOptions,{model:that.model.get(objReference.modelAttribute)});
                    }
                    else if (!_.isUndefined(objReference.collectionAttribute)) {
                        // Delete model attribute as it may have been affected in the loop
                        delete thisOptions.model;
                        _.extend(thisOptions,{collection:that.model.get(objReference.collectionAttribute)});
                    }


                }
                // Check if our nested view is an instance of a CollectionView, if it is, we don't want to pass a model.
                if (!_.isUndefined(currentView.prototype.modelView)) {
                    delete thisOptions.model;
                }

                // Instantiate the current child view
                var curView = new currentView(thisOptions);
                // Either we're defining our selector as our $el for our new view
                if (setElement) curView.setElement(sel);
                // or we're defining it as its container, but curView $el is self-created
                else curView.$el.appendTo(sel);

                // Now that we attached DOM, let's render
                if (render) curView.render();

                // Push it to our views array
                that._views.push(curView);

            });

            return this;
        },
        // Render implementation: templating & nesting views
        render:function() {
            // Cleanup
            this.clean();
            // Call father render to render our model if we have one.
            CompositeView.__super__.render.call(this);
            // Render Nested Views
            this.renderNestedViews();

            return this;

        },
        // Override BaseView "default" clean function
        // as we have nested views here!
        clean:function() {
            CompositeView.__super__.clean.call(this);
            _.each(this._views,function(curView){
                curView.remove();
            });
            this._views = [];
            return this;
        }

    });

    // export => Keep this in our namespace
    Backbone.Baguette.CompositeView = CompositeView;


    // ----------------------------------------------------------------//
    // --- -----------COLLECTION VIEW ------------------------------- //
    // Render a collection by using modelView class or parameters     //
    // -------------------------------------------------------------- //

    var CollectionView = LoadableView.extend({

        noBind:false,
        modelView:Backbone.Baguette.ModelView,
        _views:[],

        initialize:function(options) {
            // Convert options & assign
            optionsToObject(this);
            // Call father initialize
            CollectionView.__super__.initialize.call(this,options);
            // Reset views array to assign it on our instance and take it out of shared prototype
            this._views = [];
            // Checking & binding
            if (_.isUndefined(this.collection)) throw new Error('CollectionView needs a collection!');
            if (!this.noBind) this.listenTo(this.collection,'add reset remove',this.render);

        },
        render:function() {
            var that = this;
            // Properly clean sub model views before re-rendering
            this.clean();
            // We want to give our Model subview our current options
            // But we don't want to pass "el" and "collection"
            // Additionally we are giving it our current model as parameters
            var thisOptions = _.clone(this.options);
            removeDomOptions(thisOptions);
            delete thisOptions.collection;

            var defaultView = this.modelView;

            // pass it also the eventual options given if its a pure object
            if (_.isPlainObject(this.modelView)) {
                defaultView = Backbone.Baguette.ModelView;
                _.extend(thisOptions,this.modelView);
            }
            // if its a function, we've been given a View class!
            else defaultView = this.modelView;

            // Loop on collection
            this.collection.each(function(model){

                // Give the correct model to our options - _.extend is overriding!
                _.extend(thisOptions,{model:model});
                // Instantiate, render, & append
                var tempCompositeView = new defaultView(thisOptions);
                that.$el.append(tempCompositeView.render().$el);

                // Append this views to our cached views array
                that._views.push(tempCompositeView);

            });


            return this;
        },

        clean:function() {

            _.each(this._views,function(curView){
                curView.remove();
            });

            this.$el.empty();

            this._views = [];
            return this;
        }

    });
    // export
    Backbone.Baguette.CollectionView = CollectionView;


    return Backbone.Baguette;


})(this);