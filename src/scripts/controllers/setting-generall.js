/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')//

/**
 * @ngdoc Controllers
 * @name MbWidgetACtrl
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
.controller('MbSettingGeneralCtrl', function () {
	
	var attrs = [
		// id
		'id',
		'name',
		'title',
		
		// language
		'dir',
		'lang',
		'translate',
		'spellcheck',

		// access
		'accesskey',
		'contenteditable',
		'tabindex',
		'hidden',
		
		// General style
		'style.direction',
		'style.visibility',
		'style.color',
		'style.cursor',
		'style.opacity',
		
		// overflow
		'style.overflow.x',
		'style.overflow.y',
		];

	/*
	 * Initial the setting editor
	 */
	this.init = function () {
		/*
		 * Load data of the widget
		 */
		var ctrl = this;
		angular.forEach(attrs, function(attr){
			ctrl[attr] = ctrl.getProperty(attr);
		});
	};
});
