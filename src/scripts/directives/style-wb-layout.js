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
 * @name wb-layout
 * @description Apply layout into an element
 * 
 * Group and page are the main goles of this directive. By adding the wbLayout,
 * widget are able to manages it layout automatically.
 * 
 * Note that, in smal screen devices, the colume layout apply as default.
 */
.directive("wbLayout", function() {
	var classDirectionPrefix = 'wb-flex-';
	var classJustifyPrefix = 'wb-flex-justify-content-';
	var classAlignPrefix = 'wb-flex-align-items-';
	/*
	 * FIXME: maso, 2017: replace class with term
	 * 
	 * It is hard to port final design, while it is fulle tied into the
	 * CSS classes. We must replace layout CSS classes with general terms
	 * as soon as posible.
	 */
	/**
	 * Remove layout configuration from element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function removeLayout(element, config) {
		element.removeClass(classDirectionPrefix + config.direction);
		element.removeClass(classJustifyPrefix + config.justify);
		element.removeClass(classAlignPrefix + config.align);
	}

	/**
	 * Adds layout config into the element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function addLayout(element, config) {
		element.addClass(classDirectionPrefix + config.direction);
		element.addClass(classJustifyPrefix + config.justify);
		element.addClass(classAlignPrefix + config.align);
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
		$scope.$watch($attrs.wbLayout+'.layout', function(newValue, oldValue) {
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