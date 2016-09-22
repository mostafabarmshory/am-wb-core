/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')

/**
 * @ngdoc controller
 * @name ContentCtrl
 * @memberof ngMaterialExtension
 * @description مدیریتی برای انتخاب ویجت‌های جدید
 * 
 * در این کنترل امکاناتی فراهم شده که کاربر بتواند از میان ویجت‌های موجودی یکی
 * را انتخاب کند.
 */
.controller('ContentSelectCtrl', function($scope, $widget, PaginatorParameter) {
	var scope = $scope;
	var paginatorParameter = new PaginatorParameter();

	/**
	 * ویجت‌های موجود را لود می‌کند
	 * 
	 * تمام ویجت‌های لود شده در متغیری به نام widgets توی اسکپ بار می‌شود.
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
	 * با انتخاب یک ویجت به عنوان ویجت پیش فرض می‌توان نمایش خاصی از آن را در
	 * سیستم ایجاد کرد.
	 * 
	 * @memberof ContentSelectCtrl
	 * @param {Widget}
	 *            widget ویجت پیش فرض را تعیین می‌کند
	 * @returns
	 */
	function selectWidget(widget) {
		scope.cwidget = widget;
		// TODO: bind the widget
	}

	/**
	 * ویجت را به عنوان ویجت انتخاب شده تعیین می‌کندs 
	 * 
	 * @memberof ContentSelectCtrl
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
