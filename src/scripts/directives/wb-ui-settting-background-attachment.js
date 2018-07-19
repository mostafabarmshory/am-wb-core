angular.module('am-wb-core')

        /**
         * @ngdoc directive
         * @name wbUiSettingColor
         * @memberof am-wb-core
         * @description a setting section to set color.
         *
         */
        .directive('wbUiSettingBackgroundAttachment', function () {
            return {
                templateUrl: 'views/directives/wb-ui-setting-background-attachment.html',
                restrict: 'E',
                scope: {
                    title: '@title',
                    value: '=value',
                }
                ,
                controller: function ($scope) {
                    $scope.items = [
                        {name: 'Scroll', value: 'scroll'},
                        {name: 'Fixed', value: 'fixed'},
                        {name: 'Local', value: 'local'},
                        {name: 'Initial', value: 'initial'},
                        {name: 'Inherit', value: 'inherit'},
                        {name: 'Nothing', value: ''}
                    ];

                }
            };
        });