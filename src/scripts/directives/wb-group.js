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

angular.module('am-wb-core')
/**
 * @ngdoc Directives
 * @name wb-group
 * @description Render a list of widget
 * 
 */
.directive('wbGroup', function($compile, $widget, $wbUtil, $controller, $settings, $q, $mdTheming, $parse) {

    /*
     * Link widget view
     */
    function wbGroupLink($scope, $element, $attrs, $ctrls) {

        // Loads wbGroup
        var ctrl = $ctrls[0];

        // Loads wbGroup
        var wbGroupCtrl = $ctrls[1];
        $scope.parentCtrl = wbGroupCtrl;

        // Load ngModel
        var ngModelCtrl = $ctrls[2];
        ngModelCtrl.$render = function() {
            reloadView(ngModelCtrl.$viewValue);
        };

        /*
         * Loads view
         */
        function reloadView(model) {
            $element.empty();
            $scope.wbModel = model;
            if(!model || !angular.isArray(model.contents)){
                return;
            }
            var compilesJob = [];
            var elements = [];
            var locals = ctrl.getLocals();
            model.contents.forEach(function(item, index) {
                compilesJob.push($widget.compile(item, $scope, $element, locals)//
                        .then(function(element) {
                            $mdTheming(element);
                            elements[index] = element;
                        }));
            });
            return $q.all(compilesJob)//
            .then(function() {
                elements.forEach(function(element) {
                    $element.append(element);
                });
            });
        }

        /*
         * Load edit mode
         */
        function loadEditMode(){
            $scope.editable = true;
            if(ctrl.isRoot()) {
                delete $scope.lastSelectedItem;
            }
        }

        /*
         * Removes edit mode
         */
        function removeEditMode(){
            $scope.editable = false;
            ctrl.childSelected(null);
        }


        /*
         * Watch for editable
         */
        if(!wbGroupCtrl){
            $scope.$watch('wbEditable', function(value, old){
                if(value === old){
                    return;
                }
                if(value){
                    loadEditMode();
                } else {
                    removeEditMode();
                }
            });
            $scope.root = true;
        }

        $scope.dropCallback = function(index, item/*, external, type*/){
            return ctrl.addChild(index, item);
        };
    }

    /**
     * @ngdoc Controllers
     * @name wbGroupCtrl
     * @description Adding basic functionality into a widget.
     * 
     * Manages model data of a widget.
     * 
     * @ngInject
     */
    function wbGroupCtrl($scope, $element) {
        var ctrl = this;
        var callbacks = {};
        var onModelSelectionFu = null;
        if($scope.wbOnModelSelect) {
            onModelSelectionFu = $parse($scope.wbOnModelSelect);
        }

        function fire(type){
            if(angular.isDefined(callbacks[type])){
                for(var i = 0; i < callbacks[type].length; i++){
                    try{
                        callbacks[type][i]();
                    } catch (e){
                        /*console.log(error);*/
                    }
                }
            }
        }

        /**
         * Delete data model and widget display
         * 
         * @name delete
         * @memberof wbGroupCtrl
         */
        ctrl.delete = function(){
            if(ctrl.isRoot()){
                // TODO: mao, 2018: clear all elements
                return;
            }
            $scope.parentCtrl.removeChild($scope.wbModel);
            fire('delete');
        };

        /**
         * Clone and return a new model from the current one
         * 
         * NOTE: this is a deep clone of the current widget.
         * 
         * @name cloneModel
         * @memberof wbGroupCtrl
         * @return model {Object} which is cloned from the current one
         */
        ctrl.clone = function(){
            return $wbUtil.clean(angular.copy($scope.wbModel));
        };

        ctrl.getModel = function(){
            return $scope.wbModel;
        };

        ctrl.getParent = function(){
            return $scope.parentCtrl;
        };

        ctrl.isRoot = function(){
            return !$scope.parentCtrl;
        };

        ctrl.isEditable = function(){
            if($scope.parentCtrl){
                return $scope.parentCtrl.isEditable();
            }
            return $scope.editable;
        };

        ctrl.isSelected = function(){
            return ctrl.isChildSelected(ctrl);
        };

        ctrl.setSelected = function(flag) {
            if($scope.parentCtrl){
                return $scope.parentCtrl.childSelected(ctrl);
            }
            if(flag) {
                ctrl.childSelected(ctrl);
            }
        };

        ctrl.isChildSelected = function(ctrl){
            if($scope.parentCtrl){
                return $scope.parentCtrl.isChildSelected(ctrl);
            }
            return ctrl === $scope.lastSelectedItem;
        };

        ctrl.childSelected = function(ctrl) {
            if($scope.parentCtrl){
                return $scope.parentCtrl.childSelected(ctrl);
            }
            if(ctrl === $scope.lastSelectedItem) {
                return;
            }
            $scope.lastSelectedItem = ctrl;
            // maso, 2018: call the parent controller function
            if(onModelSelectionFu) {
                var callback = function() {
                    var local = {};
                    if(ctrl) {
                        local = {
                                '$model': ctrl.getModel(),
                                '$ctrl': ctrl
                        };
                    }
                    onModelSelectionFu($scope.$parent, local);
                };
                $scope.$eval(callback);
            }
        };


        /**
         * Removes a widget
         * 
         * Data model and visual element related to the input model will be
         * removed.
         */
        ctrl.removeChild = function(model) {
            var index = ctrl.indexOfChild(model);
            if (index > -1) {
                $element.children(':nth-child('+(index+1)+')').remove();
                $scope.wbModel.contents.splice(index, 1);
                return true;
            }
            return false;
        };

        ctrl.getLocals = function(){
            if($scope.parentCtrl){
                return $scope.parentCtrl.getLocals();
            }
            return $scope.wbLocals;
        };

        /**
         * Adds dragged widget
         */
        ctrl.addChild = function(index, item) {
            $wbUtil.clean(item);
            // add widget
            $widget.compile(item, $scope, null, ctrl.getLocals())//
            .then(function(newElement) {
                var nodes  = $element[0].childNodes;
                if (index < nodes.length) {
                    newElement.insertBefore(nodes[index]);
                } else {
                    $element.append(newElement);
                }
                if(!angular.isArray($scope.wbModel.contents)){
                    $scope.wbModel.contents = [];
                }
                $scope.wbModel.contents.splice(index, 0, item);
            });
            return true;
        };

        ctrl.indexOfChild = function(item) {
            return $scope.wbModel.contents.indexOf(item);
        };

        ctrl.getAllowedTypes = function(){
            return $scope.wbAllowedTypesl;
        };

        ctrl.on = function(type, callback){
            if(!angular.isArray(callbacks[type])){
                callbacks[type] = [];
            }
            callbacks[type].push(callback);
        };

        ctrl.getActions = function(){
            return [{
                title: 'Delete',
                icon: 'delete',
                action: ctrl.delete
            },{
                title: 'Clone',
                icon: 'content_copy',
                action: function(){
                    if(ctrl.isRoot()){
                        return;
                    }
                    var model = ctrl.clone();
                    var index = $scope.parentCtrl.indexOfChild($scope.wbModel);
                    $scope.parentCtrl.addChild(index, model);
                }
            }];
        };
    }

    return {
        templateUrl : 'views/directives/wb-group.html',
        restrict : 'E',
        replace : true,
        scope : {
            wbEditable : '=?',
            wbOnModelSelect : '@?',
            wbAllowedTypes: '<?',
            wbLocals: '<?'
        },
        link : wbGroupLink,
        controllerAs: 'ctrl',
        controller: wbGroupCtrl,
        require:['wbGroup', '?^^wbGroup', 'ngModel']
    };
});
