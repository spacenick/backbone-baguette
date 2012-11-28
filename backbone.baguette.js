// Backbone Baguette v 0.0.2
// Updated 28/11/12
// Wrote by Nicolas KERMARC
// @spacenick
// License info coming soon
// DOCS here http://spacenick.github.com/backbone-baguette

(function(){

    if (typeof Backbone == 'undefined' || typeof _ == 'undefined') throw new Error('Backbone & underscore required!');

    // underscore compatibility (lo-dash used here). to be dropped as it may not be cross browser
    if (_.isUndefined(_.isPlainObject)) {
        var plainObjectFunction = function(obj) {
            if (!_.isObject(obj)) return false;
            else {
                return obj.constructor == Object;
            }
        }
        _.isPlainObject = plainObjectFunction;
    }

    // backbone namespace
    Backbone.Baguette = {};

    // Default templating function, based on Handlebars
    var TemplatingFunction = function(tpl,data) {

        return Handlebars.compile(tpl)(data);

    };


    // Keep it in our baguette namespace.
    Backbone.Baguette.templating = TemplatingFunction;

    // List of our attributes
    var BaguetteCompositeViewAttributes = ["noBind","tpl","modelView","templating","nestedViews"];

    // Simple helper functions that will override the default prototype attribute of CompositeView if they are passed as options
    var optionsToObject = function(object) {
        _.each(BaguetteCompositeViewAttributes,function(attr){
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
    }

    // ----- BASE BAGUETTE VIEW ------
    // Contains common parameters + clean binding & destroy method
    // All our Views are inheriting from this
    // -------------------------------

    var BaseView = Backbone.View.extend({

        templating:Backbone.Baguette.templating,
        bindings:[],

        initialize:function(options) {
            this.bindings = [];
            _.bindAll(this,'bindTo','unbindFromAll','clean','destroy');
        },
        // 100% inspired from Addy Osmani ghost view solution. I just added a context variable, in order to
        // give sometimes a context like this.$el (to directly call this.$el.hide for instance)
        bindTo: function (model, ev, callback, context) {
            model.bind(ev, callback, context);
            this.bindings.push({ model: model, ev: ev, callback: callback, context:context });
        },
        // unbind all our views events in order to be collected by GC
        unbindFromAll: function () {

            _.each(this.bindings, function (binding) {
                binding.model.unbind(binding.ev, binding.callback,binding.context);
            });

            this.bindings = [];
        },
        // Empty the $el (not removing it!)
        clean:function() {
            this.$el.empty();
        },
        // Clean removing of the view to avoid memory leaks. Based on http://addyosmani.github.com/backbone-fundamentals/#whats-the-best-way-to-combine-or-append-views-to-each-other by Addy Osmani
        destroy:function() {
            this.clean();
            this.unbindFromAll();
            this.remove();

        }


    });

    Backbone.Baguette.BaseView = BaseView;

    // ----------------------------------------------------------------//
    // --- -----------MODEL VIEW ------------------------------------ //
    // Render a model with a simple tpl using the templating function //
    // -------------------------------------------------------------- //

    var ModelView = BaseView.extend({
        tpl:"",
        noBind:false,
        initialize:function(options) {

            ModelView.__super__.initialize.call(this,options);
            // Options to class attributes overriding
            optionsToObject(this);
            // We obv. need a model.
            if (_.isUndefined(this.model)) throw new Error('ModelView needs a model!');
            // Bind it except if we specifically said NO
            if (!this.noBind) this.bindTo(this.model,'change',this.render,this);
        },
        render:function() {
            // Empty our $el and render the view.
            this.$el.empty().html(this.templating(this.tpl,this.model.toJSON()));
            // Let's get chained! Oh yeah.
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
            // Call ModelView initializer
            CompositeView.__super__.initialize.call(this,options);
            this._views = [];
            _.bindAll(this,'renderNestedViews');
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

                // Default behavior : do setElement on nested view and auto render it.
                var setElement = true;
                var render = true;

                // selector references, don't parse the DOM each time.
                var sel = that.$el.find(selector);

                if (sel.length == 0) throw new Error("Your selector "+selector+" didn't match anything!");

                // If we are giving options, override default "view" and "setElement" variables. Also try to see if render is cancelled.
                if (_.isPlainObject(currentView)) {

                    if (_.isUndefined(currentView.view)) throw new Error('Object for selector must contains view');
                    if (!_.isUndefined(currentView.render) && currentView.render == false) render=false;
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

            // Call father render to render our model
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
                // Check these views are implemeting destroy
                if (!_.isUndefined(curView.destroy)) curView.destroy();
            });
            this._views = [];
        }

    });

    // export => Keep this in our namespace
    Backbone.Baguette.CompositeModelView = CompositeView;


    // ----------------------------------------------------------------//
    // --- -----------COLLECTION VIEW ------------------------------- //
    // Render a collection by using modelView class or parameters     //
    // -------------------------------------------------------------- //

    var CollectionView = BaseView.extend({

        noBind:false,
        modelView:Backbone.Baguette.ModelView,
        _views:[],

        initialize:function(options) {
            // Call father initialize
            CollectionView.__super__.initialize.call(this,options);
            // Convert options & assign
            optionsToObject(this);
            // Reset views array to assign it on our instance and take it out of shared prototype
            this._views = [];
            // Checking & binding
            if (_.isUndefined(this.collection)) throw new Error('CollectionView needs a collection!');
            if (!this.noBind) this.bindTo(this.collection,'add reset remove',this.render,this);
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
        // Override BaseView "default" clean function
        // as we have nested views here!
        clean:function() {
            CollectionView.__super__.clean.call(this);
            _.each(this._views,function(curView){

                // Check these views are implemeting destroy
                if (!_.isUndefined(curView.destroy)) curView.destroy();
            });
            this._views = [];
        }

    });
    // export
    Backbone.Baguette.CollectionView = CollectionView;

    // --- BACKBONE SYNC PATCH ---- //


    // Override backbone sync  to emit fetch events
    // keep a reference to original backbone sync
    var syncReference = Backbone.sync;

    var BaguetteSync = function(method,model,options) {
        model.trigger('syncing',method,model,options);
        // Call original backbone sync
        syncReference(method,model,options);

    };

    // Keep a reference of our sync function in our namespace
    // in order to use it if you are already overrding Backbone sync
    Backbone.Baguette.sync = BaguetteSync;

    Backbone.sync = BaguetteSync;


})();