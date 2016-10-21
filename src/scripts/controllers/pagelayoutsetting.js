/**
 * Created by mgh on 8/4/16.
 */

/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialWeburger')

.controller('PageLayoutSettingsCtrl', function($scope, $settings) {
	var scope = $scope;

	scope.flexDirection = [ {
		title : 'row',
		icon : 'column',
		value : 'mde-flex-row'
	}, {
		title : 'column',
		icon : 'view_agenda',
		value : 'mde-flex-column'
	} ];

	scope.justifyContent = [ {
		title : 'Start',
		value : 'mde-flex-justify-content-start'
	}, {
		title : 'End',
		value : 'mde-flex-justify-content-end'
	}, {
		title : 'Center',
		value : 'mde-flex-justify-content-center'
	}, {
		title : 'Space Around',
		value : 'mde-flex-justify-content-space-around'
	}, {
		title : 'Space Between',
		value : 'mde-flex-justify-content-space-between'
	}];

	scope.alignItems = [{
		title : 'Stretch',
		value : 'mde-flex-align-items-stretch'
	}, {
		title : 'Start',
		value : 'mde-flex-align-items-start'
	}, {
		title : 'End',
		value : 'mde-flex-align-items-end'
	}, {
		title : 'Center',
		value : 'mde-flex-align-items-center'
	}]
});

