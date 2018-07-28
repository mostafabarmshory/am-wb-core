/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


angular.module('am-wb-core')

        /**
         * @ngdoc directive
         * @name wbUiSettingColor
         * @memberof am-wb-core
         * @description a setting section to set color.
         *
         */
        .directive('wbUiSettingBackgroundRepeat', function () {
            return {
                templateUrl: 'views/directives/wb-ui-setting-background-repeat.html',
                restrict: 'E',
                replace: true,
                scope: {
                    title: '@title',
                    value: '=value',
                }
                ,
                controller: function ($scope) {
                    $scope.items = [
                        { name: 'Repeat', value: 'repeat' },
                        { name: 'Repeat-x', value: 'repeat-x' },
                       { name: 'Repeat-y', value: 'repeat-y' },
                       { name: 'No-repeat', value: 'no-repeat' },
                       { name: 'Space', value: 'space' },
                       { name: 'Round', value: 'round' },
                       { name: 'Initial', value: 'initial' },
                       { name: 'Inherit', value: 'inherit' },
                       { name: 'Nothing', value: '' }
                                                                       
                    ];

                }
            };
        });