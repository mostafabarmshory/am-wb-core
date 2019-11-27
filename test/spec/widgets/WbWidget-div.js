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

describe('Widget div ', function () {
    // instantiate service
    var $rootScope;
    var $widget;

    // load the service's module
    beforeEach(module('am-wb-core'));
    beforeEach(inject(function (_$rootScope_, _$widget_) {
        $rootScope = _$rootScope_;
        $widget = _$widget_;
    }));

    it('should implements collection api ', function (done) {
        var model = {
                type: 'div',
        };
        $widget.compile(model)
        .then(function(group){
            // model
            expect(angular.isFunction(group.setModel)).toBe(true);
            expect(angular.isFunction(group.delete)).toBe(true);

            // model: manages child
            expect(angular.isFunction(group.addChildModel)).toBe(true); // legacy
            expect(angular.isFunction(group.addChildrenModel)).toBe(true);// legacy

            // will ber removed in next major version
            expect(angular.isFunction(group.addChild)).toBe(true); // legacy
            expect(angular.isFunction(group.addChildren)).toBe(true);// legacy

            // UI: manage child (input is widgets)
            expect(angular.isFunction(group.getChildById)).toBe(true);
            expect(angular.isFunction(group.getChildren)).toBe(true);
            expect(angular.isFunction(group.indexOfChild)).toBe(true);
            expect(angular.isFunction(group.removeChild)).toBe(true);
            expect(angular.isFunction(group.removeChildren)).toBe(true);

            // select: moved into processor
//            expect(angular.isFunction(group.isChildSelected)).toBe(true);
//            expect(angular.isFunction(group.childSelected)).toBe(true);
//            expect(angular.isFunction(group.childUnSelected)).toBe(true);

            // manage D&D
            expect(angular.isFunction(group.getAllowedTypes)).toBe(true);
            expect(angular.isFunction(group.setAllowedTypes)).toBe(true);

            done();
        });
        $rootScope.$apply();
    });




    it('should insert a child model at the first', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildModel(0, {
                    type: 'a'
                })
                .then(function(){
                    expect(group.getChildren().length).toBe(1);
                    expect(group.getChildren()[0].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            })
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });


    it('should insert a child model at the first', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1'
                }, {
                    type: 'p'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildModel(0, {
                    type: 'a'
                })
                .then(function(){
                    expect(group.getChildren().length).toBe(3);
                    expect(group.getChildren()[1].getType()).toBe('h1');
                    expect(group.getChildren()[2].getType()).toBe('p');
                    expect(group.getChildren()[0].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            })
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a child model at the end', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1'
                }, {
                    type: 'p'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildModel(2, {
                    type: 'a'
                })
                .then(function(){
                    expect(group.getChildren().length).toBe(3);
                    expect(group.getChildren()[0].getType()).toBe('h1');
                    expect(group.getChildren()[1].getType()).toBe('p');
                    expect(group.getChildren()[2].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            })
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a child model at the middle', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1'
                }, {
                    type: 'p'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildModel(1, {
                    type: 'a'
                })
                .then(function(){
                    expect(group.getChildren().length).toBe(3);
                    expect(group.getChildren()[0].getType()).toBe('h1');
                    expect(group.getChildren()[2].getType()).toBe('p');
                    expect(group.getChildren()[1].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a children', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildrenModel(0, [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'a'
                }])
                .then(function(){
                    expect(group.getChildren().length).toBe(3);
                    expect(group.getChildren()[0].getType()).toBe('h1');
                    expect(group.getChildren()[1].getType()).toBe('p');
                    expect(group.getChildren()[2].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a children at the start', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'meta'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildrenModel(0, [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'a'
                }])
                .then(function(){
                    expect(group.getChildren().length).toBe(4);
                    expect(group.getChildren()[0].getType()).toBe('h1');
                    expect(group.getChildren()[1].getType()).toBe('p');
                    expect(group.getChildren()[2].getType()).toBe('a');
                    expect(group.getChildren()[3].getType()).toBe('meta');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a children at the end', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'meta'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildrenModel(1, [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'a'
                }])
                .then(function(){
                    expect(group.getChildren().length).toBe(4);
                    expect(group.getChildren()[1].getType()).toBe('h1');
                    expect(group.getChildren()[2].getType()).toBe('p');
                    expect(group.getChildren()[3].getType()).toBe('a');
                    expect(group.getChildren()[0].getType()).toBe('meta');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });
    it('should insert a children at the middle', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'meta'
                },{
                    type: 'meta'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildrenModel(1, [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'a'
                }])
                .then(function(){
                    expect(group.getChildren().length).toBe(5);
                    expect(group.getChildren()[0].getType()).toBe('meta');
                    expect(group.getChildren()[1].getType()).toBe('h1');
                    expect(group.getChildren()[2].getType()).toBe('p');
                    expect(group.getChildren()[3].getType()).toBe('a');
                    expect(group.getChildren()[4].getType()).toBe('meta');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should insert a children at the end', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'meta'
                },{
                    type: 'meta'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                return group.addChildrenModel(100, [{
                    type: 'h1'
                }, {
                    type: 'p'
                }, {
                    type: 'a'
                }])
                .then(function(){
                    expect(group.getChildren().length).toBe(5);
                    expect(group.getChildren()[0].getType()).toBe('meta');
                    expect(group.getChildren()[1].getType()).toBe('meta');
                    expect(group.getChildren()[2].getType()).toBe('h1');
                    expect(group.getChildren()[3].getType()).toBe('p');
                    expect(group.getChildren()[4].getType()).toBe('a');
                    done();
                });
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should get child by id', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                expect(group.getChildById('1').getType()).toBe('h1');
                expect(group.getChildById('2').getType()).toBe('h2');
                expect(group.getChildById('3').getType()).toBe('h3');
                done();
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

    it('should set and get allowed types', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            group.setAllowedTypes('a', 'b');
            var types = group.getAllowedTypes();
            expect(types.length).toBe(2);
            expect(_.indexOf(types, 'a') > -1).toBe(true);
            expect(_.indexOf(types, 'b') > -1).toBe(true);
            done();
        })
        $rootScope.$apply();
    });

    it('should ignore data model if set agin', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            group.on('modelChanged', function(){
                expect(false).toBe(true);
            });
            function runTest(){
                group.setModel(model);
                group.setModel(model);
                group.setModel(model);
                done();
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });
    
    it('should get child by id', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'h1',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                expect(group.getChildById('1').getType()).toBe('h1');
                var child = group.getChildById('1');
                child.delete();
                child = group.getChildById('1');
                expect(angular.isDefined(child)).toBe(false);
                done();
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });
    

    it('should delete child group by id', function (done) {
        var group;
        // Create new instance
        var model = {
                type: 'div',
                children:[{
                    type: 'Group',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                expect(group.getChildById('1').getType()).toBe('Group');
                var child = group.getChildById('1');
                child.delete();
                child = group.getChildById('1');
                expect(angular.isDefined(child)).toBe(false);
                done();
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });
    
    it('should select child group', function (done) {
        var group;
        var model = {
                type: 'div',
                children:[{
                    type: 'Group',
                    id: '1'
                },{
                    type: 'h2',
                    id: '2'
                },{
                    type: 'h3',
                    id: '3'
                }]
        };
        $widget.compile(model)
        .then(function(widget){
            group = widget;
            function runTest(){
                expect(group.getChildById('1').getType()).toBe('Group');
                var child = group.getChildById('1');
                
                child.setSelected(true);
                expect(child.isSelected()).toBe(true);
                
                child.setSelected(false);
                expect(child.isSelected()).toBe(false);
                done();
            }
            group.on('stateChanged', function(){
                if(group.state == 'ready'){
                    runTest();
                }
            });
            if(group.state == 'ready'){
                runTest();
            }
        })
        $rootScope.$apply();
    });

});
