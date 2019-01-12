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
 * @name wbUiSettingColor
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingLink', function ($resource) {

    function postLink(scope, element, attr, ctrls) {
        var ngModelCtrl = ctrls[0];

        ngModelCtrl.$render = function () {
            scope.url = ngModelCtrl.$modelValue;
        };

        scope.urlChanged = function (url) {
            ngModelCtrl.$setViewValue(url);
        };
    }

    return {
        templateUrl: 'views/directives/wb-ui-setting-link.html',
        restrict: 'E',
        replace: true,
        scope: {
            title: '@title',
            icon: '@icon'
        },
        require: ['ngModel'],
        link: postLink,
        controllerAs: 'ctrl',
        /*
         * @ngInject
         */
        controller: function($scope){
            this.selectlink = function(){
                $resource.get('url', {
                    style: {
                        icon: 'link',
                        title: 'Link',
                        description: 'Select url'
                    },
                    data: $scope.url
                })//
                .then(function(value){
                    $scope.url = value;
                    $scope.urlChanged(value);
                });
            };
        }
    };
});
