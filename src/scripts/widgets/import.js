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
 * @ngdoc Widgets
 * @name import
 * @description Manage a widget
 */
.factory('WbWidgetSeenImport', function (WbWidgetGroup, $wbUtil, $q) {
    'use strict';

    /*
     * Load data from the widget URL
     */
    function loadLinks(paths) {

        var jobs = [];
        var models = Array(paths.length);
        _.forEach(paths, function(path, index){
            // check parts
            var parts = path.split('#');
            var url = parts[0];
            var id = parts.length > 1 ? parts[1] : undefined;
            var job = $wbUtil.downloadWidgetModel(url, id)
            .then(function (model) {
                models[index] = model;
            });
            jobs.push(job);
        });

        function clean(){
            return _.remove(models, function(model) {
                return !_.isUndefined(model);
            });
        }
        // TODO: maso, 2019: some models are faild
        return $q.all(jobs)
        .then(clean,clean);
    }

    //-------------------------------------------------------------
    // Widget
    //-------------------------------------------------------------
    function Widget($scope, $element, $parent){
        WbWidgetGroup.apply(this, [$scope, $element, $parent]);
        this.setAllowedTypes();
        this.addElementAttributes('url');

        // load widget
        var ctrl = this;
        function checkAndUpdateUrl($event) {
            if ($event.key === 'url') {
                ctrl.reload();
            }
        }
        this.on('modelUpdated', checkAndUpdateUrl);
        this.on('runtimeModelUpdated', checkAndUpdateUrl);
        this.on('modelChanged', function () {
            ctrl.reload();
        });
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);

    Widget.prototype.reload = function (){
        // check if the url
        var ctrl = this;
        ctrl.removeChildren();
        ctrl.getModel().children = [];
        var path = this.getProperty('url') || this.getModelProperty('url') || '';
        path = path.trim();
        var prom;
        if(!path){
            prom = $q.resolve([]);
        } else {
            this.paths = path.split(',');
            prom = loadLinks(this.paths)//
            .then(function (children) {
                return ctrl.fire('success', {
                    children: children
                }) || children;
            });
        }

        return prom.then(function(children){
            return ctrl.addChildrenModel(0, children)
            .finally(function(){
                ctrl.fire('load', {
                    children: children
                }) || children;
            });
        });
    };

    /**
     * set acceptable widgets
     * 
     * $widget.setAcceptableChild('a', 'b');
     * 
     * @memberof WbWidgetGroupCtrl
     */
    Widget.prototype.setAllowedTypes = function () {
        this.allowedTypes = [];
    };


    /**
     * Set edit mode
     * 
     * 
     * @memberof WbAbstractWidget
     */
    Widget.prototype.setEditable = function (editable) {
        WbWidgetGroup.prototype.setEditable.apply(this, arguments);
        // propagate to child
        var children = this.getChildren();
        while(!_.isEmpty(children)){
            var widget = children.pop();
            widget.setSilent(editable);
            if(!widget.isLeaf()){
               children = children.concat(widget.getChildren());
            }
        }
    };
    

    Widget.prototype.isLeaf = function(){
        return true;
    };

    return Widget;
});