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
 * @ngdoc Services
 * @name $wbUtil
 * @description Utility service of WB
 * 
 */
.service('$wbUtil', function($rootScope, $controller, $q, $sce, $compile, $document,
		$templateRequest) {
	/**
	 * Loading template of the page
	 * 
	 * @name getTemplateFor
	 * @memberof $wbUtil
	 * @param page
	 *            {object} properties of a page, widget , ..
	 * @return promise to load template on resolve.
	 */
	function getTemplateFor(page) {
		var template, templateUrl;
		if (angular.isDefined(template = page.template)) {
			if (angular.isFunction(template)) {
				template = template(page.params);
			}
		} else if (angular.isDefined(templateUrl = page.templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(page.params);
			}
			if (angular.isDefined(templateUrl)) {
				page.loadedTemplateUrl = $sce.valueOf(templateUrl);
				template = $templateRequest(templateUrl);
			}
		}
		return $q.when(template);
	}


	function cleanEvetns(model){
		// event
		if(!model.event) {
			model.event = {};
		}
	}

	function cleanStyle(model){
		if(!model.style) {
			model.style = {};
		}
		cleanLayout(model);
	}

	function cleanLayout(model){
		if(model.type === 'Group'){
			return;
		}
		if(!model.style.layout) {
			model.style.layout = {};
		}
		var layout = model.style.layout;
		if(!layout.direction) {
			layout.direction = 'column';
		}
		if(!layout.justify) {
			layout.justify = 'center';
		}
		if(!layout.align) {
			layout.align = 'stretch';
		}
	}

	/**
	 * Clean data model
	 */
	function clean(model){
		cleanEvetns(model);
		cleanStyle(model);
		if(model.type == 'Group'){
			if(model.contents.lenth){
				for(var i = 0; i < model.contents.lenth; i++){
					clean(model.contents[i]);
				}
			}
		}
		return model;
	}


	this.getTemplateFor = getTemplateFor;
	this.clean = clean;
});
