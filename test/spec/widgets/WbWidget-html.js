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

describe('WbWidget HTML ', function () {
    // instantiate service
    var $rootScope;
    var $widget;
    var $httpBackend;

    // load the service's module
    beforeEach(module('am-wb-core'));
    beforeEach(inject(function (_$rootScope_, _$widget_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $widget = _$widget_;
        $httpBackend = _$httpBackend_;
    }));

    it('should set html value programatically', function (done) {
        // Create new instance
        var model = {
                type: 'p',
                id: 'a',
                href: 'http://www.viraweb123.ir',
                html: 'hi'
        };
        $widget.compile(model)
        .then(function(widget){
            expect(angular.isFunction(widget.html)).toBe(true);
            expect(widget.html()).toBe(model.html);

            widget.html('by');
            expect(widget.html()).toBe('by');

            done();
        });
        $rootScope.$apply();
    });



    it('should set html value by setting property', function (done) {
        // Create new instance
        var model = {
                type: 'p',
                id: 'a',
                href: 'http://www.viraweb123.ir',
                html: 'hi'
        };
        $widget.compile(model)
        .then(function(widget){
            expect(angular.isFunction(widget.html)).toBe(true);
            expect(widget.html()).toBe(model.html);

            widget.setModelProperty('html', 'by');
            expect(widget.html()).toBe('by');

            done();
        });
        $rootScope.$apply();
    });

});
