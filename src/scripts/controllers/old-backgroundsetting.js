'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name ngMaterialWeburger.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialWeburger
 */
.controller(
		'OldBackgroundSettingCtrl',
		function($scope) {
			var scope = $scope;
			var model = $scope.mdeModel;


			scope.types = [ {
				title : 'None',
				value : 'none'
			}, {
				title : 'Color',
				value : 'color'
			}];

		});
