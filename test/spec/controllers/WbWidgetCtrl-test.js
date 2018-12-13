/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

describe('WbWidgetCtrl ', function () {
	// instantiate service
	var $cotroller;
	var $rootScope;
	var $widget;


	// load the service's module
	beforeEach(module('am-wb-core'));
	beforeEach(inject(function (_$rootScope_, _$cotroller_, _$widget_) {
		$cotroller = _$cotroller_;
		$rootScope = _$rootScope_;
		$widget = _$widget_;
	}));

	it('should support add and remove callback on events', function () {
		// Create new instance
		var textWidget = $widget.compile({
			type: 'HtmlText',
			id: 'test',
			name: 'Widget',
			text: '<h2>HTML Text In 4th group0</h2>',
		});
		expect(textWidget).not.toBe(null);
		expect(textWidget.getId()).toBe('test');
	});
});
