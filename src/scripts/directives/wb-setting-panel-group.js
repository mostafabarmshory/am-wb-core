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
 * @name wb-setting-panel-group
 * @description Widgets settings
 * 
 * Loads list of settings.
 * 
 */
.directive('wbSettingPanelGroup', function($settings, $widget) {

	/**
	 * Init settings
	 */
	function postLink($scope, $element, $attrs, $ctrls) {

		// Load ngModel
		var ngModelCtrl = $ctrls[0];
		var settingMap = [];
		$scope.settings = [];

		/**
		 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
		 * 
		 * @returns
		 */
		function loadSetting(wbWidget) {

			// hide all settings
			var i;
			for(i = 0; i < $scope.settings.length; i++){
				$scope.settings[i].visible = false;
			}
			
			if(!wbWidget || (angular.isArray(wbWidget) && wbWidget.length < 1)){
			    $scope.wbModel = null;
			    return;
			}

			// load pages
			var widget = $widget.getWidget(wbWidget.getModel());
			var settingKeys = $settings.getSettingsFor(widget);

			// visible new ones
			for(i = 0; i < settingKeys.length; i++){
				var key = settingKeys[i];
				if(!settingMap[key]){
					var setting = $settings.getPage(key);
					settingMap[key] = angular.copy(setting);
					$scope.settings.push(settingMap[key]);
				}
				settingMap[key].visible = true;
			}
			
			// set model in view
			$scope.wbModel = wbWidget;
		}

		ngModelCtrl.$render = function() {
			if(ngModelCtrl.$viewValue) {
				var model = ngModelCtrl.$viewValue;
				if(angular.isArray(model) && model.length){
					loadSetting(model[0]);
				} else {
					loadSetting(model);
				}
			}
		};
	}
	
	return {
		restrict : 'E',
		replace: true,
		templateUrl: function($element, $attr){
			var link = 'views/directives/wb-setting-panel-';
			if(angular.isDefined($attr.wbTabMode)){
				link += 'tabs.html';
			} else {
				link += 'expansion.html';
			}
			return link;
		},
		scope : {},
		link : postLink,
		require:['ngModel']
	};
});
