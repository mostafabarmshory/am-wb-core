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
 * @name wbUiSettingVideo
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to select audio file.
 *
 */
.directive('wbUiSettingVideo', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-video.html',
		restrict: 'E',
		scope: {
			title: '@title',
            lable: '@lable',
			icon: '@icon'
		},
        /*
         * @ngInject
         */
		controller: function($scope, $resource){
			this.selectValue = function(){
			    var ctrl = this;
				return $resource.get('vedio', {
					style: {
						title: 'Select video'
					},
					data: $scope.value
				})//
				.then(function(value){
					ctrl.changeValue(value);
				});
			};
			/*
			 * Set new value
			 */
			this.changeValue = function(newValue){
			    $scope.valueChanged(newValue);
			};
			
			this.clearValue = function() {
                this.changeValue(null);
			};
		},
		controllerAs: 'ctrl',
		require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            /*
             * Set in scope
             */
            ngModelCtrl.$render = function () {
                scope.value = ngModelCtrl.$modelValue;
            };
            
            /*
             * Change the model
             */
            scope.valueChanged = function (newValue) {
                scope.value = newValue;
                ngModelCtrl.$setViewValue(newValue); 
            };
        }
	};
});
