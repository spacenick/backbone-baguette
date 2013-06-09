(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./Utils','./ModelView'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(Backbone.Baguette) || _.isUndefined(Backbone.Baguette.ModelView) || _.isUndefined(Backbone.Baguette.Utils)) throw new Error("Backbone & Backbone.Baguette.ModelView && Backbone.Baguette.Utils needed");
        root.Backbone.Baguette.CompositeView = factory(root.Backbone.Baguette.Utils,root.Backbone.Baguette.ModelView);
    }


})(this,function(Utils,ModelView){

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
        },
        // Method to render all the nested views
        renderNestedViews:function() {
            // Reference for callbacks
            var that = this;

            // We're basically giving our nested views the same options, in order to share model/collection references.
            // obviously we don't want to give the "el" option as it would basically break everything :')
            var thisOptions = _.clone(this.options);
            Utils.removeDomOptions(thisOptions);

            
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

    return CompositeView;
    
});