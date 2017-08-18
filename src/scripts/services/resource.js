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
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description Resource managment
 * 
 */
.service('$resource', function($wbUi) {

	var resourcePages = {};


	/**
	 * Fetchs a page.
	 * 
	 * @param model
	 * @returns
	 */
	function page(type) {
		var widget = notFound;
		if (type in resourcePages) {
			widget = resourcePages[type];
		}
		return widget;
	}

	/**
	 * Adds new page.
	 * 
	 * @returns
	 */
	function newPage(page) {
		resourcePages[page.type] = page;
	}

	/**
	 * Finds and lists all pages.
	 * 
	 * @returns
	 */
	function pages() {
		// TODO: maso, 1395:
	}

	/**
	 * Get a resource 
	 * 
	 * @param tags
	 * @returns
	 */
	function get(tag, option){
		if(!option){
			option = {};
		}
		var pages = [];
		if(tag){
			angular.forEach(resourcePages, function(page) {
				if(angular.isArray(page.tags) && page.tags.includes(tag)){
					this.push(page);
				}
			}, pages);
		} else {
			pages = resourcePages;
		}

		return $wbUi.openDialog({
			controller : 'WbResourceCtrl',
			templateUrl : 'views/dialogs/wb-select-resource.html',
			parent : angular.element(document.body),
			clickOutsideToClose : true,
			fullscreen : true,
			locals : {
				'pages' : pages,
				'style' : option.style || {
					title: 'Resource:' + tag
				},
				'data' : option.data || {}
			}
		});
	}


	this.get = get;
	this.newPage = newPage;
	this.page = page;
	this.pages = pages;
});
