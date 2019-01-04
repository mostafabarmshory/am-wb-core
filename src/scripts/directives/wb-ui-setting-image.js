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


/**
 * @ngdoc Controllers
 * 
 * @ngInject
 */
function wbUiSettingGeneralCtrl($scope) {

	// TODO: maso, 2018:load from user config
	$scope.wbUiSettingClearButton = true;
	$scope.wbUiSettingPreview = true;

	this.clearValue = function (/*$event*/){
		// General option
		this.value = null;
		this.valueChanged(null);
	}
	
	this.setValue = function(value){
		this.value = value;
		this.valueChanged(value);
	}
	
	this.getValue = function(){
		this.value;
	}

}


/**
 * @ngdoc Controllers
 * 
 * @ngInject
 */
function wbUiSettingImageCtrl($scope, $resource, $controller){
	var ctrl = this;

	angular.extend(ctrl, $controller('wbUiSettingGeneralCtrl', {
		$scope : $scope
	}));

	function showImagePicker(){
		return $resource.get('image', {
			style: {
				icon: 'image',
				title: 'Select image',
				description: 'Select image from resources.'
			},
			data: ctrl.getValue()
		})//
		.then(function(value){
			ctrl.setValue(value);
		});
	}

	ctrl.showImagePicker = showImagePicker;
}


//General options
//- wbUiSettingClearButton 
//- wbUiSettingPreview

angular.module('am-wb-core')
	.controller('wbUiSettingGeneralCtrl', wbUiSettingGeneralCtrl)
	.controller('wbUiSettingImageCtrl', wbUiSettingImageCtrl)

/**
 * @ngdoc Directives
 * @name wbUiSettingImage
 * @author maso(mostafa.barmshory@dpq.co.ir)
 * @description Set an image into a value
 * 
 * URL of the image is set as result.
 *
 */
.directive('wbUiSettingImage', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-image.html',
		restrict: 'E',
		scope: {
			title: '@title',
			icon: '@icon'
		},
		require:['wbUiSettingImage', 'ngModel'],
		link: function ($scope, $element, $attrs, $ctrl){
			var ctrl = $ctrl[0];
			var ngModelCtrl = $ctrl[1];
			var lock = false;
			ngModelCtrl.$render = function(){
				lock = true;
				ctrl.setValue(ngModelCtrl.$viewValue);
				lock = false;
			};
			ctrl.valueChanged = function (newValue) {
				if(lock){
					return;
				}
				ngModelCtrl.$setViewValue(newValue);
			};
		},
		controller: 'wbUiSettingImageCtrl',
		controllerAs: 'ctrl'
	};
});
