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
        this.enable = false;
        this.listeners = {
                'selectionChange':[]
        };
        
        this.clickListener = function(event){
            if (this.enable) {
                var ctrl = event.source();
                ctrl.setSelected(true, $event);
                $event.stopPropagation();
                $event.preventDefault();
            }
        }
        
        this.dblclickListener = function(event){
            if (this.enable) {
                var ctrl = event.source();
                ctrl.setSelected(true, $event);
                $event.stopPropagation();
                $event.preventDefault();
                // Open an editor 
                var editor = $widget.getEditor(ctrl);
                editor.show();
            }
        }
        

        
//        if (this.isRoot()) {
//            delete this.lastSelectedItem;
//            this.setSelected(true);
//        }
        
        // on:unselect
//        var editor = $widget.getEditor(this);
//        editor.hide();
        

//        /**
//         * Check if the widget is selected
//         */
//        WbWidgetGroupCtrl.prototype.isChildSelected = function (widget) {
//            if (this.isRoot()) {
//                return _.indexOf(this.lastSelectedItems, widget) > -1;
//            }
//            return this.getParent().isChildSelected(widget);
//        };
//        
//
//        WbWidgetGroupCtrl.prototype.childSelected = function (ctrl, $event) {
//            if (!this.isRoot()) {
//                return this.getRoot().childSelected(ctrl, $event);
//            }
//            $event = $event || {};
//            if (!$event.shiftKey) {
//                this.selectionLock = true;
//                angular.forEach(this.lastSelectedItems, function (widget) {
//                    widget.setSelected(false);
//                });
//                this.selectionLock = false;
//                this.lastSelectedItems = [];
//            }
//
//            if (this.lastSelectedItems.indexOf(ctrl) >= 0) {
//                return;
//            }
//
//            this.lastSelectedItems.push(ctrl);
//
//            // maso, 2018: call the parent controller function
//            this.fire('select', {
//                widgets: this.lastSelectedItems
//            });
//        };
//
//        WbWidgetGroupCtrl.prototype.childUnSelected = function(widget, $event){
//            if (!this.isRoot()) {
//                return this.getRoot().childSelected(widget, $event);
//            }
//            if(this.selectionLock){
//                return;
//            }
//            $event = $event || {};
//            var index = this.lastSelectedItems.indexOf(widget);
//            if(index < 0)  {
//                return;
//            }
//            this.lastSelectedItems.splice(index, 1);
//            // maso, 2018: call the parent controller function
//            this.fire('select', {
//                widgets: this.lastSelectedItems
//            });
//        };

    };
    Processor.prototype = new WbProcessorAbstract();
    Processor.prototype.process = function(widget, event){};
    
    Processor.prototype.setEnable = function(enable){
        this.enable = enable;
    };
    
    Processor.prototype.getSelectedWidgets = function(){
        return this.selectedWidgets || [];
    };
    
    Processor.prototype.on = function(event, callback){
        this.listeners[event].push(callback);
    };
    Processor.prototype.off = function(event, callback){
//        this.onSelection.push(callback);
    };
    return Processor;
});
