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
 * @ngdoc controller
 * @name WbWidgetSelectCtrl
 * @memberof ngMaterialWeburger
 * @description مدیریتی برای انتخاب ویجت‌های جدید
 * 
 * در این کنترل امکاناتی فراهم شده که کاربر بتواند از میان ویجت‌های موجودی یکی
 * را انتخاب کند.
 */
.controller('WbWidgetSelectCtrl',
	function($scope, $widget, PaginatorParameter) {
    var scope = $scope;
    var paginatorParameter = new PaginatorParameter();

    /**
     * ویجت‌های موجود را لود می‌کند
     * 
     * تمام ویجت‌های لود شده در متغیری به نام widgets توی اسکپ بار
     * می‌شود.
     * 
     */
    function loadWidgets() {
	$widget.widgets(paginatorParameter).then(function(widgets) {
	    scope.widgets = widgets;
	    selectWidget(widgets.items[0]);
	});
    }

    /**
     * ویجت پیش فرض را تعیین می‌کند
     * 
     * با انتخاب یک ویجت به عنوان ویجت پیش فرض می‌توان نمایش خاصی از آن
     * را در سیستم ایجاد کرد.
     * 
     * @memberof WbWidgetSelectCtrl
     * @param {Widget}
     *                widget ویجت پیش فرض را تعیین می‌کند
     * @returns
     */
    function selectWidget(widget) {
	scope.cwidget = widget;
	// TODO: bind the widget
    }

    /**
     * ویجت را به عنوان ویجت انتخاب شده تعیین می‌کندs
     * 
     * @memberof WbWidgetSelectCtrl
     * @param widget
     * @returns
     */
    function answerWidget(widget) {
	var element = angular.copy(widget.data);
	$scope.answer(element);
    }

    // تعیین خصوصیت‌های اسکوپ
    scope.selectWidget = selectWidget;
    scope.answerWidget = answerWidget;
    loadWidgets();
});
