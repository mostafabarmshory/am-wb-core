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
 * @name WbProcessorSelect
 * @description Widget processor
 * 
 */
.factory('WbProcessorSelect', function ($widget, WbProcessorAbstract) {
    'use strict';

    function Processor(){
        WbProcessorAbstract.apply(this);
        this.selectedWidgets = [];
        this.callbacks = {
                'selectionChange':[]
        };

        var ctrl = this;
        this.clickListener = function($event){
            try{
                ctrl.lock = true;
                var widget = $event.source;

                widget.setSelected(true);
                if($event.shiftKey){
                    ctrl.selectedWidgets.push(widget);
                } else {
                    _.forEach(ctrl.selectedWidgets, function(widget){
                        widget.setSelected(false);
                    });
                    ctrl.selectedWidgets = [widget];
                }
                $event.stopPropagation();
                $event.preventDefault();

                $event.widgets = ctrl.selectedWidgets;
                ctrl.fire('selectionChange', $event);
            } finally {
                delete ctrl.lock;
            }
        };

        this.dblclickListener = function($event){
            try{
                ctrl.lock = true;
                var widget = $event.source;

                widget.setSelected(true, $event);
                $event.stopPropagation();
                $event.preventDefault();

                // clear selection
                _.forEach(ctrl.selectedWidgets, function(widget){
                    widget.setSelected(false);
                });
                ctrl.selectedWidgets = [widget];

                // Open an editor 
                var editor = $widget.getEditor(widget);
                editor.show();

                $event.widgets = ctrl.selectedWidgets;
                ctrl.fire('selectionChange', $event);
            } finally {
                delete ctrl.lock;
            }
        };

        this.selectionListener = function($event){
            if(ctrl.lock){
                return;
            }
            var widget = $event.source;

            // clear selection
            // TODO: maso, 2019: check if shift key is hold
            _.forEach(ctrl.selectedWidgets, function(widget){
                widget.setSelected(false);
            });
            ctrl.selectedWidgets = [widget];

            $event.widgets = ctrl.selectedWidgets;
            ctrl.fire('selectionChange', $event);
        };
    }
    Processor.prototype = new WbProcessorAbstract();
    Processor.prototype.process = function(widget, event){
        if(event.type !== 'stateChanged') {
            return;
        }
        if(widget.state === 'edit') {
            widget.on('click', this.clickListener);
            widget.on('dblclick', this.dblclickListener);
            widget.on('select', this.selectionListener);
        } else {
            widget.off('click', this.clickListener);
            widget.off('dblclick', this.dblclickListener);
            widget.off('select', this.selectionListener);
        }
    };

    Processor.prototype.getSelectedWidgets = function(){
        return this.selectedWidgets || [];
    };

    Processor.prototype.on = function(event, callback){
        this.callbacks[event].push(callback);
    };

    Processor.prototype.off = function(event, callback){
        var index = this.callbacks[event].indexOf(callback);
        if(index > -1){
            this.callbacks[event].slice(index, 1);
        }
    };

    Processor.prototype.fire = function (type, params) {
        params = params || {};

        // 1- Call processors
        var event = _.merge({
            source: this,
            type: type
        }, params || {});

        // 2- call listeners
        if (!angular.isDefined(this.callbacks[type])) {
            return;
        }
        var callbacks = this.callbacks[type];
        var resultData = null;
        for(var i = 0; i < callbacks.length; i++){
            // TODO: maso, 2018: check if the event is stopped to propagate
            try {
                resultData = callbacks[i](event) || resultData;
            } catch (error) {
                // NOTE: remove on release
//              console.log(error);
            }
        }
        return resultData;
    };


    /**
     * Enable the processor
     */
    Processor.prototype.setEnable = function(enable){
        this.enable = enable;
    };

    return Processor;
});
