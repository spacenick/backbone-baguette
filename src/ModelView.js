(function(root,factory){

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['./Templating','./LoadableView'],factory);
    } else {
        // Browser globals (root is window)
        if (_.isUndefined(Backbone.Baguette) || _.isUndefined(Backbone.Baguette.LoadableView)) throw new Error("Backbone & Backbone.Baguette.LoadableView needed");
        root.Backbone.Baguette.ModelView = factory(root.Backbone.Baguette.LoadableView);
    }


})(this,function(LoadableView){

    var ModelView = LoadableView.extend({
        tpl:"",
        noBind:false,
        templating:Backbone.Baguette.Templating,
        initialize:function(options) {
            ModelView.__super__.initialize.call(this,options);
            // We assume that most of the time a model will be given
            this.noModel=false;
            // No? Let's act as a raw static view then.
            if (_.isUndefined(this.model)) this.noModel=true;
            // Bind it except if we specifically said NO or if we use a generic empty model
            if (!this.noBind && !this.noModel) this.listenTo(this.model,'change',this.render);

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

    return ModelView;

});