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
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings', function($rootScope,$widget, $q, $sce, $compile, $document, $templateRequest) {
    /**
     * Setting page storage
     * 
     */
    var settingPages = {};
    var notFound = {
	    label : 'Settings not found',
	    templateUrl : 'views/settings/wb-notfound.html'
    };

    var oldScope;

    /**
     * Fetchs a setting page.
     * 
     * @param model
     * @returns
     */
    function page(settingId) {
	var widget = notFound;
	if (settingId in settingPages) {
	    widget = settingPages[settingId];
	}
	return widget;
    }

    /**
     * Adds new setting page.
     * 
     * @returns
     */
    function newPage(settingId, page) {
	settingPages[settingId] = page;
    }

    /**
     * Finds and lists all setting pages.
     * 
     * @returns
     */
    function pages() {
	// TODO: maso, 1395:
    }

    /*
     * get setting page template
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
	return template;
    }

    /**
     * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
     * 
     * @returns
     */
    function loadSetting(models) {
	var widget = null;
	var jobs = [];
	var pages = [];

	// 0- destroy old resource
	if(angular.isDefined(oldScope)){
	    oldScope.$destroy();
	}
	var scope = $rootScope.$new(true, $rootScope);
	scope.wbModel = models.wbModel;
	scope.wbParent = models.wbParent;
	oldScope = scope;


	// 1- Find element
	var target = $document.find('#wb-setting-panel');

	// 2- Clear childrens
	target.empty();

	// 3- load pages
	$widget.widget(models.wbModel)//
	.then(function(w){
	    widget = w;
	    if(angular.isArray(widget.setting)){
		angular.forEach(widget.setting, function(type) {
		    var page = notFound;
		    if(type in settingPages){
			page = settingPages[type];
		    }
		    var template = getTemplateFor(page);
		    if (angular.isDefined(template)) {
			var job = template//
			.then(function(templateSrc){
			    var element = angular.element(templateSrc);
			    if (angular.isDefined(page.controller)) {
				$controller(page.controller, {
				    $scope : scope,
				    $element : element,
				});
			    }
			    $compile(element)(scope);			    
			    pages.push(element);
			});
			jobs.push(job);
		    }
		});
	    } else {
		// TODO: maso, 2017: not setting page founnd
	    }
	})//
	.then(function(){
	    $q.all(jobs)//
	    .then(function(){
		angular.forEach(pages, function(element){
		    target.append(element);
		});
	    });
	});
    }
    // تعیین سرویس‌ها
    this.page = page;
    this.load = loadSetting;
    this.newPage = newPage;
});
