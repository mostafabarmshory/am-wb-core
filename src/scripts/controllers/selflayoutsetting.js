/**
 * Created by mgh on 8/10/2016.
 */


/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */

'use strict';
angular.module('ngMaterialExtension')

    .controller('SelfLayoutSettingsCtrl', function($scope, $settings) {
        var scope = $scope;

        scope.flexAlignItem = [
            {
            title : 'auto',
            value : 'mde-flex-item-auto'
        },  {
            title : 'Start',
            value : 'mde-flex-item-start'
        }, {
            title : 'End',
            value : 'mde-flex-item-end'
        }, {
            title : 'Center',
            value : 'mde-flex-item-center'
        }, {
            title : 'stretch',
            value : 'mde-flex-item-stretch'
        }];
    });

