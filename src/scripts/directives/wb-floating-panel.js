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

.directive('amWbFloatingPanel', function () {
	function postLink(scope, elem, attrs) {
		var config = {
				title: scope.title || '' ,
				position: "center",
				size: { width: 450, height: 250 },
				content: scope.htmlTag || $('#'+ scope.htmlTag),
				theme: scope.theme || 'success' ,

		};
		var size, position;
		if (scope.parentTag) {
			var element = $('#' + scope.parentTag);
			var pos = element.offset();
			config.size = { 
					width: element.width(), 
					height: element.height() 
			};
			config.position = { 
					top: 100, 
					left: 100 
			};

		}
		var panel1 = $.jsPanel({
			config
		});
	}

	return {
		restrict: 'A',
		scope: {
			parentTag: '@',
			title: '@',
			content: '@',
			htmlTag:'@',
			theme: '@',         
		},
		link: postLink
	};
})