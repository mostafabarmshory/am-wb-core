/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict';

angular.module('ngMaterialWeburger')

    /**
     * @ngdoc directive
     * @name wbWidget
     * @memberof ngMaterialWeburger
     * @description Widgets container
     *
     * This is widget containers.
     *
     * All primary actions of a widget are supported (such as remove and setting).
     */
    .directive('wbUiChoose', function () {
        return {
            templateUrl: 'views/directives/wb-ui-choose.html',
            restrict: 'E',
            scope: {
                items: '=items',
                selected: '=selected'
            },
            link: function (scope, element, attrs, ctrl, transclude) {

            },
            controller: function ($scope, $element, $settings, $widget) {
                $scope.selectedIndex = 0;
                if ($scope.selected != null)
                    for (var item in $scope.items) {
                        if (item.value == $scope.selected)
                            $scope.selectedIndex = $scope.items.indexOf(item);
                    }
                else
                    $scope.selected = $scope.items[0].value;

                // listen to active tab and update selected attribute.
                $scope.$watch('selectedIndex', function (current, old) {
                    $scope.selected = $scope.items[current].value;
                });
            }
        };
    });
