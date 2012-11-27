// Backbone Baguette v 0.0.1
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


    // CompositeView : auto-render nested views

    var CompositeView = Backbone.View.extend({
        // Keep a reference of nested views instances to clean them properly later
        _views:[],
        // Nested Views object : "string_selector":BackboneViewName
        nestedViews:{
            // "#elem":ViewName
            // additional syntax
            // "#elem" : { class : ViewName, setElement : true/false, render:true/false, collectionAttribute : 'model_collection_field', modelAttribute : 'model_field' }
            // setElement to true will use the selector as $el for the view. Otherwise view will be rendered INSIDE selector
            //
        },
        tpl:"",
        noBind:false,
        templating:Backbone.Baguette.templating,
        modelView:Backbone.Baguette.CompositeView,

        // Keep a reference to all models/collections bindings to clean them properly on destroy and avoid memory leak
        bindings:[],

        // Custom constructor. Don't forget to call it first if you're using your own! this.constructor.__super__.initialize.call(this);
        initialize:function(options) {

            // Let's check if some options are passed and should then override our attributes defined in our Class definition
            optionsToObject(this);

            // Assign bindings and _views to this instance, otherwise it would be shared in the CompositeView prototype
            this.bindings = [];
            this._views = [];

            // Scope binding
            _.bindAll(this,'renderModel','renderCollection','render','initializeTemplateOptions','destroy','bindTo','clean','unbindFromAll');

            // Check if we're good to use a CompositeView, and if we want to listen on changes or not.
            if (_.isUndefined(this.model) && _.isUndefined(this.collection)) throw new Error('Baguette CompositeView needs a model or a collection!');
            if (!this.noBind) {

               if (!_.isUndefined(this.model)) this.bindTo(this.model,'change',this.render);
               else if (!_.isUndefined(this.collection)) {
                   this.bindTo(this.collection,'reset add remove',this.render);
               }
            }



        },
        addElement:function(model,thisOptions) {

            var defaultView = this.modelView;
            // override "model" attribute
            _.extend(thisOptions,{model:model});
            // pass it also the eventual options given if its a pure object
            if (_.isPlainObject(this.modelView)) _.extend(thisOptions,this.modelView);
            // if its a function, we've been given a View class!
            else defaultView = this.modelView;


            // Instantiate, render, & append
            var tempCompositeView = new defaultView(thisOptions);
            tempCompositeView.render();
            this.$el.append(tempCompositeView.$el);

        },

        //-- Render functions : factorised in order to call them independently if needed.

        // Render a simple Model using our "tpl"
        renderModel:function() {

            // Empty our $el and render the view.
            this.$el.empty().html(this.templating(this.tpl,this.model.toJSON()));

            // Let's get chained! Oh yeah.
            return this;
        },

        // Rendering a collection is basically looping on each model, creating a subview, and appending to our DOM.
        // And this is exactly what we're doing
        renderCollection:function() {
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
                defaultView = Backbone.Baguette.CompositeView;
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

                    if (_.isUndefined(currentView.class)) throw new Error('Object for selector must contains class');
                    if (!_.isUndefined(currentView.render) && currentView.render == false) render=false;
                    var objReference = currentView;

                    // get back good view
                    currentView = currentView.class;
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

            // render our model with our template & attach to $el
            if (!_.isUndefined(this.collection)) this.renderCollection();
            else if (!_.isUndefined(this.model)) {
                this.renderModel();
                // render sub views
                this.renderNestedViews();
            }



            return this;

        },
        bindTo: function (model, ev, callback) {
            model.bind(ev, callback, this);
            this.bindings.push({ model: model, ev: ev, callback: callback });
        },

        unbindFromAll: function () {
            console.log(this.bindings);
            _.each(this.bindings, function (binding) {
                binding.model.unbind(binding.ev, binding.callback);
            });

            this.bindings = [];
        },
        // Empty the $el (not removing it!) and properly clean subviews (ModelViews or NestedViews) if they exists
        clean:function() {
            _.each(this._views,function(curView){
               if (!_.isUndefined(curView.destroy)) curView.destroy();
            });
            this._views = [];
            this.$el.empty();

        },
        // Clean removing of the view to avoid memory leaks. Based on http://addyosmani.github.com/backbone-fundamentals/#whats-the-best-way-to-combine-or-append-views-to-each-other by Addy Osmani
        destroy:function() {
            this.clean();
            this.unbindFromAll();
            this.remove();
        }
    });

    // export => Keep this in our namespace
    Backbone.Baguette.CompositeView = CompositeView;


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