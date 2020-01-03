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

angular.module('am-wb-core')//

/**
 * @ngdoc Widget
 * @name input
 * @description Manage an input field
 * 
 * The most used widget to get information from clients is an input. The input
 * are responsible to get most of data types (email, text, number, ex.) from
 * clients.
 * 
 */
.factory('WbWidgetInput', function (WbWidgetAbstract) {
	/**
	 * Creates new instance of the group
	 * 
	 * @memberof WbWidgetGroupCtrl
	 * @ngInject
	 */
	function Widget($element, $parent){
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('accept', 'alt',
				'autocomplete', 'autofocus', 'checked',
				'dirname', 'disabled', 
				'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
				'height', 'list','max',
				'maxlength', 'min', 'multiple', 'name',
				'pattern', 'placeholder', 'readonly',
				'required', 'size', 'src', 'step', 'inputType',
				'value', 'width');
		// init input
		var ctrl = this;
		function eventHandler(event){
			if(event.key === 'inputType'){
				ctrl.setElementAttribute('type', event.value);
			}
		}
		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
	}

	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);


	/**
	 * Gets value of the input
	 * 
	 * @memberof input
	 */
	Widget.prototype.val = function(){
		var value = arguments[0];
		if(value){
			this.setElementAttribute('value', value);
		}
		var element = this.getElement();
		return element.val.apply(element, arguments);
	};

	return Widget;
});
