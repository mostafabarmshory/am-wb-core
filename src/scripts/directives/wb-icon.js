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
 */
.directive('wbIcon', function($interpolate) {
	function postLink(scope, element, attr, ctrl, transclude) {
		// Looking for icon
		var attrName = attr.$normalize(attr.$attr.wbIconName || '');
		var contentValue = null;

		transclude(scope, function(clone) {
			var text = clone.text();
			if (text && text.trim()) {
				scope.$watch(function(){
					return $interpolate(text.trim())(scope);
				}, function(value){
					scope.iconValue = value;
				});
			}
		});

		if (attrName) {
			attr.$observe('wbIconName', iconChange);
		}


		/*
		 * change icon
		 */
		function iconChange() {
			scope.iconValue = scope.contentValue || attr.wbIconName || '';
		}
	}
	

	return {
		restrict : 'E',
		template : '<ng-md-icon style="height: auto;width: auto;" icon="{{iconValue}}"></ng-md-icon>',
		scope: true,
		replace : true,
		transclude : true,
		link : postLink
	};


});
