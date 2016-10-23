/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name WbActionCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('WbActionCtrl', function($scope) {
    var types = [ {
	icon : 'link',
	label : 'Link internal or external',
	key : 'link'
    }, {
	icon : 'action',
	label : 'State change',
	key : 'state'
    } ];
    $scope.types = types;
});
