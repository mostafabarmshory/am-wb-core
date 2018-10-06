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
         * @name wbUiMainSetting
         * @description 
         * 
         */
        .directive('wbUiMainSetting', function () {

            function postLink($scope, $element, $attrs, ngModel) {
                ngModel.$render = function () {
                    pars(ngModel.$modelValue);
                };
                var types = $scope.$eval($attrs.inputTypes);
                if (types.includes('length')) {

                    var index = types.indexOf('length');
                    types.splice(index, 1);

                    var lengthValues = ['px', '%', 'em', 'vh'];
                    types = types.concat(lengthValues);
                }

                $scope.types = types;

                function pars(value) {
                    $scope.lengthValues = lengthValues;
                    if(!value) {
                        $scope.internalUnit = types[0];
                        $scope.intenalValue = 0;
                    }
                    //TODO: for example 15px should splite to 15 and px.
                    $scope.$watch(function(){
                        return $scope.internalValue + $scope.internalUnit;
                    } , function(newValue) {
                        ngModel.$setViewValue(newValue);
                    });
                }
            }

            return {
                templateUrl: 'views/directives/wb-ui-main-setting.html',
                restrict: 'E',
                replace: true,
                scope: {
                    title: '@title',
                    input_types: '=input_types'
                },
                /*
                 * @ngInject
                 */
                controller: function ($scope) {


                },
                link: postLink,
                require: 'ngModel'
            };
        });
