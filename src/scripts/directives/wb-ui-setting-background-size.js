/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


/**
 * Created by mgh on 2/26/17.
 */
angular.module('am-wb-core')

        /**
         * @ngdoc directive
         * @name wbUiSettingColor
         * @memberof am-wb-core
         * @description a setting section to set color.
         *
         */
        .directive('wbUiSettingBackgroundSize', function () {
            return {
                templateUrl: 'views/directives/wb-ui-setting-background-size.html',
                restrict: 'E',
                scope: {
                    title: '@title',
                    value: '=value',
                }
                ,
                controller: function ($scope) {
                    $scope.backgroundsizes = [
                        "auto",
                        "length",
                        "cover",
                        "contain",
                        "initial",
                        "inherit"
                    ];

                }
            };
        });
