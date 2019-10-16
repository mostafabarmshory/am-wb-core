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


//submit the controller
angular.module('am-wb-core')//
/**
 * @ngdoc Controllers
 * @name WbWidgetGroupCtrl
 * @description Manages a group widget
 * 
 * This is a group controller
 * 
 * @ngInject
 */
.controller('WbWidgetGroupCtrl', function($scope, $element, $wbUtil, $widget, $q, $parent, $controller){

    // extend the controller
    angular.extend(this, $controller('WbWidgetAbstractCtrl', {
        $scope: $scope,
        $element: $element,
        $parent: $parent
    }));


    /**
     * Set model to a group
     * 
     * Setting model to a group is differs from setting in widget. In group 
     * we try to load children and finally loading the group itself.
     * 
     * @memberof WbWidgetGroupCtrl
     * @param model Object to set into the group
     */
    this.setModel = function (model) {
        this.setState('init');
        if (model === this.wbModel) {
            return;
        }
        this.wbModel = model;
        this.fire('modelChanged');

        var ctrl = this;
        this.loadWidgets(model)
        .finally(function () {
            ctrl.fire('loaded');
            ctrl.reload();
            ctrl.setState('ready');
        })
    };

    /**
     * Check if the widget is selected
     */
    this.isChildSelected = function (widget) {
        if (this.isRoot()) {
            return widget === this.lastSelectedItem;
        }
        return this.getParent().isChildSelected(widget);
    };

    this.getChildById = function (id) {
        var widgets = this.childWidgets;
        for (var i = 0; i < widgets.length; i++) {
            if (widgets[i].getId() === id) {
                return widgets[i];
            }
        }
    };

    /**
     * Gets all children of the group
     * 
     * @return list of all widgets
     */
    this.getChildren = function () {
        return this.childWidgets;
    };

    this.loadWidgets = function (model) {
        // destroy all children
        angular.forEach(this.childWidgets, function (widget) {
            widget.destroy();
        });
        this.childWidgets = [];

        // check for new contents
        if (!model || !angular.isArray(model.contents)) {
            return $q.resolve();
        }

        // create contents
        var parentWidget = this;

        var compilesJob = [];
        model.contents.forEach(function (item, index) {
            var job = $widget.compile(item, parentWidget)//
            .then(function (widget) {
                parentWidget.childWidgets[index] = widget;
            });
            compilesJob.push(job);
        });

        var ctrl = this;
        return $q.all(compilesJob)//
        .then(function () {
            var $element = parentWidget.getElement();
            parentWidget.childWidgets.forEach(function (widget) {
                widget.setEditable(ctrl.isEditable());
                $element.append(widget.getElement());
            });
        });
    };



    this.childSelected = function (ctrl, $event) {
        if (!this.isRoot()) {
            return this.getRoot().childSelected(ctrl, $event);
        }
        $event = $event || {};
        if (!$event.shiftKey) {
            this.selectionLock = true;
            angular.forEach(this.lastSelectedItems, function (widget) {
                widget.setSelected(false);
            });
            this.selectionLock = false;
            this.lastSelectedItems = [];
        }

        if (this.lastSelectedItems.indexOf(ctrl) >= 0) {
            return;
        }

        this.lastSelectedItems.push(ctrl);

        // maso, 2018: call the parent controller function
        this.fire('select', {
            widgets: this.lastSelectedItems
        });
    };

    this.childUnSelected = function(widget, $event){
        if (!this.isRoot()) {
            return this.getRoot().childSelected(widget, $event);
        }
        if(this.selectionLock){
            return;
        }
        $event = $event || {};
        var index = this.lastSelectedItems.indexOf(widget);
        if(index < 0)  {
            return;
        }
        this.lastSelectedItems.splice(index, 1);
        // maso, 2018: call the parent controller function
        this.fire('select', {
            widgets: this.lastSelectedItems
        });
    };

    /**
     * Removes a widget
     * 
     * Data model and visual element related to the input model will be removed.
     */
    this.removeChild = function (widget) {
        var index = this.indexOfChild(widget);

        if (index > -1) {
            // remove selection
            if (widget.isSelected()) {
                widget.setSelected(false);
            }
            // remove model
            this.childWidgets.splice(index, 1);

            var model = this.getModel();
            index = model.contents.indexOf(widget.getModel());
            model.contents.splice(index, 1);

            // destroy widget
            widget.destroy();
        }
        return false;
    };

    /**
     * Adds dragged widget
     */
    this.addChild = function (index, item) {
        var model = this.getModel();
        var ctrl = this;

        // add widget
        item = $wbUtil.clean(item);
        $widget.compile(item, this)//
        .then(function (newWidget) {
            if (index < ctrl.childWidgets.length) {
                newWidget.getElement().insertBefore(ctrl.childWidgets[index].getElement());
            } else {
                ctrl.getElement().append(newWidget.getElement());
            }
            model.contents.splice(index, 0, item);
            ctrl.childWidgets.splice(index, 0, newWidget);

            // init the widget
            newWidget.setEditable(ctrl.isEditable());
            ctrl.fire('newchild', {
                widget: newWidget
            });
        });
        // TODO: replace with promise
        return true;
    };

    /**
     * Finds index of child element
     */
    this.moveChild = function (widget, index) {

        function arraymove(arr, fromIndex, toIndex) {
            var element = arr[fromIndex];
            arr.splice(fromIndex, 1);
            arr.splice(toIndex, 0, element);
        }

        if (index < 0 || index > this.getChildren().length - 1 || this.getChildren().length === 1) {
            return;
        }
        if (this.getModel().contents.indexOf(widget.getModel()) === index) {
            return;
        }
        var positionWidget = this.getChildren()[index];
        // move element
        if (this.getModel().contents.indexOf(widget.getModel()) < index) {
            positionWidget.getElement().after(widget.getElement());
        } else {
            positionWidget.getElement().before(widget.getElement());
        }

        // move model
        arraymove(this.getModel().contents, this.getModel().contents.indexOf(widget.getModel()), index);

        // move controller
        arraymove(this.getChildren(), this.indexOfChild(widget), index);
    };

    /**
     * Finds index of child element
     */
    this.indexOfChild = function (widget) {
        if (!this.childWidgets || !this.childWidgets.length) {
            return -1;
        }
        return this.childWidgets.indexOf(widget);
    };


    /**
     * Delete the widget
     * 
     * This function just used in edit mode
     * 
     * @memberof WbWidgetGroupCtrl
     */
    this.delete = function () {
        // remove all children
        var widgets = this.getChildren();
        angular.forEach(widgets, function (widget) {
            widget.delete();
        });

        // remove itself
        this.fire('delete');
        if (!this.isRoot()) {
            this.getParent()
            .removeChild(this);
        }
    };

    /**
     * List of allowed child
     * 
     * @memeberof WbWidgetGroupCtrl
     */
    this.getAllowedTypes = function () {
        if (!this.isRoot()) {
            return this.getParent().getAllowedTypes();
        }
        return this.allowedTypes;
    };

    this.setAllowedTypes = function (allowedTypes) {
        return this.allowedTypes = allowedTypes;
    };

});

