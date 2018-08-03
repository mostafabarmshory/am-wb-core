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
 * @name wb-align
 * @description Apply layout align into an element
 * 
 */
.directive("wbAlign", function() {
	var classPrefix = 'wb-flex-item-';
	
	function removeLayout(element, config) {
		element.removeClass(classPrefix + config.align);
	}

	/**
	 * Adds layout config into the element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function addLayout(element, config) {
		element.addClass(classPrefix + config.align);
	}

	/**
	 * Link view with attributes
	 * 
	 * 
	 * @param scope
	 * @param element
	 * @param attrs
	 * @returns
	 */
	function postLink($scope, $element, $attrs) {
		// Watch for layout
		$scope.$watch($attrs.wbLayout+'.align', function(newValue, oldValue) {
			if(newValue===oldValue){
				return;
			}
			if (oldValue) {
				removeLayout($element, oldValue);
			}
			if (newValue) {
				addLayout($element, newValue);
			}
		}, true);
	}

	/*
	 * Directive
	 */
	return {
		restrict : 'A',
		link : postLink,
		require:[]
	};
});