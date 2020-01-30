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

describe('WbWidget ', function() {
	// instantiate service
	var $rootScope;
	var $widget;
	var $httpBackend;

	function MockRootWidget() {
		// TODO;
		this.scope = $rootScope.$new();
	};

	MockRootWidget.prototype.getScope = function() {
		return this.scope;
	}

	// load the service's module
	beforeEach(module('am-wb-core'));
	beforeEach(inject(function(_$rootScope_, _$widget_, _$httpBackend_) {
		$rootScope = _$rootScope_;
		$widget = _$widget_;
		$httpBackend = _$httpBackend_;
	}));

	var basicAttributes = [{
		key: 'accesskey',
		value: 'c'
	}, {
		key: 'contenteditable',
		value: 'false',
	}, {
		key: 'dir',
		value: 'rtl',
	}, {
		key: 'draggable',
		value: 'true',
	}, {
		//      key: 'dropzone',
		//      value: 'false',
		//      },{
		//      key: 'hidden',
		//      value: 'hidden',
		//      },{
		key: 'id',
		value: 'my-id',
	}, {
		key: 'lang',
		value: 'fa',
	}, {
		key: 'spellcheck',
		value: 'true',
		//      },{
		//      key: 'tabindex',
		//      value: '10',
	}, {
		key: 'title',
		value: 'title-test',
	}, {
		key: 'translate',
		value: 'true',
	}];
	angular.forEach(basicAttributes, function(keyval) {
		it('should set ' + keyval.key + ' from model', function(done) {
			var root = new MockRootWidget();
			// Create new instance
			var model = {
				type: 'Group',
			};
			model[keyval.key] = keyval.value;
			$widget.compile(model, root)
				.then(function(widget) {
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
	angular.forEach(basicAttributesWrong, function(key) {
		it('should not set invalid key:' + key + ' from model', function(done) {
			var root = new MockRootWidget();
			// Create new instance
			var model = {
				type: 'Group',
				id: 'test'
			};
			model[key] = 'test-value';
			$widget.compile(model, root)
				.then(function(widget) {
					expect(widget.getElementAttribute(key)).toBe(undefined);
					done();
				});
			$rootScope.$apply();
		});
	});

	var widgetTypes = [
		'a',
		'address',
		'applet',
		'area',
		'article',
		'aside',
		'audio',
		'blockquote',
		'button',
		'canvas',
		'datalist',
		'dd',
		'details',
		'dialog',
		'div',
		'dl',
		'dt',
		'embed',
		'fieldset',
		'figcaption',
		'figure',
		'footer',
		'form',
		'frame',
		'frameset',
		'h1',
		'h2',
		'h3',
		'h4',
		'h5',
		'h6',
		'header',
		'hr',
		'iframe',
		'img',
		'input',
		'kbd',
		'label',
		'legend',
		'li',
		'link',
		'main',
		'map',
		'meta',
		'meter',
		'nav',
		'noscript',
		'object',
		'ol',
		'optgroup',
		'option',
		'output',
		'p',
		'param',
		'picture',
		'pre',
		'progress',
		'q',
		'script',
		'section',
		'select',
		'source',
		'style',
		'summary',
		'svg',
		'template',
		'textarea',
		'track',
		'ul',
		'video',
	];
	angular.forEach(widgetTypes, function(type) {
		it('should support type ' + type, function(done) {
			// Create new instance
			var model = {
				type: type
			};
			$widget.compile(model)
				.then(function(widget) {
					expect(widget.getType()).toBe(type);
					done();
				});
			$rootScope.$apply();
		});
	});

	it('should call init function for dynamic childrens', function(done) {
		// Create new instance
		var model = {
			type: "div",
			on: {
				init: '$widget.setProperty("xx", "yy");'
			}
		};
		var parent = {
			type: 'div'
		};

		var parentWidget;
		$widget.compile(parent)
			.then(function(parentWidget1) {
				parentWidget = parentWidget1;
				return parentWidget.addChildrenModel(0, [model]);
			})
			.then(function() {
				expect(parentWidget.getChildren()[0].getProperty('xx')).toBe('yy');
				done();
			});
		$rootScope.$apply();
	});



});