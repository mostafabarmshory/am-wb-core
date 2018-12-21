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

angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 */
.factory('AbstractWidgetLocator', function ($rootElement) {

    /**
     * Creates new instance of the widget locator
     * 
     * @memberof AbstractWidgetLocator
     */
    function abstractWidgetLocator() {
        this.callbacks = [];
        this.elements = [];
        this.observedWidgets = [];
        
        // Creates listeners
        var ctrl = this;
        this.widgetListeners = {
                'delete' : function ($event) {
                    ctrl.setWidget(null);
                    ctrl.fire('widgetDeleted', $event);
                },
                'select' : function ($event) {
                    ctrl.addClass('selected');
                    ctrl.removeClass('mouseover');
                    ctrl.fire('widgetSelected', $event);
                },
                'unselect' : function ($event) {
                    ctrl.removeClass('selected');
                    if (ctrl.mouseover) {
                        ctrl.addClass('mouseover');
                    }
                    ctrl.fire('widgetUnselected', $event);
                },
                'mouseover' : function ($event) {
                    ctrl.addClass('mouseover');
                    ctrl.mouseover = true;
                },
                'mouseout' : function ($event) {
                    ctrl.removeClass('mouseover');
                    ctrl.mouseover = false;
                },
                'resize' : function ($event) {
                    this.updateView();
                }
        };
    }

    /**
     * Defines anchor 
     */
    abstractWidgetLocator.prototype.setAnchor = function (anchor) {
        this.anchor = anchor;
    };

    abstractWidgetLocator.prototype.getAnchor = function (auncher) {
        // find custom anchor
        if(this.anchor){
            var list = $rootElement.find(this.anchor);
            if(list){
                return list[0];
            }
        }
        // find parent
        var widget = this.getWidget();
        if(widget && widget.getParent()){
            return widget.getParent().getElement();
        }
        // return root
        return $rootElement;
    };


    /**
     * Checks if the locator is visible
     * 
     * @return true if the locator is visible
     * @memberof AbstractWidgetLocator
     */
    abstractWidgetLocator.prototype.isVisible = function () {
        return this.visible;
    };

    /**
     * Sets new widget
     */
    abstractWidgetLocator.prototype.setWidget = function (widget) {
        this.disconnect();
        this.widget = widget;
        this.observe();
        this.updateView();
        this.fire('widgetChanged');
    };

    abstractWidgetLocator.prototype.getWidget = function () {
        return this.widget;
    };

    abstractWidgetLocator.prototype.setElements = function (elements) {
        this.elements = elements;
    };

    abstractWidgetLocator.prototype.getElements = function () {
        return this.elements;
    };

    abstractWidgetLocator.prototype.on = function (type, callback) {
        if (!angular.isArray(this.callbacks[type])) {
            this.callbacks[type] = [];
        }
        this.callbacks[type].push(callback);
    };

    abstractWidgetLocator.prototype.fire = function (type) {
        if (angular.isDefined(this.callbacks[type])) {
            for (var i = 0; i < this.callbacks[type].length; i++) {
                try {
                    this.callbacks[type][i]();
                } catch (error) {
                    console.log(error);
                }
            }
        }
    };

    abstractWidgetLocator.prototype.hide = function () {
        this.setVisible(false);
    }

    abstractWidgetLocator.prototype.show = function () {
        this.setVisible(true);
    }


    /**
     * Set the locator visible
     * 
     * @param visible
     *            {boolean} the visibility of the page
     * @memberof AbstractWidgetLocator
     */
    abstractWidgetLocator.prototype.setVisible = function (visible) {
        this.visible = visible;
        visible = this.visible && this.enable;
        if (visible) {
            this.updateView();
            this.fire('show');
        } else {
            this.fire('hide');
        }
        angular.forEach(this.elements, function (element) {
            if (visible) {
                element.show();
            } else {
                element.hide();
            }
        });
    }

    abstractWidgetLocator.prototype.isVisible = function () {
        return this.visible;
    }

    /**
     * Enable locator
     * 
     * If the locater is enable, then it watch for regular widget event and fire
     * it to internal listeneres.
     * 
     * @param enable
     *            {boolean} the flag to enable and disable.
     * @memberof AbstractWidgetLocator
     */
    abstractWidgetLocator.prototype.setEnable = function (enable) {
        if (this.enable == enable) {
            return;
        }
        this.enable = enable;
        this.setVisible(this.enable && this.visible);
        if (this.enable) {
            this.disconnect();
        } else {
            this.observe();
        }
    }

    abstractWidgetLocator.prototype.isEnable = function () {
        return this.enable;
    }

    /**
     * Removes all resources
     */
    abstractWidgetLocator.prototype.destroy = function () {
        this.fire('destroied');
        this.disconnect();
        angular.forEach(this.elements, function (element) {
            element.remove();
        });
        this.elements = [];
        this.callbacks = [];
    }

    abstractWidgetLocator.prototype.addClass = function (value) {
        var elements = this.getElements();
        for (var i = 0; i < elements.length; i++) {
            elements[i].addClass(value);
        }
    };

    abstractWidgetLocator.prototype.removeClass = function (value) {
        var elements = this.getElements();
        for (var i = 0; i < elements.length; i++) {
            elements[i].removeClass(value);
        }
    };

    /**
     * Remove connection the the current widget
     */
    abstractWidgetLocator.prototype.disconnect = function () {
        if(!this.widget){
            return;
        }
        // remove listeners
        var widget = this.widget;
        angular.forEach(this.widgetListeners, function (listener, type) {
            widget.off(type, listener);
        });
        // remove elements
        var elements = this.getElements();
        for (var i = 0; i < elements.length; i++) {
            elements[i].detach();
        }
    };

    abstractWidgetLocator.prototype.observe = function () {
        if (!this.widget) {
            return;
        }
        // add listener
        var widget = this.widget;
        angular.forEach(this.widgetListeners, function (listener, type) {
            widget.on(type, listener);
        });
        
        // attache element
        var anchor = this.getAnchor();
        var elements = this.getElements();
        angular.forEach(elements, function (element) {
            anchor.append(element);
        });
    };

    return abstractWidgetLocator;
});
