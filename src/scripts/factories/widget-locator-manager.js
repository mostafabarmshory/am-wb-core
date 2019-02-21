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
'use strict';

angular
.module('am-wb-core')


/**
 * @ngdoc Factories
 * @name CursorWidgetLocator
 * @description Manages list of locators
 * 
 * 
 * There are two type of widgets locator: selection and bound.
 * 
 * For each widget a bound locator will be created.
 * 
 * For each item in selection a selection locator will be created.
 */
.factory('WidgetLocatorManager',function ($widget, BoundWidgetLocator, SelectionWidgetLocator) {

    /**
     * Creates new instance of the manager
     * 
     * @memberof CursorWidgetLocator
     */
    function WidgetLocatorManager(options) {
        var ctrl = this;

        this.intersectingWidget = [];
        this.selectedWidgets = [];

        this.boundLocatorMap = new Map();
        this.boundLocatorTrash = [];

        this.selectionLocatorMap = new Map();
        this.selectionLocatorTrash = [];


        // selection options
        this.selectionLocatorOption = options.selectionLocatorOption || {};
        this.selectionEnable = true;
        if (angular.isDefined(options.selectionEnable)) {
            this.selectionEnable = options.selectionEnable;
        }

        // bound options
        this.boundLocatorOption = options.boundLocatorOption || {};
        this.boundEnable = true;
        if (angular.isDefined(options.boundEnable)) {
            this.boundEnable = options.boundEnable;
        }

        this.widgetListeners = {
                'intersection' : function ($event) {
                    var widget = $event.source;
                    ctrl.widgetIntersectingChange(widget);
                },
                'resize': function($event){
                    var widget = $event.source;
                    ctrl.updateLocators();
                },
        };
    }

    /**
     * Sets visibility of locators
     * 
     * @param visible
     *            {boolean} defines the visibility of the
     *            locators
     * @memberof CursorWidgetLocator
     */
    WidgetLocatorManager.prototype.setVisible = function (visible) {
        if (this.visible === visible) {
            return;
        }
        this.visible = visible;
        this.updateLocators();
    }

    /**
     * Checks if the manager is in visible state
     * 
     * @return true if the manager is visible.
     * @memberof CursorWidgetLocator
     */
    WidgetLocatorManager.prototype.isVisible = function () {
        return this.visible;
    };


    WidgetLocatorManager.prototype.setEnable = function (enable) {
        if (this.enable === enable) {
            return;
        }
        this.enable = enable;

        var widgets = $widget.getChildren(this.getRootWidget());
        var intersectingWidget = [];
        // listeners
        for(var i = 0; i < widgets.length; i ++){
            var widget = widgets[i];
            if(widget.isIntersecting()){
                intersectingWidget.push(widget);
            }
            if(enable) {
                angular.forEach(this.widgetListeners, function (callback, type) {
                    widget.on(type, callback);
                });
            } else {
                angular.forEach(this.widgetListeners, function (callback, type) {
                    widget.off(type, callback);
                });
            }
        }
        // bound
        this.intersectingWidget = intersectingWidget;
        for(var j = 0; j < intersectingWidget.length; j++){
            var locator = this.getBoundLocatorOf(intersectingWidget[j]);
            if(enable) {
                locator.connect(intersectingWidget[j]);
            } else {
                locator.disconnect();
            }
        }
        // XXX: maso, selection

    };

    WidgetLocatorManager.prototype.isEnable = function () {
        return this.enable;
    };

    /**
     * Sets widgets which are selected
     * 
     * @param widgets
     *            {WbWidgetCtr} which are selected
     * @memberof CursorWidgetLocator
     */
    WidgetLocatorManager.prototype.setSelectedWidgets = function (widgets) {
        if(!this.isEnable()){
            return;
        }
        if(!angular.isArray(widgets)){
            widgets = [];
        }

        // remove old
        for(var i = 0; i < this.selectedWidgets.length; i++){
            var widget = this.selectedWidgets[i];
            if(widgets.indexOf(widget) < 0){
                var locator = this.getSelectionLocatorOf(widget);
                this.selectionLocatorTrash.push(locator);
                this.selectionLocatorMap.delete(widget);
                locator.disconnect();
            }
        }

        this.selectedWidgets = widgets;
        if(this.isEnable()){
            this.updateLocators();
        }
    };

    /**
     * Gets selected widgets
     * 
     * @return widgets
     * @memberof CursorWidgetLocator
     */
    WidgetLocatorManager.prototype.getSelectedWidgets = function () {
        return this.selectedWidgets;
    };

    WidgetLocatorManager.prototype.isWidgetSelected = function(widget){
        return this.selectedWidgets.indexOf(widget) >= 0;
    };

    /**
     * Sets the root widget
     * 
     * @param rootWidget
     *            {WbWidgetCtrl} root widget
     * @memberof WidgetLocatorManager
     */
    WidgetLocatorManager.prototype.setRootWidget = function (rootWidget) {
        if(this.rootWidget) {
            this.destroy();
        }
        this.rootWidget = rootWidget;
        if(this.rootWidget) {
            var element = this.rootWidget.getElement();
        }
        if (this.isEnable()) {
            this.updateBoundLocators();
        }
    };

    /**
     * Gets the root widget
     * 
     * @return the root widget
     * @memberof WidgetLocatorManager
     */
    WidgetLocatorManager.prototype.getRootWidget = function () {
        return this.rootWidget;
    };

    WidgetLocatorManager.prototype.directUpdateLocator = function(locator, widget) {
        if(this.isVisible){
            locator.connect(widget);
        } else {
            locator.disconnect();
        }
    };

    /**
     * Update all locators
     * 
     * @memberof WidgetLocatorManager
     */
    WidgetLocatorManager.prototype.updateLocators = function () {
        if(!angular.isFunction(this.debounceUpdate)){
            this.debounceUpdate = $widget.debounce(function(){
                var widgets = this.getIntersectingWidgets();
                for(var i = 0; i < widgets.length; i++){
                    var widget = widgets[i];
                    // update bound
                    this.directUpdateLocator(this.getBoundLocatorOf(widget), widget);

                    // update selection
                    if(this.isWidgetSelected(widget)){
                        this.directUpdateLocator(this.getSelectionLocatorOf(widget), widget);
                    }
                }
            }, 300, false);
        }
        this.debounceUpdate();
    };


    WidgetLocatorManager.prototype.getIntersectingWidgets = function(){
        return this.intersectingWidget;
    }

    WidgetLocatorManager.prototype.widgetIntersectingChange = function(widget){
        var index = this.intersectingWidget.indexOf(widget);
        // widget intersects with view
        if(widget.isIntersecting()){
            if(index < 0){
                this.intersectingWidget.push(widget);
                this.updateLocators();
            }
        } else {
            // widget is out of view
            if(index >= 0){
                this.intersectingWidget.splice(index, 1);
                this.updateLocators();
            }
        }
    }

    WidgetLocatorManager.prototype.getBoundLocatorOf = function (widget) {
        var map = this.boundLocatorMap;
        if(!map.has(widget)) {
            var locator;
            if(this.boundLocatorTrash.length > 0){
                locator = this.boundLocatorTrash.pop();
            } else {
                locator = new BoundWidgetLocator(this.boundLocatorOption);
            }
            map.set(widget, locator);
        }
        return map.get(widget);
    };

    WidgetLocatorManager.prototype.getSelectionLocatorOf = function(widget) {
        var map = this.selectionLocatorMap;
        if(!map.has(widget)) {
            var locator;
            if(this.selectionLocatorTrash.length > 0){
                locator = this.selectionLocatorTrash.pop();
            } else {
                locator = new SelectionWidgetLocator(this.selectionLocatorOption);
            }
            map.set(widget, locator);
        }
        return map.get(widget);
    };



    return WidgetLocatorManager;
});