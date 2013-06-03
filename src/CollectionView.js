(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./Utils','./LoadableView','./ModelView', 'Backbone'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(Backbone.Baguette) || _.isUndefined(Backbone.Baguette.LoadableView) || _.isUndefined(Backbone.Baguette.Utils)) throw new Error("Backbone & Backbone.Baguette.LoadableView && Backbone.Baguette.Utils needed");
        root.Backbone.Baguette.CollectionView = factory(root.Backbone.Baguette.Utils,root.Backbone.Baguette.LoadableView, root.Backbone.Baguette.ModelView, Backbone);
    }


})(this,function(Utils,LoadableView,ModelView){

    var eventListNoAdd = 'reset remove';


    var CollectionView = LoadableView.extend({

        noBind:false,
        modelView:ModelView,
        _views:[],

        initialize:function(options) {
            // Call father initialize
            CollectionView.__super__.initialize.call(this,options);
            // Reset views array to assign it on our instance and take it out of shared prototype
            this._views = [];
            // Checking & binding
            if (_.isUndefined(this.collection)) throw new Error('CollectionView needs a collection!');
            if (!this.noBind) {
                var toListenTo = eventListNoAdd;
                // If we're in {add:true} mode we don't want to re-render everytime
                if (!this.options.add) toListenTo += ' add';
                else {
                    this.listenTo(this.collection, "add", this.addElement);
                }
                this.listenTo(this.collection,toListenTo,this.render);
            }
            // We want to give our Model subview our current options
            // But we don't want to pass "el" and "collection"
            // Additionally we are giving it our current model as parameters
            var thisOptions = _.clone(this.options);
            Utils.removeDomOptions(thisOptions);
            delete thisOptions.collection;

            // Store that on our instance
            this._baseChildOptions = thisOptions;

        },
        addElement:function(model) {

            var thisOptions = _.clone(this._baseChildOptions);
            var defaultView = this.modelView;

            // pass it also the eventual options given if its a pure object
            if (_.isPlainObject(this.modelView)) {
                defaultView = ModelView;
                _.extend(thisOptions,this.modelView);
            }

            // Give the correct model to our options - _.extend is overriding!
            _.extend(thisOptions,{model:model});
            // We'll check if our defaultView is a function
            // that should return a Backbone-type view
            if (_.isFunction(this.modelView) && _.isEmpty(this.modelView.prototype)) {
                defaultView = this.modelView.call(this,model);
            }

            // Instantiate, render, & append
            var tempCompositeView = new defaultView(thisOptions);
            this.$el.append(tempCompositeView.render().$el);
            // Append this views to our cached views array
            this._views.push(tempCompositeView);

            return this;

        },
        render:function() {

            var that = this;

            // Properly clean sub model views before re-rendering
            this.clean();

            // Loop on collection
            this.collection.each(function(model){
                that.addElement.call(that,model);
            });
            // Allow some chaining
            return this;

        },

        clean:function() {
            // Remove every of our sub-views (no ghosts plz)
            _.each(this._views,function(curView){
                curView.remove();
            });

            // Empty our container
            this.$el.empty();

            // Reset our _views array
            this._views = [];

            return this;
        }

    });

    return CollectionView;

});