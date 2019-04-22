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
	var $rootScope;
	var $widget;
	var $httpBackend;
	var widgetType = 'TestWidget-' + Math.random();

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
		/*
		 * Register a test widget
		 */
		$widget.newWidget({
		    type: widgetType,
		    controller: function(){
		        this.testFunction = function(){
		            return true;
		        };
		        this.initWidget = function() {
		            // TODO;
		        };
		    },
		    controllerAs: 'ctrl',
		    template: '<h1>{{ctrl.text}}</h1>'
		});
	}));

	it('should support add and remove callback on events', function (done) {
		var root = new MockRootWidget();
		// Create new instance
		$widget.compile({
			type: widgetType,
			id: 'test',
			name: 'Widget',
			text: '<h2>HTML Text In 4th group0</h2>',
		}, root)
		.then(function(widget){
			expect(widget).not.toBe(null);
			expect(widget.getId()).toBe('test');
			
			var flag = true;
			var callback = function() {
				flag = true;
			};
			
			widget.on('something', callback);
			widget.fire('simething');
			expect(flag).toBe(true);
			
			flag = false;
			widget.off('something', callback);
			widget.fire('simething');
			expect(flag).toBe(false);
			
			done();
		});
		$rootScope.$apply();
	});
	

    it('should update css and element if any part of style.size changed', function (done) {
        var root = new MockRootWidget();
        // Create new instance
        $widget.compile({
            type: widgetType,
            id: 'test',
            name: 'Widget',
            text: '<h2>HTML Text In 4th group0</h2>',
        }, root)
        .then(function(widget){
            expect(widget).not.toBe(null);
            expect(widget.getId()).toBe('test');
            
            var randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.width', randomValue);
            expect(widget.getElement().css('width')).toBe(randomValue);
            
            randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.minWidth', randomValue);
            expect(widget.getElement().css('min-width')).toBe(randomValue);
            
            randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.maxWidth', randomValue);
            expect(widget.getElement().css('max-width')).toBe(randomValue);
            
            
            var randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.height', randomValue);
            expect(widget.getElement().css('height')).toBe(randomValue);
            
            randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.minHeight', randomValue);
            expect(widget.getElement().css('min-height')).toBe(randomValue);
            
            randomValue = Math.floor(Math.random() * 1000) + 'px';
            widget.setProperty('style.size.maxHeight', randomValue);
            expect(widget.getElement().css('max-height')).toBe(randomValue);
            
            done();
        });
        $rootScope.$apply();
    });
});
