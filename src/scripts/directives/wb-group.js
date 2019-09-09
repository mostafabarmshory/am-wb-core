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
 *  ## wbOnModelSelect
 * 
 * If a widget select with in the group then the wbOnModelSelect parameter will
 * be evaluated with the following attributes:
 *  - $event : the related event - $ctrl : the widget (to support legacy) -
 * $model: the model (to support legace)
 * 
 * NOTE: The root widget will be passed as first selected item. The function
 * will be evaluated in non edit mode.
 */
.directive('wbGroup', function($widget, $parse, $timeout) {

	/*
	 * Link widget view
	 */
	function wbGroupLink($scope, $element, $attrs, ngModelCtrl) {

		var model;
		var rootWidget;
		var onSelectionFuction;

		if ($scope.wbOnModelSelect) {
			onSelectionFuction = $parse($scope.wbOnModelSelect);
		}

		/*
		 * Fire if a widget is selected
		 */
		function fireSelection($event) {
			if(!onSelectionFuction) {
				return;
			}
			var widgets = $event.widgets;
			var locals = {
					'$event' : $event,
					'widgets' : widgets
			};
			if (angular.isArray(widgets) && widgets.length) {
				locals.$model = rootWidget.getModel();
				locals.$ctrl = rootWidget;
			}
			$scope.$eval(function() {
				onSelectionFuction($scope.$parent, locals);
			});
			$timeout(function(){
				try{$scope.$digest();} catch(ex){};
			});
		}

		// Load ngModel
		ngModelCtrl.$render = function() {
			model = ngModelCtrl.$viewValue;
			if (!model) {
				if (rootWidget) {
					rootWidget.setModel({
						type : 'Group'
					});
				}
				return;
			}
			// set new model to the group
			if (rootWidget) {
				rootWidget.setModel(model);
			} else {
				$widget.compile(model, null, $element)
				.then(function(widget) {
					rootWidget = widget;
					// load
					rootWidget.on('select', fireSelection);
					fireSelection({
						widgets : [ widget ]
					});
				});
			}
		};

		/*
		 * Watch for editable in root element
		 */
		$scope.$watch('wbEditable', function(editable) {
			if (rootWidget) {
				rootWidget.setEditable(editable);
			}
		});

		$scope.$watch('wbAllowedTypes', function(wbAllowedTypes) {
			if (rootWidget) {
				rootWidget.setAllowedTypes(wbAllowedTypes);
			}
		});

	}

	return {
		restrict : 'E',
		template: '<div></div>',
		scope : {
			wbEditable : '=?',
			wbOnModelSelect : '@?',
			wbAllowedTypes : '<?'
		},
		link : wbGroupLink,
		require : 'ngModel',
		replace: true
	};
});
