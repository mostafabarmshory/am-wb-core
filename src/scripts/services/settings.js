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
.service('$settings',function($rootScope, $controller, $widget, $q, $sce, $compile,
		$document, $templateRequest, $wbUtil) {
	var WB_SETTING_PANEL_ID = 'WB-SETTING-PANEL';

	/*
	 * Default settings
	 */
	var WB_SETTINGS_PAGE_DEFAULT = ['description', 'border',
		'background', 'pageLayout', 'marginPadding'];
	var WB_SETTINGS_GROUP_DEFAULT = [ 'description', 'border',
		'background', 'pageLayout', 'selfLayout',
		'marginPadding', 'minMaxSize' ];
	var WB_SETTINGS_WIDGET_DEFAULT = [ 'selfLayout', 'border',
		'background', 'marginPadding', 'minMaxSize' ];
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
	function page(type) {
		var widget = notFound;
		if (type in settingPages) {
			widget = settingPages[type];
		}
		return widget;
	}

	/**
	 * Adds new setting page.
	 * 
	 * @returns
	 */
	function newPage(page) {
		settingPages[page.type] = page;
	}

	/**
	 * Finds and lists all setting pages.
	 * 
	 * @returns
	 */
	function pages() {
		// TODO: maso, 1395:
	}

	/**
	 * Defines default settings for widget
	 * 
	 * @param widget
	 * @returns
	 */
	function getDefaultSettingsFor(widget) {
		if (widget.type === 'Page') {
			return WB_SETTINGS_PAGE_DEFAULT;
		}
		if (widget.type === 'Group') {
			return WB_SETTINGS_GROUP_DEFAULT;
		}
		return WB_SETTINGS_WIDGET_DEFAULT;
	}

	/**
	 * encapsulate template srce with panel widget template.
	 * 
	 * @param page
	 *            setting page config
	 * @param tempateSrc
	 *            setting page html template
	 * @returns encapsulate html template
	 */
	function _encapsulateSettingPanel(page, templateSrc) {
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
		return '<wb-setting-panel ' + attr + '>' + templateSrc
		+ '</wb-setting-panel>';
	}

	/**
	 * Check if this is the current model
	 */
	function isLoaded(wbModel) {
    	return oldScope && oldScope.wbModel == wbModel;
    }
	
	/**
	 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
	 * 
	 * @returns
	 */
	function loadSetting(models, panelId) {
		var widget = null;
		var jobs = [];
		var pages = [];

		// 0- destroy old resource
		if(isLoaded(models.wbModel)){
			return;
		}
		if (angular.isDefined(oldScope)) {
			oldScope.$destroy();
		}
		var scope = $rootScope.$new(true, $rootScope);
		scope.wbModel = models.wbModel;
		scope.wbParent = models.wbParent;
		oldScope = scope;

		// 1- Find element

		var target;
		if(panelId){
			target = $document.find('#'+panelId).find('#' + WB_SETTING_PANEL_ID);
		} else {
			target = $document.find('#' + WB_SETTING_PANEL_ID);
		}

		// 2- Clear childrens
		target.empty();

		// 3- load pages
		$widget.widget(models.wbModel)//
		.then(function(w) {
			widget = w;
			var widgetSettings = getDefaultSettingsFor(w);
			if (angular.isArray(widget.setting)) {
				widgetSettings = widgetSettings
				.concat(widget.setting);
			}
			angular.forEach(widgetSettings, function(type) {
				var page = notFound;
				if (type in settingPages) {
					page = settingPages[type];
				}
				var template = $wbUtil.getTemplateFor(page);
				if (angular.isDefined(template)) {
					var job = template.then(function(templateSrc) {
						templateSrc = _encapsulateSettingPanel(page, templateSrc);
						var element = angular.element(templateSrc);
						if (angular .isDefined(page.controller)) {
							$controller(page.controller, {
								$scope : scope,
								$element : element,
							});
						}
						$compile(element)(scope);
						element.attr('label',page.lable);
						pages.push(element);
					});
					jobs.push(job);
				}
			});

		})
		//
		.then(function() {
			$q.all(jobs)//
			.then(function() {
				pages.sort(function(a, b) {
					if (a.attr('label') < b.attr('label'))
						return -1;
					if (a.attr('label') > b.attr('label'))
						return 1;
					return 0;
				});
				angular.forEach(pages, function(element) {
					target
					.append(element);
				});
			});
		});
	}

	// تعیین سرویس‌ها
	this.WB_SETTING_PANEL_ID = WB_SETTING_PANEL_ID;
	this.page = page;
	this.load = loadSetting;
	this.newPage = newPage;
	this.isCurrentModel = isLoaded;
});
