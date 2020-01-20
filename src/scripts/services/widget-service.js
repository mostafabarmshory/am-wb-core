/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $widget
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function(
        /* AngularJS */ $q, $injector,
        /* wb-core */ WidgetEditor) {

    var _group_repo = [];
    var contentElementAsso = [];
    var elementKey = [];
    var service = this;

    /*
     * List of all widget processor
     * 
     * A processor is a function which accepts widget and event then 
     * update widget based on the event. There are many predefined processor
     * such as style, microdata, and DND processors.
     * 
     */
    var processors = {};

    /*
     * List of converters
     */
    var converters = [];

    var notFoundWidget = {
            template : '<div ng-show="wbEditable">Unsuported widget?!</div>',
            label : 'Not found',
            description : 'Element not found'
    };
    var container = {
            type : 'Page',
            label : 'Page',
            description : 'Panel contains list of widgets.',
            image : 'images/wb/content.svg'
    };

    function _group(groupId){
        for(var i = 0; i < _group_repo.length; i++){
            if(_group_repo[i].id === groupId){
                return _group_repo[i];
            }
        }
        var group = {
                id: groupId
        };
        _group_repo.push(group);
        return group;
    }

    function _newGroup(group){
        var g = _group(group.id);
        angular.extend(g, group);
    }

    function _groups(){
        return _group_repo;
    }

    function _widget(model){
        if (model.type in contentElementAsso) {
            return contentElementAsso[model.type];
        }
        if (model.type === 'Page') {
            return container;
        }
        return notFoundWidget;
    }
    /**
     * Finds a widget related to the input model.
     * 
     * Widget type is stored in the widget data model. This function get the
     * model type from the input data type and return related widget.
     * 
     * NotFoundElement widget is returned if the widget type is not found.
     * 
     * @memberof $widget
     * @param model to find a widget
     * @returns promise to find a widget
     */
    function widget(model) {
        return $q.when(_widget(model));
    }

    /**
     * Returns list of all registerd widgets.
     * 
     * @memberof $widget
     * @returns promise to load all widgets
     */
    function widgets() {
        var list = {};
        // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
        list.items = [];
        elementKey.forEach(function(type) {
            list.items.push(contentElementAsso[type]);
        });
        return $q.when(list);
    }

    /**
     * List of all registered widgets
     * 
     * @memberof $widget
     * @returns keys {array} list of all keys
     */
    function getWidgetsKey(){
        return elementKey;
    }

    /**
     * Registers new widget
     * 
     * The old widget will be override if a new widget with the same type is registered.
     * 
     * @See the following page for more information:
     * 
     *    https://gitlab.com/weburger/angular-material-weburger/wikis/create-new-widget
     *    
     * 
     * @memberof $widget
     * @param widget to add
     * @return the service
     */
    function newWidget(widget) {
        if (hasWidget(widget.type)) {
            // TODO: maso, 2017: Add log for duplication
        }
        // fix widget data
        widget.model = widget.model || {style:{}};
        widget.model.type = widget.type;
        widget.model.name = widget.model.name || widget.title; 

        contentElementAsso[widget.type] = widget;
        elementKey.push(widget.type);
        return service;
    }


    function hasWidget(type) {
        return type in contentElementAsso;
    }
    this.hasWidget = hasWidget;

    function isWidgetLeaf(name){
        if (name in contentElementAsso) {
            return contentElementAsso[name].isLeaf;
        }
        return false;
    }
    this.isWidgetLeaf = isWidgetLeaf;

    /**
     * Compile element 
     * 
     * @name show
     * @memberof $widget
     * @param model
     *            {object}
     *            <ul>
     *            <li>templateUrl - {string=}: The URL of a template that will
     *            be used as the content of the dialog.</li>
     *            <li>template- {string=}: HTML template to show in the dialog.
     *            This must be trusted HTML with respect to Angular's $sce
     *            service. This template should never be constructed with any
     *            kind of user input or user data.</li>
     *            <li>contentElement:</li>
     *            <li>scope - {object=}: the scope to link the template
     *            controller to. If none is specified, it will create a new
     *            isolate scope. This scope will be destroyed when the dialog is
     *            removed unless preserveScope is set to true.</li>
     *            <li>controller - {function|string=}: The controller to
     *            associate with the dialog. The controller will be injected
     *            with the local $mdDialog, which passes along a scope for the
     *            dialog.</li>
     *            <li>controllerAs - {string=}: An alias to assign the
     *            controller to on the scope.</li>
     *            <li>parent - {element=}: The element to append the dialog to.
     *            Defaults to appending to the root element of the application.</li>
     *            </ul>
     * @param parentWidget
     *     {WbWidget} the parent
     * @param preElement {Element} pre build element
     * @return promise A promise that resolve created element
     */
    function compile(model, $parent, preElement){
        var widgetDescription = _widget(model);
        var $element;
        if(preElement){
            $element = preElement;
        } else {
            $element = angular.element('<'+model.type+'></'+model.type+'>');
        }
        var Widget = $injector.get(widgetDescription.controller || 'WbWidgetAbstract');
        var widget = new Widget($element, $parent);
        $element[0].$$wbController = widget;
        return $q.resolve(widget.setModel(model));
    }

    /**
     * Creates new serialized data of widget
     * 
     * @memberof $widget
     * @param widget
     * @returns
     */
    function widgetData(widget){
        return angular.copy(widget.model);
    }

    // widgets
    service.newWidget = newWidget;
    service.widget = widget;
    service.widgets = widgets;
    service.widgetData = widgetData;
    service.getWidgetsKey = getWidgetsKey;

    // new api
    service.getWidget = _widget;
    service.getWidgets =  function(){
        var widgets = {};
        // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
        widgets.items = [];
        elementKey.forEach(function(type) {
            widgets.items.push(contentElementAsso[type]);
        });
        return widgets;
    };

    // widget groups
    service.group = _group;
    service.groups = _groups;
    service.newGroup = _newGroup;

    // utils
    service.compile = compile;

    /**
     * Gets list of all children from the widget
     * 
     * The list is consist of all children and sub-children from the given 
     * widget.
     * 
     * @params widget {AbstractWidgetCtrl} the widget
     * @return List of widgets
     * @memberof $widget
     */
    this.getChildren = function(widget) {
        // Check if it is group
        var widgets = [];
        if(widget.isLeaf()){
            return widgets;
        }

        // load list of widgets
        var groups = [];
        _.forEach(widget.getChildren(), function(child){
            groups.push(child);
        });
        while(groups.length) {
            widget = groups.pop();
            widgets.push(widget);
            if(!widget.isLeaf()){
                var children = widget.getChildren();
                for(var i = 0; i < children.length; i++) {
                    var child = children[i];
                    groups.push(child);
                }
            }
        }
        //return the list
        return widgets;
    };

    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    this.debounce = function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };


    /***********************************************
     * providers
     ***********************************************/

    var providers =  {};

    /**
     * Removes a provider by its key
     * 
     * @memberof $widget
     * @param key {string} of the provider
     * @return the provider or null
     */
    this.removeProvider = function(key){
        var provider = providers[key];
        providers[key] = undefined;
        return provider;
    };

    /**
     * Gets a provider by its key
     * 
     * @memberof $widget
     * @param key {string} of the provider
     * @return the provider or null
     */
    this.getProvider = function(key){
        return providers[key];
    };

    /**
     * Sets a provider for the specified key
     * 
     * @memberof $widget
     * @para key {string} of the provider
     */
    this.setProvider = function(key, provider){
        providers[key] = provider;
        return this;
    };

    /**
     * Gets the list of providers
     * 
     * @memberof $widget
     * @return list of providers
     */
    this.getProviders = function(){
        return providers;
    };

    /**
     * Sets a provider
     * 
     * @deprecated use setprovider insted
     */
    this.addProvider = function(key, provider){
        return this.setProvider(key, provider);
    };

    /**
     * Gets list of providers keys
     * 
     * @memberof $widget
     * @return list of keys
     */
    this.getProvidersKey = function(){
        return _.keys(providers);
    };

    /***********************************************
     * Editors
     ***********************************************/
    var editors = {};
    var fakeEditor = new WidgetEditor();



    /**
     * Set editor of a widgets
     * 
     * on double click editors are used to edit the widget.
     * 
     * @params type {string} type of the widget
     * @params editor {Editor} editor
     * @memberof $widget
     */
    this.setEditor = function(type, editor){
        editors[type] = editor;
    };

    /**
     * Find editor for the given widget
     * 
     * @params widget {WbWidget} the widget
     * @return the editor or fake editor
     * @memberof $widget
     */
    this.getEditor = function(widget){
        if(widget.$$wbEditor){
            // return old editor
            return widget.$$wbEditor;
        }
        if(editors[widget.getType()] === undefined){
            return fakeEditor;
        }
        var register = editors[widget.getType()];
        // create editor
        var Editor = $injector.get(register.type);
        var editor = new Editor(widget, register.options || {});
        var ctrl = this;
        widget.$$wbEditor = editor;
        editor.on('destroy', function(){
            ctrl.removeEditorFromList(editor);
        });
        return editor;
    };

//  this.getEditors = function(){};
//  this.getActiveEditor = function(){};


    /***********************************************
     * Processors
     ***********************************************/
    /**
     * set a processor of the type
     * 
     * @memberof $widget
     */
    this.setProcessor = function(type, processor){
        processors[type] = processor;
    };

    this.removeProcessor = function(type){
        processors[type] = undefined;
    };

    /**
     * gets processor of the type
     * 
     * @memberof $widget
     */
    this.getProcessor = function(type) {
        return processors[type];
    };

    /**
     * gets list of processors
     * 
     * @memberof $widget
     */
    this.getProcessors = function(){
        return processors;
    };


    /**
     * Apply processor on the given widget
     * 
     * @memberof $widget
     */
    this.applyProcessors = function(widget, event){
        event = event || {};
        angular.forEach(processors, function(processor){
            try{
                processor.process(widget, event);
            } catch (ex){
                log.error({
                    message: 'Fail to run the processor',
                    exception: ex
                });
            }
        });
    };


    /***********************************************
     * Convertors
     ***********************************************/
    this.addConverter = function(converter){
        converters.push(converter);
    };

    this.getConverters = function(){
        return converters;
    };

    this.getConverter = function(mimetype){
        for(var i = 0; i < converters.length; i++){
            if(converters[i].getMimetype() === mimetype){
                return converters[i];
            }
        }
    };

    this.widgetFromPoint = function(x, y){
        return this.widgetFromElement(document.elementFromPoint(x, y));
    };

    this.widgetFromElement = function(element){
        if(!element){
            return;
        }
        do{
            if(element.$$wbController){
                return element.$$wbController;
            }
            element = element.parentNode;
        } while(element);
    };

});
