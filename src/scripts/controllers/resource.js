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
.controller('WbResourceCtrl', function($scope, $mdDialog, $document, $wbUtil, $q, $controller, $compile, pages) {

	var CHILDREN_AUNCHOR = 'wb-select-resource-children';
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
	function _encapsulatePanel(page, templateSrc) {
		// TODO: maso, 2017: pass all paramter to the setting
		// panel.
		var attr = ' ';
		if (page.label) {
			attr += ' label=\"' + page.label + '\"';
		}
		if (page.icon) {
			attr += ' icon=\"' + page.icon + '\"';
		}
		if (page.description) {
			attr += ' description=\"' + page.description + '\"';
		}
		return '<md-tab ' + attr + '>' + templateSrc
		+ '</md-tab>';
	}

	/**
	 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
	 * 
	 * @returns
	 */
	function loadPages() {
		var widget = null;
		var jobs = [];
		var pages2 = [];


		// 1- Find element
		var target = $document.find('#' + CHILDREN_AUNCHOR);

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		angular.forEach(pages, function(page) {
			var template = $wbUtil.getTemplateFor(page);
			if (angular.isDefined(template)) {
				var job = template.then(function(templateSrc) {
					templateSrc = _encapsulatePanel(page, templateSrc);
					var element = angular.element(templateSrc);
					if (angular .isDefined(page.controller)) {
						$controller(page.controller, {
							$scope : $scope,
							$element : element,
						});
					}
					$compile(element)($scope);
					element.attr('label',page.lable);
					pages2.push(element);
				});
				jobs.push(job);
			}
		});

		$q.all(jobs)//
		.then(function() {
			pages2.sort(function(a, b) {
				if (a.attr('label') < b.attr('label'))
					return -1;
				if (a.attr('label') > b.attr('label'))
					return 1;
				return 0;
			});
			
			var tabsElm = angular.element('<md-tabs md-border-bottom md-autoselect flex></md-tabs>');
			angular.forEach(pages2, function(element) {
				tabsElm.append(element);
			});

			$compile(tabsElm)($scope);
			target.append(tabsElm);
		});
	}
	
	
	$scope.$watch(function(){
		return angular.element(document.body).hasClass('md-dialog-is-showing');
	}, function(value){
		if(value){
			loadPages();
		}
	});
	
	
	$scope.pages = pages;
	
	$scope.hide = hide;
	$scope.cancel = cancel;
	$scope.answer = answer;
	$scope.setValue = setValue;
});
