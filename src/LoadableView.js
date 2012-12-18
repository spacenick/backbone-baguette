(function(root,factory){

    // https://github.com/umdjs/umd/blob/master/returnExports.js
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./Utils','./Loader'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(root.Backbone.Baguette) || _.isUndefined(root.Backbone.Baguette.Utils)) throw new Error('Backbone & Baguette.Utils required!');
        root.Backbone.Baguette.LoadableView = factory(root.Backbone.Baguette.Utils,root.Backbone.Baguette.Loader);
    }


})(this,function(Utils,Loader){

    var LoadableView = Backbone.View.extend({
        loader:false,
        initialize:function(options) {
            // Options to class attributes overriding
            Utils.optionsToObject(this);
            // Loader! b00m magic
            if (this.loader) {
                var loaderView;
                // We can also override only on a view the loaderView for custom purposes
                if (!_.isUndefined(this.loaderView)) loaderView = this.loaderView;
                else loaderView = Loader;
                // Cehck what kind of son is extending us : CollectionView ModelView or what?
                if (!_.isUndefined(this.model)) instOpts = {model:this.model,ref:this.model};
                else if (!_.isUndefined(this.collection)) instOpts = {collection:this.collection,ref:this.collection};
                // Instantiate the loader, keep a reference to loaderView and append to our $el
                this.loaderViewInstance = new loaderView(instOpts);
                // If we have a loader, when we do request we need to clean the $el in order for him to properly show up
                // The loader is not cleaned when calling clean
                this.listenTo(instOpts.ref,'request',this.renderLoader);
            }

        },
        renderLoader:function() {
            // Let implementation of clean to inherited classes : for instance
            // CollectionView will destroy any child ModelView when cleaning!
            this.clean();
            this.$el.html(this.loaderViewInstance.render().$el);
        }
    });
    return LoadableView;
});