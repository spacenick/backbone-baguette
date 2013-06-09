(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(root.Backbone.Baguette)) root.Backbone.Baguette = {};
        root.Backbone.Baguette.Templating = factory();
    }


})(this,function(){

	var TemplatingFunction = function(tpl,data) {
        return Handlebars.compile(tpl)(data);
    };
    
    return TemplatingFunction;
});