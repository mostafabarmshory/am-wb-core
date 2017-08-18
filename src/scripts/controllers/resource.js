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
 * @ngdoc function
 * @name WbResourceCtrl
 * @description # WbResourceCtrl Controller of the ngMaterialWeburger
 */
.controller('WbResourceCtrl', function($scope, $rootScope,  $mdDialog, $document, 
		$wbUtil, $q, $controller, $compile, pages, style, data) {

	var CHILDREN_AUNCHOR = 'wb-select-resource-children';
	$scope.value = angular.copy(data);
	$scope.style = style;
	
	function hide() {
		$mdDialog.hide();
	}

	function cancel() {
		$mdDialog.cancel();
	}

	function answer() {
		$mdDialog.hide($scope.value);
	}
	
	function setValue(value){
		$scope.value = value;
	}
	
	$scope.$watch('value', function(value){
		// Deal with value
		console.log(value);
	});
	


	/**
	 * encapsulate template srce with panel widget template.
	 * 
	 * @param page
	 *            setting page config
	 * @param tempateSrc
	 *            setting page html template
	 * @returns encapsulate html template
	 */
	function _encapsulatePanel(page, template) {
		// TODO: maso, 2017: pass all paramter to the setting
		// panel.
		return template;
	}

	/**
	 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
	 * 
	 * @returns
	 */
	function loadPage(index) {
		var widget = null;
		var jobs = [];
		var pages2 = [];


		// 1- Find element
		var target = $document.find('#' + CHILDREN_AUNCHOR);

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		var page = pages[index];
		var template = $wbUtil.getTemplateFor(page);
		if (angular.isDefined(template)) {
			jobs.push(template.then(function(templateSrc) {
				templateSrc = _encapsulatePanel(page, templateSrc);
				var element = angular.element(templateSrc);
				var scope = $rootScope.$new(false, $scope);
				scope.page = page;
				scope.value = $scope.value;
				if (angular .isDefined(page.controller)) {
					$controller(page.controller, {
						$scope : scope,
						$element : element,
					});
				}
				$compile(element)(scope);
				pages2.push(element);
			}));
		}

		$q.all(jobs).then(function() {
			angular.forEach(pages2, function(element) {
				target.append(element);
			});
		});
	}
	
	
//	$scope.$watch(function(){
//		return angular.element(document.body).hasClass('md-dialog-is-showing');
//	}, function(value){
//		if(value){
//			loadPages();
//		}
//	});
	$scope.$watch('pageIndex', function(value){
		if(value >= 0){
			loadPage(value);
		}
	});
	
	
	$scope.pages = pages;
	
	$scope.hide = hide;
	$scope.cancel = cancel;
	$scope.answer = answer;
	$scope.setValue = setValue;
});
