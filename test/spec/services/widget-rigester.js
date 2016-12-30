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

describe('Service $widget', function() {

    // load the service's module
    beforeEach(module('ngMaterialWeburger'));

    // instantiate service
    var $widget;
    var $rootScope;
    var $timeout;
    beforeEach(inject(function(_$widget_, _$rootScope_, _$timeout_) {
	$widget = _$widget_;
	$rootScope = _$rootScope_;
	$timeout = _$timeout_;
    }));

    it('sould add a new widget', function(done) {
	var model = {
	    dom : '<wb-notfound-element></wb-notfound-element>',
	    label : 'Not found',
	    image : 'images/wb/notfoundelement.svg',
	    link : 'link',
	};
	var key = 'example-key';
	$widget.newWidget(key, model)//
	.then(function(widget) {
	    expect(!!widget).toBe(true);
	    expect(widget.dom).toBe(model.dom);
	    return $widget.widget({
		type : key
	    });
	})//
	.then(function(widget) {
	    expect(!!widget).toBe(true);
	    expect(widget.dom).toBe(model.dom);
	    done();
	});
	$timeout.flush(100);
	$timeout.verifyNoPendingTasks();
	$rootScope.$apply();
    });
});
