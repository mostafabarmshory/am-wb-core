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

describe('Service $widget', function () {
	// instantiate service
	var $rootScope;
	var $widget;
	var $httpBackend;
	var $timeout;

	/*
	 * Mock of the root widget
	 */
	function MockRootWidget() {
		this.scope = $rootScope.$new();
		this.getScope = function () {
			return this.scope;
		};
	}
	;

	// load the service's module
	beforeEach(module('am-wb-core'));

	// instantiate service
	beforeEach(inject(function (_$rootScope_, _$widget_, _$httpBackend_,
			_$timeout_) {
		$rootScope = _$rootScope_;
		$widget = _$widget_;
		$httpBackend = _$httpBackend_;
		$timeout = _$timeout_;

		$widget.newWidget({
			type : 'Group',
			description : 'Panel contains list of widgets.',
			template : '<div></div>',
		});
		$widget.newWidget({
			type : 'HtmlText',
			template : '<div></div>'
		});
		
		$widget.newWidget({
		    type : 'BoostForm',
		    template : '<form></form>',
		    boost: 'WbWidgetGroupCtrl',
		    controller: function(){
		        this.boostFunction = function(){};
		    },
		    controllerAs: 'ctrl'
		});
	}));

	it('should add a new widget', function () {
		expect(angular.isFunction($widget.newWidget)).toBe(true);
	});
	it('should find a related widget for a model', function () {
		expect(angular.isFunction($widget.widget)).toBe(true);
	});

	it('should list all widget', function () {
		expect(angular.isFunction($widget.widgets)).toBe(true);
	});

	it('should get children and sub-children from a widget', function () {
		expect(angular.isFunction($widget.getChildren)).toBe(true);
	});

	it('should returns empty list of children for a widget', function (done) {
		var root = new MockRootWidget();
		// Create new instance
		$widget.compile({
			type : 'HtmlText',
			id : 'test',
			name : 'Widget',
			text : '<h2>HTML Text In 4th group0</h2>',
		}, root).then(function (widget) {
			expect(widget).not.toBe(null);
			var children = $widget.getChildren(widget);
			expect(children.length).toBe(0);
			done();
		});
		$rootScope.$apply();
	});

	// XXX: maso, 2018: fail on several internal promi
	it('should returns children of a group', function (done) {
		var root = new MockRootWidget();
		// Create new instance
		$widget.compile({
			type : 'Group',
			contents : [ {
				type : 'HtmlText',
				text : '<h2>HTML Text In 4th group0</h2>',
			}, {
				type : 'HtmlText',
				text : '<h2>HTML Text In 4th group0</h2>',
			} ]
		}, root).then(function (widget) {
			// wait for children
			$timeout(function () {
				expect(widget).not.toBe(null);
				var children = $widget.getChildren(widget);
				expect(children.length).toBe(2);
				done();
			}, 300);
		});
		$rootScope.$apply();
		$timeout.flush();
	});

	it('should returns sub-children of a group', function (done) {
		var root = new MockRootWidget();
		// Create new instance
		$widget.compile({
			type : 'Group',
			contents : [ {
				type : 'Group',
				contents : [ {
					type : 'Group',
					contents : [ {
						type : 'HtmlText',
						text : '<h2>HTML Text In 4th group0</h2>',
					}, {
						type : 'HtmlText',
						text : '<h2>HTML Text In 4th group0</h2>',
					} ]
				} ]
			} ]
		}, root).then(function (widget) {
			$timeout(function () {
				expect(widget).not.toBe(null);
				var children = $widget.getChildren(widget);
				expect(children.length).toBe(4);
				done();
			}, 300);
		});
		$rootScope.$apply();
		$timeout.flush();
	});

	it('should process widgets with processors', function (done) {
		var root = new MockRootWidget();

		var flag = false;
		$widget.setProcessor('test', function(widget, event){
			if(event.type === 'testEvent'){
				flag = true;
			}
		});
		// Create new instance
		$widget.compile({
			type : 'Group',
			contents : []
		}, root).then(function (widget) {
			widget.fire('testEvent', {key: 'test'});
			expect(flag).toBe(true);
			done();
		});
		$rootScope.$apply();
		$timeout.flush();
	});
	
    it('should support widget boost ', function (done) {
        var root = new MockRootWidget();
        // Create new instance
        $widget.compile({
            type : 'BoostForm',
            contents : [{
                type: 'input'
            }]
        }, root)
        .then(function (widget) {
            expect(angular.isFunction(widget.boostFunction)).toBe(true);
            expect(angular.isFunction(widget.getChildren)).toBe(true);
            done();
        });
        $rootScope.$apply();
        $timeout.flush();
    });
});
