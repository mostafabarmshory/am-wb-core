/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')//

/**
 * @ngdoc Controllers
 * @name WbSettingPageCtrl
 * @description Manages settings page
 * 
 * Manages settings pages.
 * 
 * This is an abstract implementation of a setting page and contains list of 
 * utilities.
 * 
 */
.controller('WbSettingPageCtrl', function () {
    /*
     * Attributes
     */
    this.widget = null;
    this.attributes = [];
    this.attributesValue = {};
    this.styles = [];
    this.stylesValue = {};
    this.callbacks = {
            widgetChanged: []
    };

    /********************************************************
     * Widget management
     ********************************************************/
    /**
     * Sets new widget into the setting page
     * 
     * Note: the old widget will be removed from the view and the
     * new one is connect.
     * 
     * @memberof WbSettingPageCtrl
     * @param widget {Widget} to track
     */
    this.setWidget = function (widget) {
        var oldWidget = this.widget;
        this.disconnect();
        this.widget = widget;
        this.connect();
        // load values
        this.loadAttributes();
        this.loadStyles();
        // propagate the change
        this.fire('widgetChanged', {
            value: widget,
            oldValue: oldWidget
        });
    };

    /**
     * Gets the current widget 
     * 
     * @memberof WbSettingPageCtrl
     * @return the current widget
     */
    this.getWidget = function () {
        return this.widget;
    };

    /**
     * Checks if the current widget is the root
     * 
     * @memberof WbSettingPageCtrl
     * @return true if the widget is root
     */
    this.isRootWidget = function () {
        var widget = this.getWidget();
        if (!widget) {
            return false;
        }
        return widget.isRoot();
    };

    /**
     * Checks if the current widget can contain others
     * 
     * @memberof WbSettingPageCtrl
     * @return true if the widget is a container
     */
    this.isContainerWidget = function(){
        var widget = this.getWidget();
        if (!widget) {
            return false;
        }
        return !widget.isLeaf();
    };

    /**
     * Removes listeners to the widget
     * 
     * The controller track the widget changes by adding listener into it. This
     * function removes all listener.
     * 
     * @memberof WbSettingPageCtrl
     */
    this.disconnect = function(){
        var widget = this.getWidget();
        if(_.isEmpty(widget) || !_.isFunction(this.widgetListener)){
            return;
        }
        widget.off('modelUpdated', this.widgetListener);
    };

    /**
     * Adds listeners to the widget
     * 
     * @memberof WbSettingPageCtrl
     */
    this.connect= function(){
        var widget = this.getWidget();
        if(_.isEmpty(widget)){
            return;
        }
        if(_.isEmpty(this.widgetListener)){
            var ctrl = this;
            this.widgetListener = function($event) {
                var widget = ctrl.widget;
                if($event.type === 'modelUpdated'){
                    var key = $event.key;
                    // load property
                    if(_.includes(ctrl.attributes, key)){
                        ctrl.attributesValue[key] = widget.getModelProperty(key);
                        return;
                    }
                    
                    // load style
                    if(key.startsWith('style.')){
                        var styleKey =  key.substring(6);
                        if(_.includes(ctrl.styles, styleKey)){
                            ctrl.stylesValue[styleKey] = widget.getModelProperty(key);
                        }
                        return;
                    }
                }
            };
        }
        widget.on('modelUpdated', this.widgetListener);
    };

    /*
     * INTERNAL
     */
    this.fire = function (key, event){
        _.forEach(this.callbacks[key], function(callback){
            try{
                callback.apply(callback, [event]);
            } catch(ex){
//                console.error(ex);
            }
        });
    };

    /**
     * Adds listeners to the widget
     * 
     * @memberof WbSettingPageCtrl
     * @param key {string} of the event
     * @param callback {Function} to call on event
     */
    this.on = function(key, callback){
        this.callbacks[key].push(callback);
    };

    /**
     * Adds listeners to the widget
     * 
     * @memberof WbSettingPageCtrl
     * @param key {string} of the event
     * @param callback {Function} to call on event
     */
    this.off = function(key, callback) {
        _.remove(this.callbacks[key], function(cl){
            return cl === callback;
        });
    };

    /***************************************************************
     * Track widget changes
     ***************************************************************/

    /*
     * INTERNAL
     */
    this.loadAttributes= function(){
        // 0- clean
        this.attributesValue = {};

        // 1- check
        var widget = this.getWidget();
        if(_.isEmpty(widget)){
            return;
        }

        // 2- load
        var ctrl = this;
        _.forEach(this.attributes, function(attrKey){
            ctrl.attributesValue[attrKey] = widget.getModelProperty(attrKey);
        });
    };

    /*
     * INTERNAL
     */
    this.loadStyles= function(){
        // 0- clean
        this.stylesValue = {};

        // 1- check
        var widget = this.getWidget();
        if(_.isEmpty(widget)){
            return;
        }

        // 2- load
        var ctrl = this;
        _.forEach(this.styles, function(styleKey){
            ctrl.stylesValue[styleKey] = widget.getModelProperty('style.'+styleKey);
        });
    };
    /***************************************************************
     * attribute utilities
     ***************************************************************/
    /**
     * Adds list of attributes to track
     * 
     * @memberof WbSettingPageCtrl
     * @param attributes {[string]} to track
     */
    this.trackAttributes = function(attributes){
        this.attributes = attributes || [];
        this.loadAttributes();
    };

    this.setAttribute = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.attributesValue[key] = value;
        this.widget.setModelProperty(key, value);
    };

    this.getAttribute = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty(key);
    };
    /***************************************************************
     * style utilities
     ***************************************************************/
    /**
     * Adds list of styles to track
     * 
     * @memberof WbSettingPageCtrl
     * @param styles {[string]} to track
     */
    this.trackStyles = function(styles){
        this.styles = styles || [];
        this.loadStyles();
    };
    
    this.setStyle = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.stylesValue[key] = value;
        this.widget.setModelProperty('style.' + key, value);
    };

    this.getStyle = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.' + key);
    };
});
