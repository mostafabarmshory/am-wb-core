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

describe('WbWidget ', function () {
	// instantiate service
	var $rootScope;
	var $widget;
	var $httpBackend;

	function MockRootWidget() {
		// TODO;
		this.scope = $rootScope.$new();
	};

	MockRootWidget.prototype.getScope = function(){
		return this.scope;
	}

	// load the service's module
	beforeEach(module('am-wb-core'));
	beforeEach(inject(function (_$rootScope_, _$widget_, _$httpBackend_) {
		$rootScope = _$rootScope_;
		$widget = _$widget_;
		$httpBackend = _$httpBackend_;
	}));

	var basicAttributes = [{
		key: 'accesskey',
		value: 'c'
	},{
		key: 'contenteditable',
		value: 'false',
	},{
		key: 'dir',
		value: 'rtl',
	},{
		key: 'draggable',
		value: 'true',
	},{
		key: 'dropzone',
		value: 'false',
	},{
		key: 'hidden',
		value: 'hidden',
	},{
		key: 'id',
		value: 'my-id',
	},{
		key: 'lang',
		value: 'fa',
	},{
		key: 'spellcheck',
		value: 'true',
	},{
		key: 'tabindex',
		value: '10',
	},{
		key: 'title',
		value: 'title-test',
	},{
		key: 'translate',
		value: 'true',
	}];
	angular.forEach(basicAttributes, function(keyval){
		it('should set ' + keyval.key + ' from model', function (done) {
			var root = new MockRootWidget();
			// Create new instance
			var model = {
					type: 'Group',
			};
			model[keyval.key] = keyval.value;
			$widget.compile(model, root)
			.then(function(widget){
				expect(widget.getElementAttribute(keyval.key)).toBe(model[keyval.key]);
				done();
			});
			$rootScope.$apply();
		});
	});
	
	var basicAttributesWrong = [
		'1accesskey',
		'xx',
		'aa aa '
		];
	angular.forEach(basicAttributesWrong, function(key){
		it('should not set invalid key:' + key + ' from model', function (done) {
			var root = new MockRootWidget();
			// Create new instance
			var model = {
					type: 'Group',
					id: 'test'
			};
			model[key] = 'test-value';
			$widget.compile(model, root)
			.then(function(widget){
				expect(widget.getElementAttribute(key)).toBe(undefined);
				done();
			});
			$rootScope.$apply();
		});
	});
});
