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
     */
    function abstractWidgetLocator() {
        this.callbacks = [];
        this.elements = [];
        this.observedWidgets = [];

        // Creates listeneres
        var ctrl = this;
        this.widgetDeletedListener = function () {
            ctrl.setWidget(null);
            ctrl.fire('widgetDeleted')
        };
        this.widgetSelectedListener = function () {
            ctrl.addClass('selected');
            ctrl.removeClass('mouseover');
            ctrl.fire('widgetSelected')
        }
        this.widgetUnselectedListener = function () {
            ctrl.removeClass('selected');
            if (ctrl.mouseover) {
                ctrl.addClass('mouseover');
            }
            ctrl.fire('widgetMouseover')
        }
        this.widgetMouseoverListener = function () {
            ctrl.addClass('mouseover');
            ctrl.mouseover = true;
            ctrl.fire('widgetMouseover')
        }
        this.widgetMouseoutListener = function () {
            ctrl.addClass('mouseout');
            ctrl.mouseover = false;
            ctrl.fire('widgetMouseout')
        }
    }

    abstractWidgetLocator.prototype.setVisible = function (visible) {
        this.visible = visible;
        if (visible) {
            this.show();
            this.fire('show');
        } else {
            this.hide();
            this.fire('hide');
        }
    };

    abstractWidgetLocator.prototype.isVisible = function () {
        return this.visible;
    };

    abstractWidgetLocator.prototype.setWidget = function (widget) {
        this.disconnect();
        this.widget = widget;
        this.observe(this.widget);
        this.fire('widgetChanged');
    };

    abstractWidgetLocator.prototype.getWidget = function () {
        return this.widget;
    };

    abstractWidgetLocator.prototype.setElements = function (elements) {
        this.elements = elements;
        angular.forEach(elements, function (element) {
            $rootElement.append(element);
            element.hide();
        });
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

    abstractWidgetLocator.prototype.setVisible = function (visible) {
        this.visible = visible;
        visible = this.visible && this.enable;
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
            this.observe(this.getWidget());
        }
    }

    abstractWidgetLocator.prototype.isEnable = function () {
        return this.enable;
    }

    abstractWidgetLocator.prototype.destroy = function () {
        this.fire('distroied');
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

    abstractWidgetLocator.prototype.disconnect = function () {
        for (var i = 0; i < this.observedWidgets.length; i++) {
            var widget = this.observedWidgets[i];
            widget.off('deleted', this.widgetDeletedListener);
            widget.off('selected', this.widgetSelectedListener);
            widget.off('unselected', this.widgetUnselectedListener);
            widget.off('mouseover', this.widgetMouseoverListener);
            widget.off('mouseout', this.widgetMouseoutListener);
        }
        this.observedWidgets = [];
    };

    abstractWidgetLocator.prototype.observe = function (widget) {
        if (!widget) {
            return;
        }
        // add listener
        this.observedWidgets.push(widget);
        widget.on('deleted', this.widgetDeletedListener);
        widget.on('selected', this.widgetSelectedListener);
        widget.on('unselected', this.widgetUnselectedListener);
        widget.on('mouseover', this.widgetMouseoverListener);
        widget.on('mouseout', this.widgetMouseoutListener);
        this.updateView(widget.getBoundingClientRect());
    };

    return abstractWidgetLocator;
});
