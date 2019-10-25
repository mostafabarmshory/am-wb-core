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
	 * @name wbUiSettingColor
	 * @description a setting section to set color.
	 *
	 */
	.directive('wbUiSettingBackgroundRepeat', function () {

	    function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0];

		ngModelCtrl.$render = function () {
		    scope.repeat = ngModelCtrl.$modelValue;
		};

		scope.repeatChanged = function (newRepeat) {
		    ngModelCtrl.$setViewValue(newRepeat);
		};
	    }

	    return {
		templateUrl: 'views/directives/wb-ui-setting-background-repeat.html',
		restrict: 'E',
		replace: true,
		scope: {},
		require: ['ngModel'],
		link: postLink,
        /*
         * @ngInject
         */
		controller: function ($scope) {
		    $scope.items = [
			{name: 'Repeat', value: 'repeat'},
			{name: 'Repeat-x', value: 'repeat-x'},
			{name: 'Repeat-y', value: 'repeat-y'},
			{name: 'No-repeat', value: 'no-repeat'},
			{name: 'Space', value: 'space'},
			{name: 'Round', value: 'round'},
			{name: 'Initial', value: 'initial'},
			{name: 'Inherit', value: 'inherit'},
			{name: 'Nothing', value: ''}

		    ];

		}
	    };
	});