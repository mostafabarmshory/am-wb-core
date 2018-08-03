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

var dragClass = 'wb-content-dragenter';
var bodyElementSelector = 'div#wb-content-body';
var placeholderElementSelector = 'div#wb-content-placeholder';

angular.module('am-wb-core')
/**
 * @ngdoc Directives
 * @name wb-group
 * @description Render a list of widget
 * 
 */
.directive('wbGroup', function($compile, $widget, $wbUtil, $controller, $settings, $q, $mdTheming) {

	/*
	 * Link widget view
	 */
	function wbGroupLink($scope, $element, $attrs, $ctrls, transclud) {

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
			model.contents.forEach(function(item, index) {
				compilesJob.push($widget.compile(item, $scope)//
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
		} else {
			// Get from parent
			ctrl.isEditable = wbGroupCtrl.isEditable;
			ctrl.childSelected = wbGroupCtrl.childSelected;
			ctrl.isChildSelected = wbGroupCtrl.isChildSelected;
			ctrl.isSelected = function(){
				return wbGroupCtrl.isChildSelected(ctrl);
			}
		}
		
		$scope.dropCallback = function(index, item, external, type){
			return ctrl.addChild(index, item);
		}
	}

	/**
	 * @ngdoc Controllers
	 * @name wbGroupCtrl
	 * @description Adding basic functionality into a widget.
	 * 
	 * Manages model data of a widget.
	 * 
	 * FIXME: maso, 2018: add injection annotation
	 */
	function wbGroupCtrl($scope, $element, $widget, $parse) {

		var onModelSelectionFu = null;
		if($scope.wbOnModelSelect) {
			onModelSelectionFu = $parse($scope.wbOnModelSelect);
		}


		/**
		 * Delete data model and widget display
		 * 
		 * @name delete
		 * @memberof wbGroupCtrl
		 */
		this.delete = function(){
			if(this.isRoot()){
				return;
			}
			$scope.parentCtrl.removeChild($scope.wbModel);
		}

		/**
		 * Clone and return a new model from the current one
		 * 
		 * NOTE: this is a deep clone of the current widget.
		 * 
		 * @name cloneModel
		 * @memberof wbGroupCtrl
		 * @return model {Object} which is cloned from the current one
		 */
		this.clone = function(){
			return $widget.cleanModel(angular.copy($scope.wbModel));
		}

		this.getModel = function(){
			return $scope.wbModel;
		}

		this.getParent = function(){
			return $scope.parentCtrl;
		}

		this.isRoot = function(){
			return $scope.root;
		}

		this.isEditable = function(){
			return $scope.editable;
		}

		this.isSelected = function(){
			return $scope.selected;
		}

		this.setSelected = function(flag) {
			if(flag) {
				this.childSelected(this);
			}
		}
		
		this.isChildSelected = function(ctrl){
			return ctrl === $scope.lastSelectedItem;
		}

		this.childSelected = function(ctrl) {
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
		}


		/**
		 * Removes a widget
		 * 
		 * Data model and visual element related to the input model will be
		 * removed.
		 */
		this.removeChild = function(model) {
			var index = $scope.wbModel.contents.indexOf(model);
			if (index > -1) {
				$element.children(':nth-child('+(index+1)+')').remove();
				$scope.wbModel.contents.splice(index, 1);
				return true;
			}
			return false;
		};
		

		/**
		 * Adds dragged widget
		 */
		this.addChild = function(index, item) {
			$wbUtil.clean(item);
			// add widget
			$widget.compile(item, $scope)//
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
		}

		this.getAllowedTypes = function(){
			return $scope.wbAllowedTypesl;
		}
		
		this.getAction = function(){
			return [1, 2, 3];
		}
	}

	return {
		templateUrl : 'views/directives/wb-group.html',
		restrict : 'E',
		replace : true,
		transclude : false,
		scope : {
			wbEditable : '=?',
			wbOnModelSelect : '@?',
			wbAllowedTypes: '<?'
		},
		link : wbGroupLink,
		controllerAs: 'ctrl',
		controller: wbGroupCtrl,
		require:['wbGroup', '?^^wbGroup', 'ngModel']
	};
});
