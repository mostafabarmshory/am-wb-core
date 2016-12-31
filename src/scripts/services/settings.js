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
.service('$settings', function($mdDialog) {
    /**
     * Setting page storage
     * 
     */
    var settingPages = {};
    var notFound = {
	label : 'Settings not found',
	page : 'views/settings/wb-notfound.html'
    };

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

    /**
     * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
     * 
     * @returns
     */
    function loadSetting(locals) {
	return $mdDialog.show({
	    controller : 'WbSettingDialogsCtrl',
	    templateUrl : 'views/dialogs/wb-settings.html',
	    parent : angular.element(document.body),
	    clickOutsideToClose : true,
	    fullscreen : true,
	    locals : locals
	});
    }
    // تعیین سرویس‌ها
    this.page = page;
    this.load = loadSetting;
    this.newPage = newPage;
});
