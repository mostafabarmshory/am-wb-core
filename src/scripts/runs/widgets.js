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

angular.module('ngMaterialWeburger')

/**
 * Load widgets
 */
.run(
		function($widget) {
			// Page
			$widget.newWidget({
				type: 'Group',
				template : '<wb-panel></wb-panel>',
				label : 'Panel',
				description : 'Panel contains list of widgets.',
				image : 'images/wb/content.svg',
				help : 'http://dpq.co.ir/more-information-link',
			});
			// HTML text
			$widget.newWidget({
				type: 'HtmlText',
				templateUrl : 'views/widgets/wb-html.html',
				label : 'HTML text',
				description : 'An HTML block text.',
				image : 'images/wb/html.svg',
				help : 'http://dpq.co.ir',
				setting:['text'],
				data : {
					text : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
				}
			});
		});
