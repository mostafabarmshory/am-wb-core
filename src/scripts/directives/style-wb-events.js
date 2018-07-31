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

angular.module('am-wb-core')
/**
 * @ngdoc Directives
 * @name wb-events
 * @description Applies events to the current element
 * 
 * If there is an event section in the data model, then this directive parses
 * and applies to the current element.
 * 
 * 	<div
 * 		wb-events="events">
 * 	</div>
 */
.directive("wbEvents", function() {
	function postLink($scope, $element, $attrs, $ctrls) {
		// load ctrl
		var ctrl = $ctrls[0] || $ctrls[1];

		$element.on('click', function (event) {
			// Check edit mode
			if(ctrl && ctrl.isEditable()){
				ctrl.setSelected(true);
				event.stopPropagation();
				return;
			}
			// TODO: maso, 2018: do actions
		});
	}
	return {
	    restrict : 'A',
	    link : postLink,
		require:['?wbGroup', '?wbWidget']
	};
});