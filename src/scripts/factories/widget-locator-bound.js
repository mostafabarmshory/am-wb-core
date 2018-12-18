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
 * @name BoundWidgetLocator
 * @description Locates a widget bound
 * 
 */
.factory('BoundWidgetLocator', function (AbstractWidgetLocator, $rootScope) {

	var boundWidgetLocator = function (options) {
		options = options || {};
		AbstractWidgetLocator.apply(this, options);

		// load templates
		var template = options.template 
		|| '<div class="wb-widget-locator bound"></div>';

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
		this.setElements([this.topElement, this.rightElement,
			this.buttomElement, this.leftElement]);
	};
	boundWidgetLocator.prototype = new AbstractWidgetLocator();

	boundWidgetLocator.prototype.updateView = function (bound) {
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

	};
	return boundWidgetLocator;
});
