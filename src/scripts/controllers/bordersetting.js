'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc function
 * @name WbBorderSettingCtrl
 * @description # WbBorderSettingCtrl Controller of the ngMaterialWeburger
 */
.controller('WbBorderSettingCtrl', function($scope) {
    var scope = $scope;
    var model = $scope.mdeModel;

    scope.styles = [ {
	title : 'No Border',
	value : 'none'
    }, {
	title : 'Solid',
	value : 'solid'
    }, {
	title : 'Dotted',
	value : 'dotted'
    }, {
	title : 'Dashed',
	value : 'dashed'
    }, {
	title : 'Double',
	value : 'double'
    }, {
	title : 'Groove',
	value : 'groove'
    }, {
	title : 'Ridge',
	value : 'ridge'
    }, {
	title : 'Inset',
	value : 'inset'
    }, {
	title : 'Outset',
	value : 'outset'
    } ];

    //
    // scope.radiuses=[
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.topLeft
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.topRight
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.bottomLeft
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.bottomRight
    // }
    // ];

});
