/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')

/**
 * @ngdoc controller
 * @name ActionCtrl
 * @memberof ngMaterialExtension
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('SettingsCtrl', function($scope, $settings) {
	var scope = $scope;

	function loadPages() {
		var keys = scope.style.pages;
		var settings = [];
		for (var i = 0; i < keys.length; i++) {
			settings.push($settings.page(keys[i]));
		}
		scope.settings = settings;
	}

	loadPages();
});
