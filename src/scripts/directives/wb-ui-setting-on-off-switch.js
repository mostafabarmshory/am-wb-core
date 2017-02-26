/**
 * Created by mgh on 2/26/17.
 */
angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbUiSettingOnOffSwitch
     * @memberof ngMaterialWeburger
     * @description a setting section for on/off switch.
     *
     */
    .directive('wbUiSettingOnOffSwitch', function () {
        return {
            templateUrl: 'views/directives/wb-ui-setting-on-off-switch.html',
            restrict: 'E',
            scope: {
                title: '@title',
                value: '=value',
                icon: '@icon'
            }
        };
    });
