///* 
// * The MIT License (MIT)
// * 
// * Copyright (c) 2016 weburger
// * 
// * Permission is hereby granted, free of charge, to any person obtaining a copy
// * of this software and associated documentation files (the "Software"), to deal
// * in the Software without restriction, including without limitation the rights
// * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// * copies of the Software, and to permit persons to whom the Software is
// * furnished to do so, subject to the following conditions:
// * 
// * The above copyright notice and this permission notice shall be included in all
// * copies or substantial portions of the Software.
// * 
// * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// * SOFTWARE.
// */
//'use strict';
//
//angular.module('am-wb-core')
///**
// * @ngdoc Directives
// * @name wb-background
// * @description Apply background into the element
// */
//.directive('wbBackground', function() {
//	/*
//	 * Sets background attributes into element
//	 * 
//	 */
//	function setBackgroud($element, style){
//		if (!style) {
//			return;
//		}
//		var cssValue = {};
//		if(style.background){
//			cssValue.background = style.background;
//		}
//		cssValue['background-image'] = (style.image) ? 'url(\''+style.image+'\')' : 'none';
//		cssValue['background-color'] = style.color || 'initial';
//		cssValue['background-size'] = style.size || 'auto';
//		cssValue['background-repeat'] = style.repeat || 'repeat';
//		cssValue['background-position'] = style.position || '0px 0px';
//		cssValue['background-attachment'] = style.attachment || 'scroll';
//		cssValue['background-origin'] = style.origin || 'padding-box';
//		cssValue['background-clip'] = style.clip || 'border-box';
//		
//		$element.css(cssValue);
//	}
//
//	function postLink($scope, $element, $attrs) {
//		return $scope.$watch($attrs.wbBackground + '.background', function(config){
//			return setBackgroud($element, config);
//		}, true);
//	}
//
//	return {
//		restrict : 'A',
//		link : postLink
//	};
//});