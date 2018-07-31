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
.directive('wbGroup', function($compile, $widget, $controller, $settings, $q, $mdTheming) {

	/*
	 * Link widget view
	 */
	function wbPanelLink($scope, $element, $attrs, $ctrls, transclud) {

		var ngModelCtrl = $ctrls[0];
		ngModelCtrl.$render = function() {
			reloadView(ngModelCtrl.$viewValue);
		};


		/**
		 * Relaod view
		 */
		function reloadView(model) {
			$element.empty();
			if(!model){
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

		/**
		 * Adds dragged widget
		 */
		function dropCallback(event, index, item, external, type) {
			// add widget
			$widget.compile(item, scope)//
			.then(function(newElement) {
//				var list = element//
//				.children(bodyElementSelector)//
//				.children(placeholderElementSelector);
				newElement.attr('id', scope.objectId(item));
				if (index < element[0].childNodes.length) {
					newElement.insertBefore(list[0].childNodes[index]);
				} else {
					element.append(newElement);
				}
				scope.wbModel.contents.splice(index, 0, item);
			});
			return true;
		}

		/**
		 * Removes a widget
		 * 
		 * Data model and visual element related to the input model will be
		 * removed.
		 */
		function removeChild(model) {
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
				var a = element//
				.children(bodyElementSelector)//
				.children(placeholderElementSelector)
				.children('#'+scope.objectId(model));
				a.remove();
				scope.wbModel.contents.splice(index, 1);
			}
		}

		/**
		 * Insert a new model before the selected model
		 */
		function insertBefore(model, newModel){
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
				$widget.compile(newModel, scope)//
				.then(function(newElement) {
					var a = element//
					.children('#'+scope.objectId(model));
					newElement.insertBefore(a);
					scope.wbModel.contents.splice(index, 0, newModel);
				})
			}
		}

		function settings() {
			return $settings.load({
				wbModel : scope.wbModel,
				wbParent : scope.$parent
			}, scope.$parent.settingAnchor());
		}

		/**
		 * Clone current widget
		 */
		function clone() {
			var newObject = angular.copy(scope.wbModel);
			return scope.$parent.insertBefore(scope.wbModel, newObject);
		}

//		// Set element ID after compile
//		element.attr('id', scope.objectId(scope.wbModel));
//		scope.wbModel.name = scope.wbModel.name || 'Panel';
//		scope.getAllowedTypes = $widget.widgetsKey;

//		scope.removeChild = removeChild;
//		scope.remove = remove;
//		scope.insertBefore = insertBefore;

//		scope.settings = settings;
//		scope.dropCallback = dropCallback;
//		scope.clone = clone;

//		if (!angular.isArray(scope.wbModel.contents)) {
//		scope.wbModel.contents = [];
//		return;
//		}
//		reloadView();
	}

	/**
	 * @ngdoc Controllers
	 * @name wbPanelCtrl
	 * @description Adding basic functionality into a widget.
	 * 
	 * Manages model data of a widget.
	 * 
	 * FIXME: maso, 2018: add injection annotation
	 */
	function wbPanelCtrl($scope, $element, $widget) {

		/**
		 * Delete data model and widget display
		 * 
		 * @name delete
		 * @memberof wbPanelCtrl
		 */
		this.delete = function(){
			// FIXME: maso, 2018: delete clone
		}

		/**
		 * Clone and return a new model from the current one
		 * 
		 * NOTE: this is a deep clone of the current widget.
		 * 
		 * @name cloneModel
		 * @memberof wbPanelCtrl
		 * @return model {Object} which is cloned from the current one
		 */
		this.cloneModel = function(){
			return $widget.cleanModel(angular.copy($scope.wbModel));
		}
	}

	return {
		templateUrl : 'views/directives/wb-group.html',
		restrict : 'E',
		replace : true,
		transclude : false,
		scope : {
			wbEditable : '=?'
		},
		link : wbPanelLink,
		controllerAs: 'ctrl',
		controller: wbPanelCtrl,
		require:['ngModel', '?^wbGroup']
	};
});
