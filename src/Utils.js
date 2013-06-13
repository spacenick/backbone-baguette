/*!
 * Baguette v0.2.0
 * baguette.io
 *
 * Heavy use of Backbone (MIT)
 * backbonejs.org
 *
 * Copyright 2012, 2013 - Nicolas Kermarc (@spacenick)
 * Released under the MIT license
 * http://jquery.org/license
 *
 * 
 */

(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(root.Backbone.Baguette)) root.Backbone.Baguette = {};
        root.Backbone.Baguette.Utils = factory();
    }


})(this,function(){
    // List of our attributes
    var BaguetteCustomAttributes = ["noBind","tpl","modelView","templating","nestedViews","loaderView","loader", "add"];

    return {

        optionsToObject:function(object) {
            _.each(BaguetteCustomAttributes,function(attr){
                if (!_.isUndefined(object.options[attr])) {
                    object[attr] = object.options[attr];
                }
            });
        },
        removeDomOptions:function(options) {
            delete options.el;
            delete options.tagName;
            delete options.tagName;
            delete options.id;
            delete options.className;
            delete options.attributes;
        }

    };
	
});