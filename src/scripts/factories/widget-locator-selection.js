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
.factory('SelectionWidgetLocator', function (AbstractWidgetLocator) {

    var selectionWidgetLocator = function (options) {
        options = options || {};
        AbstractWidgetLocator.apply(this, options);

        // load headerTemplate
        var headerTag = '<div style="position: absolute; background: black; color: red; border: 1px solid black;">header</div>';
        this.titleElement = angular.element(headerTag);

        // load templates
        var template = options.template
        || '<div class="wb-widget-locator-bound"></div>';

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
        this.setElements([this.titleElement, this.topElement, this.rightElement,
            this.buttomElement, this.leftElement]);
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
            if (ctrl._oldWidgetWatch) {
                ctrl._oldWidgetWatch();
            }
            var widget = ctrl.getWidget();
            if (widget) {
                ctrl._oldWidgetWatch = widget.getScope().$watch(getBound, function (bound) {
                    if (!bound) {
                        return;
                    }
                    ctrl.updateView(bound);
                }, true);
                ctrl.updateView(getBound());
                ctrl.show();

                var model = widget.getModel();
                ctrl.titleElement.html(model.label || model.type);
            } else {
                ctrl.hide();
            }
        });
    };
    selectionWidgetLocator.prototype = new AbstractWidgetLocator();

    selectionWidgetLocator.prototype.updateView = function (bound) {
        this.topElement.css({
            top: bound.top + 1,
            left: bound.left + 1,
            width: bound.width - 2
        });
        this.rightElement.css({
            top: bound.top + 1,
            left: bound.left + bound.width - 2,
            height: bound.height - 2
        });
        this.buttomElement.css({
            top: bound.top + bound.height - 1,
            left: bound.left + 1,
            width: bound.width - 2
        });
        this.leftElement.css({
            top: bound.top + 1,
            left: bound.left + 1,
            height: bound.height - 2
        });
        if (bound.top < 32) {
            this.titleElement.css({
                top: bound.top + bound.height,
                left: bound.left + bound.width- this.titleElement.width() - 5
            });
        } else {
            this.titleElement.css({
                top: bound.top -  this.titleElement.height(),
                left: bound.left + bound.width - this.titleElement.width() - 5
            });
        }
    };
    return selectionWidgetLocator;
});

