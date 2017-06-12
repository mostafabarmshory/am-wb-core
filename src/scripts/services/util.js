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

angular
.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $wbUtil
 * @memberof ngMaterialWeburger
 * @description کدهای پایه
 * 
 */
.service('$wbUtil',function($rootScope, $controller, $widget, $q, $sce, $compile,
		$document, $templateRequest) {
	/*
	 * get setting page template
	 */
	function getTemplateFor(page) {
		var template, templateUrl;
		if (angular.isDefined(template = page.template)) {
			if (angular.isFunction(template)) {
				template = template(page.params);
			}
		} else if (angular
				.isDefined(templateUrl = page.templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(page.params);
			}
			if (angular.isDefined(templateUrl)) {
				page.loadedTemplateUrl = $sce
				.valueOf(templateUrl);
				template = $templateRequest(templateUrl);
			}
		}
		return template;
	}

	this.getTemplateFor = getTemplateFor;
});
