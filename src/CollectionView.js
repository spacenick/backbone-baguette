(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./Utils','./LoadableView'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(Backbone.Baguette) || _.isUndefined(Backbone.Baguette.LoadableView) || _.isUndefined(Backbone.Baguette.Utils)) throw new Error("Backbone & Backbone.Baguette.LoadableView && Backbone.Baguette.Utils needed");
        root.Backbone.Baguette.CollectionView = factory(root.Backbone.Baguette.Utils,root.Backbone.Baguette.LoadableView);
    }


})(this,function(Utils,LoadableView){

    var CollectionView = LoadableView.extend({

        noBind:false,
        modelView:Backbone.Baguette.ModelView,
        _views:[],

        initialize:function(options) {
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
            Utils.removeDomOptions(thisOptions);
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

    return CollectionView;

});