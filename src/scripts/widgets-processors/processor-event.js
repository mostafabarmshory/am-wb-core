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

angular.module('am-wb-core')//

/**
 * @ngdoc Processor
 * @name WbProcessorEvent
 * @description Widget processor
 * 
 */
.factory('WbProcessorEvent', function (WbProcessorAbstract, $http, $mdMedia, $wbWindow,
        $wbLocal, $timeout, $dispatcher, $storage, $routeParams) {
    'use strict';
    

    /*
     * Simulates $timeout for widgets
     */
    function createTimeoutService(widget){
        if(!angular.isArray(widget.__timeoutPromise)){
            widget.__timeoutPromise = [];
        }

        function remove(promise){
            if(!widget.__timeoutPromise){
                return;
            }
            var index = widget.__timeoutPromise.indexOf(promise);
            if (index > -1) {
                widget.__timeoutPromise.splice(index, 1);
            }
        }
    
        var timeoutService = function (fn, delay, invokeApply, Pass){
            var promise = $timeout(fn,delay,invokeApply, Pass);
            promise.finally(function(){
                remove(promise);
            });
            widget.__timeoutPromise.push(promise);
        };
        
        /*
         * cancel job
         */
        timeoutService.cancel = function(promise){
            remove(promise);
            $timeout.cancel(promise);
        }
        /*
         * remove all jobs
         */
        timeoutService.distroy = function(){
            var ctrl = this;
            angular.forEach(widget.__timeoutPromise, function(promise){
                ctrl.cancel(promise);
            });
            delete widget.__timeoutPromise;
        };
        
        
        return timeoutService;
    }

    /**
     * Loads events for the widget
     * 
     * @param event
     *            {object} part of the widget data model
     * @memberof WbAbstractWidget
     */
    function evalWidgetEvent(widget, type, event) {
        var eventFunction;
        if (!widget.eventFunctions.hasOwnProperty(type)) {
            try{
                var ucode = widget.getEvent()[type];
                if(!ucode){
                    return;
                }
                var body = '\'use strict\';\n'+
                'var $event = arguments[0],' + 
                '$widget = arguments[1],' + 
                '$http = arguments[2],' + 
                '$media =  arguments[3],' + 
                '$window =  arguments[4],' + 
                '$local =  arguments[5],' + 
                '$timeout = arguments[6],' + 
                '$dispatcher = arguments[7],' + 
                '$storage = arguments[8],' + 
                '$routeParams = arguments[9];\n' + ucode;
                widget.eventFunctions[type] = new Function(body);
            }catch(ex){
                console.log(ex);
            }
        }
        eventFunction = widget.eventFunctions[type];
        if (eventFunction) {
            try{
                // check timeout service of widget
                if(!widget.__$timeoutSeervice) {
                    widget.__$timeoutSeervice = createTimeoutService(widget);
                }
                return eventFunction.apply(widget, [
                    event, // -> $event
                    widget, // -> $widget
                    $http, // -> $http
                    $mdMedia, // -> $mdMedia
                    $wbWindow, // -> $wbWindow
                    $wbLocal, // -> $wbLocal
                    // FIXME: wratp timeout and remove timers on edit mode (or distroy)
                    widget.__$timeoutSeervice,// -> $timeout
                    // FIXME: wratp dispatcher and remove listeners
                    $dispatcher, // -> $dispatcher
                    $storage, // -> $storage
                    $routeParams// -> $routeParams
                    ]);
            } catch(ex){
                console.log('Fail to run event code');
                console.log({
                    type: type,
                    event: event
                });
                console.log(ex);
            }
        }
    };

    function loadWidgetEventsHandlers(widget){
        widget.__eventListeners = {
                click: function ($event) {
                    return evalWidgetEvent(widget, 'click', $event);
                },
                dblclick: function ($event) {
                    return evalWidgetEvent(widget, 'dblclick', $event);
                },
                mouseout: function ($event) {
                    return evalWidgetEvent(widget, 'mouseout', $event);
                },
                mouseover: function ($event) {
                    return evalWidgetEvent(widget, 'mouseover', $event);
                },
                mousedown: function ($event) {
                    return evalWidgetEvent(widget, 'mousedown', $event);
                },
                mouseup: function ($event) {
                    return evalWidgetEvent(widget, 'mouseup', $event);
                },
                mouseenter: function ($event) {
                    return evalWidgetEvent(widget, 'mouseenter', $event);
                },
                mouseleave: function ($event) {
                    return evalWidgetEvent(widget, 'mouseleave', $event);
                },
                resize: function ($event) {
                    return evalWidgetEvent(widget, 'resize', $event);
                },
                intersection: function ($event) {
                    return evalWidgetEvent(widget, 'intersection', $event);
                },
                
                //
                // Common media events
                //
                success: function ($event) {
                    return evalWidgetEvent(widget, 'success', $event);
                },
                error: function ($event) {
                    return evalWidgetEvent(widget, 'error', $event);
                },
                abort: function ($event) {
                    return evalWidgetEvent(widget, 'abort', $event);
                },
                load: function ($event) {
                    return evalWidgetEvent(widget, 'load', $event);
                },
                beforeunload: function ($event) {
                    return evalWidgetEvent(widget, 'beforeunload', $event);
                },
                unload: function ($event) {
                    return evalWidgetEvent(widget, 'unload', $event);
                },
                
                
        };
        angular.forEach(widget.__eventListeners, function (listener, key) {
            widget.on(key, listener);
        });
    }

    function removeWidgetEventsHandlers(widget){
        if(angular.isDefined(widget.__eventListeners)){
            angular.forEach(widget.__eventListeners, function (listener, key) {
                widget.off(key, listener);
            });
            delete widget.__eventListeners;
        }
        // remove timeout service
        if(widget.__$timeoutSeervice) {
            widget.__$timeoutSeervice.distroy();
            delete widget.__$timeoutSeervice;
        }
    }

    function Processor(){
        WbProcessorAbstract.apply(this);
    };

    // extend functionality
    Processor.prototype = new WbProcessorAbstract();
    
    Processor.prototype.process = function (widget, event){
        if(event.type !== 'stateChanged') {
            return;
        }
        if(widget.state === 'ready') {
            loadWidgetEventsHandlers(widget);
            evalWidgetEvent(widget, 'stateChanged', event);
            // TODO: maso, 2019: remove in next major version
            // support legecy
            var newEvent = _.clone(event);
            newEvent.type = 'init';
            evalWidgetEvent(widget, newEvent.type, newEvent);
        } else {
            removeWidgetEventsHandlers(widget);
        }
    };
    
    return Processor;
});
