(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['Backbone'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(root.Backbone.Baguette)) root.Backbone.Baguette = {};
        root.Backbone.Baguette.Loader = factory(root.Backbone);
    }


})(this,function(Backbone){

	var LoaderView = Backbone.View.extend({
        className:'loader'
    });

    return LoaderView;
});