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
 * Apply layout into an element
 * 
 * Group and page are the main goles of this directive. By adding the wbLayout,
 * widget are able to manages it layout automatically.
 * 
 * Note that, in smal screen devices, the colume layout apply as default.
 * 
 * @ngdoc directive
 * @memberof am-wb-core
 * @description Apply layout into an element
 */
.directive("wbLayout", function() {
	var classDirectionPrefix = 'wb-flex-';
	var classJustifyPrefix = 'wb-flex-item-';
	var classAlignPrefix = 'wb-flex-align-items-';
	/*
	 * FIXME: maso, 2017: replace class with term
	 * 
	 * It is hard to port final design, while it is fulle tied into the
	 * CSS classes. We must replace layout CSS classes with general terms
	 * as soon as posible.
	 */
	/**
	 * Remove layout config from element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function removeLayout(element, config) {
		// deprecated: Remove old class
		element.removeClass(config.flexDirection);
		element.removeClass(config.justifyContent);
		element.removeClass(config.alignItems);

		element.removeClass(classDirectionPrefix + config.direction || 'column');
		element.removeClass(classJustifyPrefix + config.justify || 'center');
		element.removeClass(classAlignPrefix + config.align || 'stretch');
	}

	/**
	 * Adds layout config into the element
	 * 
	 * @param element
	 * @param config
	 * @returns
	 */
	function addLayout(element, config) {
		// Add new class
		element.addClass(config.flexDirection);
		element.addClass(config.justifyContent);
		element.addClass(config.alignItems);

		element.addClass(classDirectionPrefix + config.direction || 'column');
		element.addClass(classJustifyPrefix + config.justify || 'center');
		element.addClass(classAlignPrefix + config.align || 'stretch');
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
	function postLink(scope, element, attrs/*, ctrls*/) {
		// group
//		var groupCtrl = ctrls[0];
//		if(groupCtrl && groupCtrl.isRoot()){
//			// Root element is controlled from outside
//			return;
//		}
		
		// Watch for layout
		scope.$watch(function(){
			if(!attrs.wbLayout || !attrs.wbLayout.layout) {
				return null;
			}
			return attrs.wbLayout.layout;
		}, function(newValue, oldValue) {
			if(newValue===oldValue){
				return;
			}
			if (oldValue) {
				removeLayout(element, oldValue);
			}
			if (newValue) {
				addLayout(element, newValue);
			}
		}, true);
	}

	/*
	 * Directive
	 */
	return {
		restrict : 'A',
		link : postLink,
		require:['?wbGroup']
	};
});