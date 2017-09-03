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

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name wbWidget
 * @memberof ngMaterialWeburger
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbWidget', function() {
	function postLink(scope, element, attrs, ctrl, transclude) {
		// Modify angular transclude function
		// see:
		// http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
		// FIXME: maso, 2017: use regular dom insted of ng-transclude
		transclude(scope, function(clone, scope) {
			var node = element //
			.find('wb-transclude') //
			.append(clone);
		});
	}

	return {
		templateUrl : 'views/directives/wb-widget.html',
		restrict : 'E',
		transclude : true,
		replace : true,
		link : postLink,
		controller : function($scope, $element, $settings, $widget) {
			var element = $element;
			/**
			 * Remove widget from parent
			 */
			function remove() {
				console.log('widget removed');
				return $scope.$parent.removeChild($scope.wbModel);
			}

			/**
			 * Load widget settings
			 * 
			 */
			function settings() {
				return $settings.load({
					wbModel : $scope.wbModel,
					wbParent : $scope.$parent,
				}, $scope.$parent.settingAnchor());
			}

			/**
			 * Notify this widget is selected
			 */
			function selected() {
				if (!$scope.wbEditable) {
					return;
				}
				return settings();
			}

			/**
			 * Check if the widget is selected one
			 */
			function isSelected() {
				return $scope.wbEditable && $settings.isCurrentModel($scope.wbModel);
			}
			
			/**
			 * Clone current widget
			 */
			function clone() {
				var newObject = angular.copy($scope.wbModel);
				return $scope.$parent.insertBefore($scope.wbModel, newObject);
			}

			/*
			 * Add to scope
			 */
			$scope.remove = remove;
			$scope.movedCallback = remove;
			$scope.settings = settings;
			$scope.selected = selected;
			// Sets widget id after compile
			element.attr('id', $scope.objectId($scope.wbModel));
			$scope.wbModel.name = $scope.wbModel.name || 'Widget';
			$scope.isSelected = isSelected;
			$scope.clone = clone;
		}
	};
});