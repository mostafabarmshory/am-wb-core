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
 * @name wbUiSettingChoose
 * @memberof ngMaterialWeburger
 * @description a setting section for choosing values.
 *
 */
.directive('wbUiSettingChoose', function ($mdTheming, $mdUtil) {

    // **********************************************************
    // Private Methods
    // **********************************************************
    function postLink(scope, element, attr, ctrls) {
	scope.xitems = scope.$eval(attr.items);
	attr.$observe('title', function(title){
	    scope.title = title;
	});
	attr.$observe('icon', function(icon){
	    scope.icon = icon;
	});
	var ngModelCtrl = ctrls[0] || $mdUtil.fakeNgModel();
	$mdTheming(element);

	scope.$watch('selectedIndex', function () {
	    if(!angular.isDefined(scope.selectedIndex) || 
		    (scope.selectedIndex < 0 || scope.selectedIndex >= scope.xitems.length)){
		scope.selectedIndex = 0;
	    }
	    ngModelCtrl.$setViewValue(scope.xitems[scope.selectedIndex].value);
	});

	ngModelCtrl.$render = render;

	function render() {
	    for (var item in scope.xitems) {
		if (item.value == ngModelCtrl.$modelValue){
		    scope.selectedIndex = scope.xitems.indexOf(item);
		    return;
		}
	    }
	    // TODO: maso, 2017: update default value.
	    scope.selectedIndex = 0;
	    ngModelCtrl.$setViewValue(scope.xitems[scope.selectedIndex].value);
	}
    }

    /*
     * Directive info
     */
    return {
	templateUrl: 'views/directives/wb-ui-setting-choose.html',
	restrict: 'E',
	scope: true,
	require: ['?ngModel'],
	priority: 210, // Run before ngAria
	link: postLink
    };
});
