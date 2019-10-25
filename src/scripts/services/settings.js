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
 * @name $widget
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings',function() {
    /**
     * Setting page storage
     * 
     */
    var settingPages = [];

    var notFound = {
            label : 'Settings not found',
            templateUrl : 'views/settings/wb-notfound.html'
    };

    /**
     * Fetchs a setting page with the given type
     * 
     * @param model
     * @returns
     */
    this.getPage = function (type) {
        var pageResult = notFound;
        _.forEach(settingPages, function(settingPage){
            if (type === settingPage.type) {
                pageResult = settingPage;
            }
        });
        return pageResult;
    }

    /**
     * 
     * @param page type
     * @returns
     */
    this.removePage = function (type) {
        settingPages=  _.remove(settingPages, function(page) {
            return type === page.type;
        });
        return this;
    }

    /**
     * Adds new setting page.
     * 
     * @returns
     */
    this.addPage = function (page) {
        settingPages.push(page);
        return this;
    }
    
    /**
     * Set new setting page.
     * 
     * @returns
     */
    this.setPage = function (page) {
        this.remvoePage(page.type);
        return this.addPage(page);
    }

    /**
     * Finds and lists all setting pages.
     * 
     * @returns
     */
    this.pages = function () {
        return settingPages;
    }

    /**
     * Defines default settings for widget
     * 
     * @param widget
     * @returns
     */
    this.getSettingsFor = function (widgetDescription) {
        // if it was cached before
        this.settingPagesCach = this.settingPagesCach || {};
        if(_.has(this.settingPagesCach, widgetDescription.type)){
            return this.settingPagesCach[widgetDescription.type];
        }

        // create list
        var widgetSettings = [];
        _.forEach(settingPages, function(page){
            if(pageMatchWith(page, widgetDescription)){
                widgetSettings.push(page);
            }
        });

        // put into cache
        this.settingPagesCach[widgetDescription.type] =  widgetSettings;

        return widgetSettings;
    }
});
