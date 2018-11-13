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
	 * @name wb-setting-page
	 * @description Display a setting of a model
	 * 
	 */
	.directive('wbSettingPage', function ($widget, $settings, $wbUtil, $controller, $compile, $mdTheming) {
	    function postLink($scope, $element, $attrs, $ctrls) {

		var wbWidget = null;
		function loadSetting(page) {
		    $wbUtil.getTemplateFor(page)
			    .then(function (templateSrc) {
				var element = angular.element(templateSrc);
				var scope = $scope.$new();
				if (angular.isDefined(page.controller)) {
				    var controller = $controller(page.controller, {
					$scope: scope,
					$element: element,
				    });
				    if (page.controllerAs) {
					scope[page.controllerAs] = controller;
				    }
				    element.data('$ngControllerController', controller);
				}
				$compile(element)(scope);
				$mdTheming(element);
				$element.empty();
				$element.append(element);
			    });
		}

		function loadModel(model) {
		    wbWidget = model;
		    if (wbWidget) {
			$scope.wbModel = wbWidget.getModel();
			$scope.wbWidget = wbWidget;
		    } else {
			$scope.wbModel = null;
			$scope.wbWidget = null;
		    }
		}

		$scope.$watch('type', function (type) {
		    if (!type) {
			return;
		    }
		    var setting = $settings.page(type);
		    loadSetting(setting);
		});

		// Load ngModel
		var ngModelCtrl = $ctrls[0];
		ngModelCtrl.$render = function () {
		    if (ngModelCtrl.$viewValue) {
			loadModel(ngModelCtrl.$viewValue);
		    }
		    //TODO: maso, 2018: Do appropriate work
		};
	    }

	    // create directive
	    return {
		restrict: 'E',
		replace: true,
		template: '<div layout="column"></div>',
		link: postLink,
		scope: {
		    type: '@wbType'
		},
		require: ['ngModel']
	    };
	});
