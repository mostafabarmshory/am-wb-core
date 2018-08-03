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
 * @name wb-border
 * @description Apply border into the element
 * 
 * Following attributes from CSS is set:
 * <ul>
 * <li>border-style from style</li>
 * <li>border-width from width</li>
 * <li>border-color from color</li>
 * <li>border-radius from radius</li>
 * </ul>
 * 
 * CSS model from CSS3 is accepted as standard
 * 
 * <pre><code>
 * 	{
 * 		style: solid,
 * 		width: 2px,
 * 		color: lightgrey,
 * 		radius: 5px
 * 	}
 * </code></pre>
 * 
 * @see https://www.w3schools.com/css/css_border.asp
 */
.directive("wbBorder", function() {
	return {
	    restrict : 'A',
	    link : function($scope, $element, $attrs) {
		    $scope.$watch($attrs.wbBorder + '.border', function(style) {
			    if (!style) {
				    return;
			    }
			    var conf = {};
			    if (style.style) {
				    conf['border-style'] = style.style;
			    }
			    if (style.width) {
				    conf['border-width'] = style.width;
			    }
			    if (style.color) {
				    conf['border-color'] = style.color;
			    }
			    if (style.radius) {
				    conf['border-radius'] = style.radius;
			    }
			    $element.css(conf);
		    }, true);
	    }
	};
});