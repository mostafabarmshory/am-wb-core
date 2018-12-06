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

var WbAbstractWidget = function(){
    this.actions = [];
    this.callbacks = [];
    this.$scope = null;
    this.$element = null;
}

WbAbstractWidget.prototype.setElement = function($element) {
    this.$element = $element;
}

WbAbstractWidget.prototype.getElement = function() {
    return this.$element;
}

WbAbstractWidget.prototype.fire = function(type){
    if(angular.isDefined(this.callbacks[type])){
        for(var i = 0; i < this.callbacks[type].length; i++){
            try{
                this.callbacks[type][i]();
            } catch (error){
                console.log(error);
            }
        }
    }
};

/**
 * Adds new callback of type
 */
WbAbstractWidget.prototype.on = function(type, callback){
    if(!angular.isArray(this.callbacks[type])){
        this.callbacks[type] = [];
    }
    this.callbacks[type].push(callback);
};


/**
 * Clone current widget
 * 
 * This method works in edit mode only.
 */
WbAbstractWidget.prototype.clone = function(){
    if(!this.isEditable()){
        return;
    }
    return angular.copy(this.getModel());
};

WbAbstractWidget.prototype.getModel = function(){
    return this.wbModel;
};

WbAbstractWidget.prototype.setModel = function(model){
    if(model === this.wbModel) {
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
WbAbstractWidget.prototype.getParent = function(){
    return this.$scope.container;
};

WbAbstractWidget.prototype.isEditable = function(){
    if(this.isRoot()){
        return this.$scope.editable;
    }
    return this.getParent().isEditable();
};

WbAbstractWidget.prototype.setScope = function($scope){
    this.$scope = $scope;
};
WbAbstractWidget.prototype.getScope = function(){
    return this.$scope;
};

WbAbstractWidget.prototype.setEditable = function(editable){
    this.$scope.editable = editable;
    if(editable){
        if(this.isRoot()) {
            delete this.lastSelectedItem;
            this.setSelected(true);
        }
    } else {
        this.childSelected(null);
    }
};

/**
 * Delete the widget
 * 
 * This function just used in edit mode
 */
WbAbstractWidget.prototype.delete = function(){
    if(!this.isEditable()){
        return;
    }
    this.fire('delete');
    this.getParent() //
    .removeChild(this.getModel(), this);
    // Make a promise to remove
// .then(function(){
// ctrl.fire('delete');
// ctrl.distroy();
// });
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

WbAbstractWidget.prototype.isSelected = function(){
    if(this.isRoot()){
        return false;
    }
    return this.getParent().isChildSelected(this);
};

WbAbstractWidget.prototype.setSelected = function(flag) {
    if(this.isRoot()) {
        return;
    }
    this.getParent().childSelected(this);
};

/**
 * Add new action in actions list
 * 
 * @memberof WbWidgetCtrl
 */
WbAbstractWidget.prototype.addAction = function(action){
    this.actions.push(action);
};

/**
 * Gets widget actions
 */
WbAbstractWidget.prototype.getActions = function(){
    return this.actions;
};

/**
 * Gets widget actions
 */
WbAbstractWidget.prototype.addOnModelSelectCallback = function(callback){
    // TODO: maso, 2018: add to a list of callback
    this.onModelSelectCallback  = callback; 
};




/**
 * @ngdoc Controllers
 * @name wbWidgetCtrl
 * @description Controller of a widget
 * 
 * 
 * @ngInject
 */
var WbWidgetCtrl = function($scope, $element, $wbUtil, $parse) {
    WbAbstractWidget.call(this);
    this.setElement($element);
    this.setScope($scope);


    // Support selection function
    if($scope.wbOnModelSelect) {
        this.addOnModelSelectCallback($parse($scope.wbOnModelSelect));
    }

    var ctrl = this;

    // delete action
    this.actions.push({
        title: 'Delete',
        icon: 'delete',
        action: function(){
            ctrl.delete();
        },
        description: 'Delete widget (Delete)'
    });

    // add child action
    this.actions.push({
        title: 'Clone',
        icon: 'content_copy',
        action: function(){
            var model = $wbUtil.clean(angular.copy($scope.wbModel));
            var index = $scope.group.indexOfChild($scope.wbModel);
            $scope.group.addChild(index, model);
        },
        description: 'Duplicate widget (ctrl+D)'
    });

    $scope.$watch('wbModel', function(model){
        ctrl.setModel(model);
    });

    // TODO: maso, 2018: watch style (only in edit mod)
    $scope.$watch('wbModel.style', function(style){
        var cssStyle = $wbUtil.convertToWidgetCss(style || {}   );
        $element.css(cssStyle);
    }, true);

    $element.on('click', function (event) {
        // Check edit mode
        if(ctrl.isEditable()){
            ctrl.setSelected(true);
            event.stopPropagation();
            $scope.$apply();
            return;
        }
    });
};
WbWidgetCtrl.prototype = new WbAbstractWidget()


/**
 * @ngdoc Controlles
 * @name WbWidgetGroupCtrl
 * @description Manages a group widget
 * 
 * This is a group controller
 * 
 * @ngInject
 */
var WbWidgetGroupCtrl = function($scope, $element, $wbUtil, $parse, $controller, $widget, $mdTheming, $q) {
    angular.extend(this, $controller('WbWidgetCtrl', {
        '$scope': $scope,
        '$element': $element
    }));


    this.$widget = $widget;
    this.$q = $q;
    this.$mdTheming = $mdTheming;
    
    var ctrl = this;
    this.on('modelChanged', function(){
        ctrl.loadWidgets(ctrl.getModel());
    });
};
WbWidgetGroupCtrl.prototype = new WbAbstractWidget()


// /**
// * Delete data model and widget display
// *
// * @name delete
// * @memberof wbGroupCtrl
// */
// ctrl.delete = function(){
// if(this.isRoot()){
// //TODO: mao, 2018: clear all elements
// return;
// }
// $scope.parentCtrl.removeChild($scope.wbModel, this);
// fire('delete');
// };



// ctrl.isEditable = function(){
// if(this.isRoot()){
// return $scope.editable;
// }
// return $scope.parentCtrl.isEditable();
// };

// ctrl.isSelected = function(){
// return this.isChildSelected(this);
// };

// ctrl.setSelected = function(flag) {
// if(!this.isRoot()){
// return $scope.parentCtrl.childSelected(this);
// }
// if(flag) {
// this.childSelected(this);
// }
// };

/**
 * Check if the widget is selected
 */
WbWidgetGroupCtrl.prototype.isChildSelected = function(widget){
    if(this.isRoot()){
        return widget === this.lastSelectedItem;
    }
    return this.getParent().isChildSelected(widget);
};

WbWidgetGroupCtrl.prototype.loadWidgets = function(model){
    var $element = this.getElement();
    $element.empty();
    if(!model || !angular.isArray(model.contents)){
        return;
    }
    
    var $widget = this.$widget;
    var $mdTheming = this.$mdTheming;
    var parentWidget = this;
    var $q = this.$q;

    var compilesJob = [];
    var elements = [];
    model.contents.forEach(function(item, index) {
        var job = $widget.compile(item, parentWidget)//
        .then(function(element) {
            $mdTheming(element);
            elements[index] = element;
        });
        compilesJob.push(job);
    });

    return $q.all(compilesJob)//
    .then(function() {
        elements.forEach(function(element) {
            $element.append(element);
        });
    });
};


WbWidgetGroupCtrl.prototype.childSelected = function(ctrl) {
    if(!this.isRoot()){
        return this.getParent().childSelected(ctrl);
    }
    if(ctrl === this.lastSelectedItem) {
        return;
    }
    this.lastSelectedItem = ctrl;
    // maso, 2018: call the parent controller function
    if(this.onModelSelectionFu) {
        this.$scope.$eval(function() {
            this.onModelSelectionFu(this.$scope.$parent, {
                '$model': ctrl.getModel(),
                '$ctrl': ctrl,
                'widgets': [ctrl]
            });
        });
    }
};

/**
 * Removes a widget
 * 
 * Data model and visual element related to the input model will be removed.
 */
WbWidgetGroupCtrl.prototype.removeChild = function(childCtrl) {
    var index = this.indexOfChild(childCtrl);
    if (index > -1) {
        if(this.isChildSelected(childCtrl)){
            this.childSelected(null);
        }
        childCtrl.getElement().remove();
        this.getModel().contents.splice(index, 1);
        // TODO: replace with promise
        return true;
    }
    // TODO: replace with promise
    return false;
};

/**
 * Adds dragged widget
 */
WbWidgetGroupCtrl.prototype.addChild = function(index, item) {
    var model = this.getModel();
    var parentElement = this.getElement();
    if(!angular.isArray(model.contents)){
        model.contents = [];
    }

    // add widget
    $widget.compile(item, this)//
    .then(function(newElement) {
        var nodes  = parentElement[0].childNodes;
        if (index < nodes.length) {
            newElement.insertBefore(nodes[index]);
        } else {
            parentElement.append(newElement);
        }
        model.contents.splice(index, 0, item);
    });
    // TODO: replace with promise
    return true;
};

/**
 * Finds index of child element
 */
WbWidgetGroupCtrl.prototype.indexOfChild = function(widget) {
    var model = this.getModel();
    if(!model || !angular.isArray(model) || model.length == 0){
        return -1;
    }
    return model.contents.indexOf(widget.getModel());
};

WbWidgetGroupCtrl.prototype.getAllowedTypes = function(){
    return this.$scope.wbAllowedTypesl;
};






// submit the controller
angular.module('am-wb-core')//
.controller('WbWidgetCtrl',WbWidgetCtrl)//
.controller('WbWidgetGroupCtrl',WbWidgetGroupCtrl);

