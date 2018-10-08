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
         * @name wbUiSettingLength
         */
        .directive('wbUiSettingLength', function () {

            function postLink($scope, $element, $attrs, ngModel) {
                ngModel.$render = function () {
                    pars(ngModel.$modelValue);
                };
                var types = $scope.extraValues;
                
                // Add all length by default
                var lengthValues = ['px', '%', 'em', 'vh'];
                types = types.concat(lengthValues);
                
                if (types.includes('length')) {
                    var index = types.indexOf('length');
                    types.splice(index, 1);
                }

                $scope.types = types;

                function pars(value) {
                    if (!value) {
                        $scope.internalUnit = types[0];
                        $scope.internalValue = 0;
                    } else {
                        split(value);
                    }

                    $scope.$watch(function () {
                        if ($scope.extraValues.includes($scope.internalUnit)) {
                            return $scope.internalUnit;
                        }
                        return $scope.internalValue + $scope.internalUnit;
                    }, function (newValue) {
                        ngModel.$setViewValue(newValue);
                    });
                }

                /*
                 * @param {type} val
                 * @returns {undefined}
                 * decsription  Splite value to 'unit' and 'value'
                 */
                function split(val) {
                    if ($scope.extraValues.includes(val)) {
                        $scope.internalUnit = val;
                    } else {
                        /*
                         * A regex which groups the val into the value and unit(such as 10px -> 10 , px).
                         * This regex also support signed float format such as (+10.75%, -100.76em)
                         */
                        var regex = /^([+-]?\d+\.?\d*)([a-zA-Z%]*)$/;
                        var matches = regex.exec(val);
                        $scope.internalValue = Number(matches[1]);
                        $scope.internalUnit = matches[2];
                    }
                }
            }

            return {
                templateUrl: 'views/directives/wb-ui-setting-length.html',
                restrict: 'E',
                replace: true,
                scope: {
                    title: '@title',
                    icon: '@?',
                    description: '@?', 
                    extraValues: '=?'
                },
                /*
                 * @ngInject
                 */
                controller: function ($scope) {
                    /**
                     * Check if the current unit is a numerical
                     */
                    this.isNumerical = function () {
                        return angular.isArray($scope.extraValues) && !$scope.extraValues.includes($scope.internalUnit);
                    };

                },
                controllerAs: 'ctrl',
                link: postLink,
                require: 'ngModel'
            };
        });
