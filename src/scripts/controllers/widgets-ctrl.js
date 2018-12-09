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

var WbAbstractWidget = function () {
    this.actions = [];
    this.callbacks = [];
    this.childWidgets = [];
    this.$scope = null;
    this.$element = null;

    /*
     * Update view based on new model
     */
    function updateView($event) {
        var ctrl = $event.source;
        var model = ctrl.getModel();
        var $element = ctrl.getElement();

        // to support old widget
        ctrl.getScope().wbModel = model;

        // update style
        if (model) {
            ctrl.loadStyle(model.style);
            ctrl.loadEvents(model.event);
        }
    }

    this.on('modelChanged', updateView);
    this.on('modelUpdate', updateView);
};

WbAbstractWidget.prototype.loadStyle = function (style) {
    var cssStyle = this.$wbUtil.convertToWidgetCss(style || {});
    this.$element.css(cssStyle);
};

WbAbstractWidget.prototype.loadEvents = function (event) {
    var ctrl = this;
    var $element = this.getElement();
    if (!angular.isDefined(event)) {
        return;
    }
    var eventFuncs = {};

    if (event.onClick) {
        var body = '\'use strict\'; var $event = arguments[0]; var $widget = arguments[1];' + event.onClick;
        eventFuncs.onClick = new Function(body);
    }

    $element.on('click', function (event) {
        if (ctrl.isEditable()) {
            return;
        }
        if (eventFuncs.onClick) {
            eventFuncs.onClick(event, ctrl);
        }
    });
};

WbAbstractWidget.prototype.destroy = function () {
    // remove callbacks
    this.callbacks = [];
    this.actions = [];

    // destroy children
    angular.forEach(this.childWidgets, function (widget) {
        widget.destroy();
    });
    this.childWidgets = [];

    // destroy view
    this.$element.remove();
    this.$element = null;

    // remove scope
    this.$scope.$destroy();
    this.$scope = null;
};

WbAbstractWidget.prototype.setElement = function ($element) {
    this.$element = $element;
};

WbAbstractWidget.prototype.getElement = function () {
    return this.$element;
};

WbAbstractWidget.prototype.fire = function (type, params) {
    if (!angular.isDefined(this.callbacks[type])) {
        return;
    }
    // create event
    var event = _.merge({}, params || {});
    event.source = this;
    event.type = type;

    // fire
    var callbacks = this.callbacks[type];
    angular.forEach(callbacks, function (callback) {
        try {
            callback(event);
            // TODO: check propagations
        } catch (error) {
            // NOTE: remove on release
            console.log(error);
        }
    });
};

/**
 * Adds new callback of type
 */
WbAbstractWidget.prototype.on = function (type, callback) {
    if (!angular.isArray(this.callbacks[type])) {
        this.callbacks[type] = [];
    }
    this.callbacks[type].push(callback);
};


/**
 * Clone current widget
 * 
 * This method works in edit mode only.
 */
WbAbstractWidget.prototype.clone = function () {
    var index = this.getParent().indexOfChild(this);
    this.getParent()//
        .addChild(index, angular.copy(this.getModel()));
};

WbAbstractWidget.prototype.getModel = function () {
    return this.wbModel;
};

WbAbstractWidget.prototype.setModel = function (model) {
    if (model === this.wbModel) {
        return;
    }
    this.wbModel = model;
    this.fire('modelChanged');
};

/**
 * Get parent widget
 * 
 * Parent widget is called container in this model. It is attached dynamically
 * on the render phease.
 */
WbAbstractWidget.prototype.getParent = function () {
    return this.parent;
};

WbAbstractWidget.prototype.setParent = function (widget) {
    return this.parent = widget;
};

WbAbstractWidget.prototype.setScope = function ($scope) {
    this.$scope = $scope;
};
WbAbstractWidget.prototype.getScope = function () {
    return this.$scope;
};

WbAbstractWidget.prototype.setUnderCursor = function (widget) {
    if(!this.isRoot()){
        this.getParent().setUnderCursor(widget);
    }
    if(this._widgetUnderCursor === widget){
        return;
    }
    this._widgetUnderCursor = widget;
    this.fire('widgetUnderCursor', {
        widget: this._widgetUnderCursor 
    });
};

WbAbstractWidget.prototype.isEditable = function () {
    return this.editable;
};

WbAbstractWidget.prototype.setEditable = function (editable) {
    if (this.editable === editable) {
        return;
    }
    this.editable = editable;
    var $element = this.getElement();
    if (this.isRoot()) {
        delete this.lastSelectedItem;
        this.setSelected(true);
    }
    if (editable) {
        // Lesson on click
        var ctrl = this;
        this.widgetSelectHandler = function (event) {
            ctrl.setSelected(true);
            event.stopPropagation();
        }
        this.widgetMouseEnterHandler = function(event) {
            if(event.sourceWidget) {
                return;
            }
            event.sourceWidget = ctrl;
            ctrl.setUnderCursor(ctrl);
            return false;
        }
        $element.on('click', this.widgetSelectHandler);
        $element.on('mousemove', this.widgetMouseEnterHandler);
        // TODO: remove watch for model update and fire in setting
        this._modelWatche = this.getScope().$watch('wbModel', function(){
            ctrl.fire('modelUpdate');
        }, true);
    } else {
        // remove selection handler
        $element.off('click', this.widgetSelectHandler);
        $element.off('mousemove', this.widgetMouseEnterHandler);
        delete this.widgetSelectHandler;
        if(this._modelWatche){
            this._modelWatche();
            delete this._modelWatche;
        }
    }
    // propagate to child
    angular.forEach(this.childWidgets, function (widget) {
        widget.setEditable(editable);
    });
};

/**
 * Delete the widget
 * 
 * This function just used in edit mode
 */
WbAbstractWidget.prototype.delete = function () {
    this.fire('delete');
    this.getParent() //
    .removeChild(this);
};


/**
 * Checks if the widget is root
 * 
 * If there is no parent controller then this is a root one.
 */
WbAbstractWidget.prototype.isRoot = function () {
    var parent = this.getParent();
    return angular.isUndefined(parent) || parent == null;
};

WbAbstractWidget.prototype.isSelected = function () {
    if (this.isRoot()) {
        return false;
    }
    return this.getParent().isChildSelected(this);
};

WbAbstractWidget.prototype.setSelected = function (flag) {
    if (this.isRoot()) {
        return;
    }
    this.getParent().childSelected(this);
};

/**
 * Add new action in actions list
 * 
 * @memberof WbWidgetCtrl
 */
WbAbstractWidget.prototype.addAction = function (action) {
    this.actions.push(action);
};

/**
 * Gets widget actions
 */
WbAbstractWidget.prototype.getActions = function () {
    return this.actions;
};


/**
 * @ngdoc Controllers
 * @name wbWidgetCtrl
 * @description Controller of a widget
 * 
 * 
 * @ngInject
 */
var WbWidgetCtrl = function ($scope, $element, $wbUtil) {
    WbAbstractWidget.call(this);
    this.setElement($element);
    this.setScope($scope);
    this.$wbUtil = $wbUtil;

    var ctrl = this;

    // delete action
    this.addAction({
        title: 'Delete',
        icon: 'delete',
        action: function () {
            ctrl.delete();
        },
        description: 'Delete widget (Delete)'
    });

    // add child action
    this.addAction({
        title: 'Clone',
        icon: 'content_copy',
        action: function () {
            ctrl.clone();
        },
        description: 'Duplicate widget (ctrl+D)'
    });
};
WbWidgetCtrl.prototype = new WbAbstractWidget();


/**
 * @ngdoc Controllers
 * @name WbWidgetGroupCtrl
 * @description Manages a group widget
 * 
 * This is a group controller
 * 
 * @ngInject
 */
var WbWidgetGroupCtrl = function ($scope, $element, $wbUtil, $parse, $controller, $widget, $mdTheming, $q) {
    WbAbstractWidget.call(this);
    this.setElement($element);
    this.setScope($scope);
    
    this.$widget = $widget;
    this.$q = $q;
    this.$mdTheming = $mdTheming;
    this.$wbUtil = $wbUtil;

    var ctrl = this;
    this.on('modelChanged', function () {
        ctrl.loadWidgets(ctrl.getModel());
    });

    // delete action
    this.addAction({
        title: 'Delete',
        icon: 'delete',
        action: function () {
            ctrl.delete();
        },
        description: 'Delete widget (Delete)'
    });

    // add child action
    this.addAction({
        title: 'Clone',
        icon: 'content_copy',
        action: function () {
            ctrl.clone();
        },
        description: 'Duplicate widget (ctrl+D)'
    });
};
WbWidgetGroupCtrl.prototype = new WbAbstractWidget();

/**
 * Check if the widget is selected
 */
WbWidgetGroupCtrl.prototype.isChildSelected = function (widget) {
    if (this.isRoot()) {
        return widget === this.lastSelectedItem;
    }
    return this.getParent().isChildSelected(widget);
};

WbWidgetGroupCtrl.prototype.loadWidgets = function (model) {
    // destroy all children
    angular.forEach(this.childWidgets, function (widget) {
        widget.destroy();
    });
    this.childWidgets = [];

    // check for new contents
    if (!model || !angular.isArray(model.contents)) {
        return;
    }

    // create contents
    var $widget = this.$widget;
    var $mdTheming = this.$mdTheming;
    var parentWidget = this;
    var $q = this.$q;

    var compilesJob = [];
    model.contents.forEach(function (item, index) {
        var job = $widget.compile(item, parentWidget)//
        .then(function (widget) {
            parentWidget.childWidgets[index] = widget;
        });
        compilesJob.push(job);
    });

    return $q.all(compilesJob)//
    .then(function () {
        var $element = parentWidget.getElement();
        parentWidget.childWidgets.forEach(function (widget) {
            $element.append(widget.getElement());
        });
    });
};



WbWidgetGroupCtrl.prototype.childSelected = function (ctrl) {
    if (!this.isRoot()) {
        return this.getParent().childSelected(ctrl);
    }
    if (ctrl === this.lastSelectedItem) {
        return;
    }
    this.lastSelectedItem = ctrl;
    // maso, 2018: call the parent controller function
    this.fire('widgetSelected', {
        widgets: ctrl? [ctrl] : []
    });
};

/**
 * Removes a widget
 * 
 * Data model and visual element related to the input model will be removed.
 */
WbWidgetGroupCtrl.prototype.removeChild = function (widget) {
    var index = this.indexOfChild(widget);
    
    if (index > -1) {
        // remove selection
        if (this.isChildSelected(widget)) {
            this.childSelected(null);
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
WbWidgetGroupCtrl.prototype.addChild = function (index, item) {
    var model = this.getModel();
    var ctrl = this;

    // add widget
    this.$widget.compile(item, this)//
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
    });
    // TODO: replace with promise
    return true;
};

/**
 * Finds index of child element
 */
WbWidgetGroupCtrl.prototype.indexOfChild = function (widget) {
    if (!this.childWidgets || !this.childWidgets.length) {
        return -1;
    }
    return this.childWidgets.indexOf(widget);
};

/**
 * List of allowed child
 * 
 * @memeberof WbWidgetGroupCtrl
 */
WbWidgetGroupCtrl.prototype.getAllowedTypes = function () {
    if(!this.isRoot()){
        return this.getParent().getAllowedTypes();
    }
    return this.allowedTypes;
};

WbWidgetGroupCtrl.prototype.setAllowedTypes = function (allowedTypes) {
    return this.allowedTypes = allowedTypes;
};






//submit the controller
angular.module('am-wb-core')//
    .controller('WbWidgetCtrl', WbWidgetCtrl)//
    .controller('WbWidgetGroupCtrl', WbWidgetGroupCtrl);

