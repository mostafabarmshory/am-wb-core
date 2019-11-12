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

angular.module('am-wb-core')


/**
 * @ngdoc Processor
 * @name WbProcessorAttribute
 * @description Widget processor
 * 
 */
.factory('WbProcessorAttribute', function (WbProcessorAbstract) {
	'use strict';

	function setWidgetElementAttribute(widget, key, value){
		if(widget.isEditable() && (key === 'draggable' || key === 'dropzone')){
			// are handled by processors in edit mode
			return;
		}
		var $element = widget.getElement();
		if(value){
			$element.attr(key, value);
		} else {
			$element.removeAttr(key);
		}
		// NOTE: html is special value
		if(key === 'html'){
			$element.html(value);
		}
		if(key === 'text'){
			$element.text(value);
		}
		if(key === 'inputType'){
			widget.setElementAttribute('type', value);
		}
		if(key === 'value'){
			$element.val(value);
		}
	}

	function setWidgetElementAttributes(widget, elementAttributes) {
//		var elementAttributes = widget.getElementAttributes();
		for(var i =0; i < elementAttributes.length; i++){
			var key = elementAttributes[i];
			setWidgetElementAttribute(widget, key, widget.getProperty(key) || widget.getModelProperty(key));
		}
	}

	function Processor() {
		WbProcessorAbstract.apply(this);
	}
	Processor.prototype = new WbProcessorAbstract();

	Processor.prototype.process = function (widget, event) {
		if (event.type === 'modelChanged') {
			setWidgetElementAttributes(widget, widget.getElementAttributes());
		} else if (event.type === 'modelUpdated') {
			setWidgetElementAttributes(widget, _.intersection(event.keys || [event.key]));
		}
	};
	return Processor;
});
