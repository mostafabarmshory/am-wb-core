angular.module('am-wb-core')

        /**
         * @ngdoc directive
         * @name wbUiSettingColor
         * @memberof am-wb-core
         * @description a setting section to set color.
         *
         */
        .directive('wbUiSettingBackgroundOrigin', function () {
            return {
                templateUrl: 'views/directives/wb-ui-setting-background-origin.html',
                restrict: 'E',
                scope: {
                    title: '@title',
                    value: '=value',
                }
                ,
                controller: function ($scope) {
                    $scope.items = [
                        {name: 'Padding-box', value: 'padding-box'},
                        {name: 'Border-box', value: 'border-box'},
                        {name: 'Content-box', value: 'content-box'},
                        {name: 'No-repeat', value: 'no-repeat'},
                        {name: 'Initial', value: 'initial'},
                        {name: 'Inherit', value: 'inherit'},
                        {name: 'Nothing', value: ''}
                    ];

                }
            };
        });