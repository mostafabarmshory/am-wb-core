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

/**
 * @ngdoc Widgets
 * @name WbWidgetHtml
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
angular.module('am-wb-core').factory('WbWidgetElement', function(WbWidget) {

    /**
     * Creates new instance 
     * 
     * @memberof WbWidgetGroupCtrl
     */
	function Widget($element, $parent) {

		// call super constractor
		WbWidget.apply(this, [$element, $parent]);
		var ctrl = this;

        /*
         * set element attribute
         */
		function eventHandler(event) {
			switch (event.key) {
				case 'text':
					ctrl.getElement().text(ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key));
					break;
				case 'html':
					ctrl.getElement().html(ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key));
					break;
				case 'intpuType':
					ctrl.setElementAttribute('type', event.value);
					break;
				case 'aType':
					ctrl.setElementAttribute('type', event.value);
					break;
			}
		}

		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
	}

	// extend functionality
	Widget.prototype = Object.create(WbWidget.prototype);

    /**
     * Gets value of the input
     * 
     * @memberof WbWidgetHtml
     */
	Widget.prototype.html = function() {
		var value = arguments[0];
		if (value) {
			this.setElementAttribute('html', value);
		}
		var element = this.getElement();
		return element.html.apply(element, arguments);
	};

	/**
	 * Gets value of the input
	 * 
	 * @memberof pre
	 */
	Widget.prototype.text = function() {
		var value = arguments[0];
		if (value) {
			this.setElementAttribute('text', value);
		}
		var element = this.getElement();
		return element.text.apply(element, arguments);
	};

	/**
	 * Gets value of the input
	 * 
	 * @memberof input
	 */
	Widget.prototype.val = function() {
		var value = arguments[0];
		if (value) {
			this.setElementAttribute('value', value);
		}
		var element = this.getElement();
		return element.val.apply(element, arguments);
	};
	return Widget;
});
