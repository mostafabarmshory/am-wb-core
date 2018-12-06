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

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 * @ngInject
 */
function AbstractWidgetLocator($rootElement) {

    /**
     * Creates new instance of the widget locator
     */
    function abstractWidgetLocator() {
        this.callbacks = [];
        this.elements = [];
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
        this.widget = widget;
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
        angular.forEach(this.elements, function (element) {
            element.hide();
        });
    }

    abstractWidgetLocator.prototype.show = function (bound) {
        angular.forEach(this.elements, function (element) {
            element.show();
        });
    }

    abstractWidgetLocator.prototype.destroy = function () {
        this.fire('distroied');
        angular.forEach(this.elements, function () {
            element.remove();
        });
        this.elements = [];
        this.callbacks = [];
    }

    return abstractWidgetLocator;
}

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 * @ngInject
 */
function CursorWidgetLocator(AbstractWidgetLocator, $rootScope) {

    var cursorWidgetLocator = function (options) {
        options = options || {};
        AbstractWidgetLocator.apply(this, options);

        // load templates
        var template = options.template
        || '<div class="wb-widget-locator-cursor"></div>';

        // load elements
        this.topElement = angular.element(template);
        this.topElement.attr('id', 'top');

        this.rightElement = angular.element(template);
        this.rightElement.attr('id', 'right');

        this.buttomElement = angular.element(template);
        this.buttomElement.attr('id', 'buttom');

        this.leftElement = angular.element(template);
        this.leftElement.attr('id', 'left');

        // init controller
        this.setElements([ this.topElement, this.rightElement,
            this.buttomElement, this.leftElement ]);
        var ctrl = this;
        function getBound() {
            var $element = ctrl.getWidget().getElement();
            var off = $element.offset();
            return {
                left: off.left,
                top: off.top,
                width: $element.outerWidth(),
                height: $element.outerHeight()
            };
        }
        this.on('widgetChanged', function () {
            if(ctrl._oldWidgetWatch) {
                ctrl._oldWidgetWatch();
            }
            var widge = ctrl.getWidget();
            if(widge) {
                widge.getScope().$watch(getBound, function (bound) {
                    if (!bound) {
                        return;
                    }
                    ctrl.updateView(bound);
                }, true);
            }
            ctrl.updateView(getBound());
        });
    };
    cursorWidgetLocator.prototype = new AbstractWidgetLocator();

    cursorWidgetLocator.prototype.updateView = function (bound) {
        var widget = this.getWidget();
        if (!widget) {
            this.hide();
            return;
        }
        this.show();

        this.topElement.css({
            top : bound.top + 1,
            left : bound.left + 1,
            width : bound.width - 2
        });
        this.rightElement.css({
            top : bound.top + 1,
            left : bound.left + bound.width - 2,
            height : bound.height - 2
        });
        this.buttomElement.css({
            top : bound.top + bound.height - 1,
            left : bound.left + 1,
            width : bound.width - 2
        });
        this.leftElement.css({
            top : bound.top + 1,
            left : bound.left + 1,
            height : bound.height - 2
        });

    };
    return cursorWidgetLocator;
}

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 * @ngInject
 */
function BoundWidgetLocator() {

    var boundWidgetLocator = function () {
        // TODO:
    };

    boundWidgetLocator.prototype = new AbstractWidgetLocator();

    return boundWidgetLocator;
}

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 * @ngInject
 */
function ActionsWidgetLocator() {
    var actionsWidgetLocator = function () {
        // TODO:
    }
    actionsWidgetLocator.prototype = new AbstractWidgetLocator();

    return actionsWidgetLocator;
}

angular.module('am-wb-core')//
.factory('CursorWidgetLocator', CursorWidgetLocator)//
.factory('BoundWidgetLocator', BoundWidgetLocator)//
.factory('ActionsWidgetLocator', ActionsWidgetLocator)//
.factory('AbstractWidgetLocator', AbstractWidgetLocator);
