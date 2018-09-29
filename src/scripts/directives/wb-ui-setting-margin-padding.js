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

angular.module('am-wb-core')

        /**
         * @ngdoc Directives
         * @name wbUiSettingMarginPadding
         * @author maso<mostafa.barmshory@dpq.co.ir>
         * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
         * @author Masood<masoodzarei64@gmail.com>
         * @description Set length (css based)
         * 
         * @see https://www.w3schools.com/cssref/css_units.asp
         */
        .directive('wbUiSettingMarginPadding', function () {
            return {
                templateUrl: 'views/directives/wb-ui-setting-margin-padding.html',
                restrict: 'E',
                replace: true,
                scope: {
                    title: '@?',
                    value: '=?',
                    icon: '@?',
                    description: '@?'
                },
                /*
                 * @ngInject
                 */
                controller: function ($scope) {
                    if ($scope.value) {
                        var len = $scope.value.length;
                        //extract number from value (value without 'px')
                        $scope.number = $scope.value.slice(0, len - 2);
                    }

                    $scope.$watch('number', function (val) {
                        $scope.value = val + 'px';
                    });
                }
            };
        });
