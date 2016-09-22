'use strict';

angular.module('ngMaterialExtension')
/**
 * @ngdoc function
 * @name ngMaterialExtension.controller:BordersettingCtrl
 * @description # BordersettingCtrl Controller of the ngMaterialExtension
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
