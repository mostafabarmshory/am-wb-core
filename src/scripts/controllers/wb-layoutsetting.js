/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc controller
 * @name WbLayoutWbSettingsCtrl
 * @memberof ngMaterialWeburger
 * @description کنترلر یک عمل برای مدیریت و ویرایش آن ایجاد شده است. این کنترل
 *              در دیالوگ و یا نمایش‌های دیگر کاربرد دارد.
 * 
 * این کنترل علاوه بر امکانات ویرایشی، داده‌های اولیه هم برای نمایش فراهم
 * می‌کند.
 */
.controller('WbLayoutWbSettingsCtrl', function($scope, $settings) {
    var scope = $scope;

    scope.directions = [ {
	title : 'row',
	icon : 'view_column',
	value : 'row'
    }, {
	title : 'column',
	icon : 'view_agenda',
	value : 'column'
    } ];

    scope.directionAlignments = [ {
	title : 'none',
	value : 'none'
    }, {
	title : 'start',
	value : 'start'
    }, {
	title : 'center',
	value : 'center'
    }, {
	title : 'end',
	value : 'end'
    }, {
	title : 'space-around',
	value : 'space-around'
    }, {
	title : 'space-between',
	value : 'space-between'
    } ];

    scope.perpendicularAlignments = [ {
	title : 'none',
	value : 'none'
    }, {
	title : 'start',
	value : 'start'
    }, {
	title : 'center',
	value : 'center'
    }, {
	title : 'end',
	value : 'end'
    }, {
	title : 'stretch',
	value : 'stretch'
    }, ]
});
