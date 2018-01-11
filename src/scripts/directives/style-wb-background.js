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
 * @ngdoc directive
 * @memberof am-wb-core
 * @description Apply background into the element
 */
.directive("wbBackground", function() {
	/**
	 * Sets background attributes into element
	 * 
	 * @param element
	 * @param style
	 * @returns
	 */
	function setBackgroud(element, style){
		if (!style) {
			return;
		}
		var cssValue = {};
		if(style.background){
			cssValue['background'] = style.background;
		}
		if(style.backgroundImage){
			cssValue['background-image'] = 'url(\''+style.backgroundImage+'\')';
		}

		if(style.backgroundColor){
			cssValue['background-color'] = style.backgroundColor;
		}
		if(style.backgroundSize) {
			cssValue['background-size'] = style.backgroundSize;
		}
		if(style.backgroundRepeat) {
			cssValue['background-repeat'] = style.backgroundRepeat;
		}
		if(style.backgroundPosition){
			cssValue['background-position'] = style.backgroundPosition;
		}
		if(style.backgroundAttachment){
			cssValue['background-attachment'] = style.backgroundAttachment;
		}
		if(style.backgroundOrigin){
			cssValue['background-origin'] = style.backgroundOrigin;
		}
		if(style.backgroundClip){
			cssValue['background-clip'] = style.backgroundClip;
		}
		
		// FIXME: maso, 1395: thies are not background parameter
		if(style.color){
			cssValue['color'] = style.color;
		}
		if(style.opacity){
			cssValue['opacity'] = (style.isTransparent) ? style.opacity/100 : 1;
		}
		element.css(cssValue);
	}

	function postLink(scope, element, attributes) {
		return scope.$watch(attributes.wbSize, function(style){
			return setBackgroud(element, style);
		}, true);
	}

	return {
		restrict : 'A',
		link : postLink
	};
});