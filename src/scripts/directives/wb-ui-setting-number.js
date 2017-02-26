/**
 * Created by mgh on 2/26/17.
 */
angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbUiSettingNumber
     * @memberof ngMaterialWeburger
     * @description a setting section to set a number.
     *
     */
    .directive('wbUiSettingNumber', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-number.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon'
            }
        };
    });
