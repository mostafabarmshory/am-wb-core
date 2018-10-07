///* 
// * The MIT License (MIT)
// * 
// * Copyright (c) 2016 weburger
// * 
// * Permission is hereby granted, free of charge, to any person obtaining a copy
// * of this software and associated documentation files (the "Software"), to deal
// * in the Software without restriction, including without limitation the rights
// * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// * copies of the Software, and to permit persons to whom the Software is
// * furnished to do so, subject to the following conditions:
// * 
// * The above copyright notice and this permission notice shall be included in all
// * copies or substantial portions of the Software.
// * 
// * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// * SOFTWARE.
// */
//'use strict';
//
//angular.module('am-wb-core')
//
//        /**
//         * @ngdoc Directives
//         * @name wbUiSettingBorderRadius
//         * @author maso<mostafa.barmshory@dpq.co.ir>
//         * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
//         * @author Masood<masoodzarei64@gmail.com>
//         * @description Set border radius (css based)
//         * 
//         * @see https://www.w3schools.com/cssref/css_units.asp
//         */
//        .directive('wbUiSettingBorderRadius', function () {
//            return {
//                templateUrl: 'views/directives/wb-ui-setting-border-radius.html',
//                restrict: 'E',
//                replace: true,
//                scope: {
//                    title: '@?',
//                    value: '=?',
//                    icon: '@?',
//                    description: '@?'
//                },
//                /*
//                 * @ngInject
//                 */
//                controller: function ($scope /*$resource*/) {
//                    /*
//                     * splice the different radious number from value.
//                     * the format of value is: 'ddpx ddpx ddpx ddpx' which d is digit, dd < 100 and px is pixel.
//                     * for example value = '02px 10px 08px 20px'. 
//                     */
////                    if ($scope.value) {
////                        var topLeft = $scope.value.slice(0, 2);
////                        var topRight = $scope.value.slice(5, 7);
////                        var bottomRight = $scope.value.slice(10, 12);
////                        var bottomLeft = $scope.value.slice(15, 17);
////                    }
////
////                    //check if all values are equal
////                    if (topLeft === topRight && bottomLeft === bottomRight && topLeft === bottomLeft) {
////                        $scope.allEqual = true;
////                        $scope.allCorner = topLeft;//or any one.
////                    } else {
////                        $scope.allEqual = false;
////                        $scope.topLeft = topLeft;
////                        $scope.topRight = topRight;
////                        $scope.bottomLeft = bottomLeft;
////                        $scope.bottomRight = bottomRight;
////                    }
////
//                    $scope.$watch('allCorner', function (val) {
//                        $scope.value.all = val;
////                        var str = '';
////                        var newVal = '';
////                        if(val === 'undefined'){
////                            return;
////                        }
////                        if (val < 10) {
////                            val = '0' + val;
////                        }
////                        str = val + 'px';
////                        newVal = str + ' ' + str + ' ' + str + ' ' + str;
////                        $scope.value = newVal;
//                    });
////
////                    /*
////                     * watch all corner radius
////                     */
//                    $scope.$watch('topLeft', function (val) {
//                        $scope.value.topLeft = val;
////                        if(val === 'undefined'){
////                            return;
////                        }
////                        if (val < 10) {
////                            val = '0' + val;
////                        }
////                        topLeft = val;
////                        setRadiusValue();
//                    });
//
//                    $scope.$watch('topRight', function (val) {
//                        $scope.value.topLeft = val;
////                        if(val === 'undefined'){
////                            return;
////                        }
////                        if (val < 10) {
////                            val = '0' + val;
////                        }
////                        topRight = val;
////                        setRadiusValue();
//                    });
//
//                    $scope.$watch('bottomLeft', function (val) {
//                        $scope.value.topLeft = val;
////                        if(val === 'undefined'){
////                            return;
////                        }
////                        if (val < 10) {
////                            val = '0' + val;
////                        }
////                        bottomLeft = val;
////                        setRadiusValue();
//                    });
//
//                    $scope.$watch('bottomRight', function (val) {
//                        $scope.value.topLeft = val;
////                        if(val === 'undefined'){
////                            return;
////                        }
////                        if (val < 10) {
////                            val = '0' + val;
////                        }
////                        bottomRight = val;
////                        setRadiusValue();
//                    });
////
////                    /*
////                     * set $scope.value when the value of each corner radius is changed
////                     */
////                    var setRadiusValue = function () {
////                        $scope.value =
////                                topLeft + 'px' + ' '
////                                + topRight + 'px' + ' '
////                                + bottomRight + 'px' + ' '
////                                + bottomLeft + 'px';
////                    };
//                },
//                controllerAs: 'ctrl'
//            };
//        });