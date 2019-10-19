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

describe('WbWidget processor event ', function () {
    // instantiate service
    var $widget;
    var processor;
    var $timeout;
    var $rootScope;
    

    angular.module('am-wb-core')//
    .config(['$qProvider', function ($qProvider) {
        $qProvider.errorOnUnhandledRejections(false);
    }]);

    // load the service's module
    beforeEach(module('am-wb-core'));
    beforeEach(inject(function (_$widget_, _WbProcessorStyle_, _$rootScope_, _$timeout_) {
        $widget = _$widget_;
        processor = new _WbProcessorStyle_();
        $rootScope = _$rootScope_;
        $timeout = _$timeout_;
    }));

    it('should load event handlers on init', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                'class': 'a b',
                style: {
                    background: {
                        color: 'red'
                    }
                },
                event: {
                    init: '$widget.setProperty(\'style.background.color\', \'black\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            expect(widget.getElement().css('background-color')).toBe('black');
            done();
        });
        $rootScope.$apply();
    });

    it('should load style on model update', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    click: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().click();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });

    it('should not intropt the engine if there is error', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                style: {
                    background: {
                        color: 'red'
                    }
                },
                event: {
                    init: '$widget2.setProperty(\'style.background.color\', \'pink\');',
                    load: '+++.setProperty(\'style.background.color\', \'pink\');',
                    click: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            expect(widget.getElement().css('background-color')).toBe('red');

            widget.getElement().click();
            expect(widget.getElement().css('background-color')).toBe('pink');

            done();
        });
        $rootScope.$apply();
    });
    it('must disable events in edit mode', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                style: {
                    background: {
                        color: 'red'
                    }
                },
                event: {
                    click: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            expect(widget.getElement().css('background-color')).toBe('red');

            widget.setEditable(true);

            widget.getElement().click();
            expect(widget.getElement().css('background-color')).toBe('red');

            widget.setEditable(false);

            widget.getElement().click();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });


    it('should handle dblclick', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    dblclick: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().dblclick();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });
    it('should handle mouseout', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    mouseout: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().mouseout();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });
    it('should handle mouseover', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    mouseover: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().mouseover();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });
    it('should handle mousedown', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    mousedown: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().mousedown();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });
    it('should handle mouseup', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                event: {
                    mouseup: '$widget.setProperty(\'style.background.color\', \'pink\');'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.getElement().mouseup();
            expect(widget.getElement().css('background-color')).toBe('pink');
            done();
        });
        $rootScope.$apply();
    });


    it('should cancel timeout service on edit mode', function (done) {
        // Create new instance
        var model = {
                type: 'div',
                id: 'test',
                style: {
                    background: {
                        color: 'red'
                    }
                },
                event: {
                    init: '$timeout(function(){$widget.setProperty(\'style.background.color\', \'pink\')}, 1000);'
                }
        };
        $widget.compile(model)
        .then(function(widget){
            widget.setEditable(true);
            $timeout(function(){
                expect(widget.getElement().css('background-color')).toBe('red');
                done();
            }, 2000);
        });
        $rootScope.$apply();
        $timeout.flush();
    });
});
