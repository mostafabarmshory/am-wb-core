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

/*
 * Setting post link
 */
function settingPostLink($scope, $element, $attrs, $ctrl){
    var ngModelCtrl = $ctrl[0];
    ngModelCtrl.$render = function(){
        $scope.value = ngModelCtrl.$viewValue;
    };
    $scope.$watch('value', function(value){
        ngModelCtrl.$setViewValue(value);
    });
}

/**
 * @ngdoc Controllers
 * 
 * @ngInject
 */
function wbUiSettingGeneralCtrl($scope) {
    var ctrl = this;

    // TODO: maso, 2018:load from user config
    $scope.wbUiSettingClearButton = true;
    $scope.wbUiSettingPreview = true;

    function clearValue(/*$event*/){
        // General option
        $scope.value = null;
    }

    ctrl.clearValue = clearValue;
}


/**
 * @ngdoc Controllers
 * 
 * @ngInject
 */
function wbUiSettingImageCtrl($scope, $resource, $controller){
    var ctrl = this;

    angular.extend(ctrl, $controller('wbUiSettingGeneralCtrl', {
        $scope : $scope
    }));

    function showImagePicker(){
        return $resource.get('image', {
            style: {
                icon: 'image',
                title: 'Select image',
                description: 'Select image from resources.'
            },
            data: $scope.value
        })//
        .then(function(value){
            $scope.value = value;
        });
    }

    ctrl.showImagePicker = showImagePicker;
}


//General options
//- wbUiSettingClearButton 
//- wbUiSettingPreview

angular.module('am-wb-core')
.controller('wbUiSettingGeneralCtrl', wbUiSettingGeneralCtrl)
.controller('wbUiSettingImageCtrl', wbUiSettingImageCtrl)

/**
 * @ngdoc Directives
 * @name wbUiSettingImage
 * @author maso(mostafa.barmshory@dpq.co.ir)
 * @description Set an image into a value
 * 
 * URL of the image is set as result.
 *
 */
.directive('wbUiSettingImage', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-image.html',
        restrict: 'E',
        scope: {
            title: '@title',
            icon: '@icon'
        },
        require:['ngModel'],
        link: settingPostLink,
        controller: 'wbUiSettingImageCtrl',
        controllerAs: 'ctrl'
    };
});
