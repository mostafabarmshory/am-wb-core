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
 * @ngdoc function
 * @name WbBorderSettingCtrl
 * @description # WbBorderSettingCtrl Controller of the ngMaterialWeburger
 */
.controller('WbBorderSettingCtrl', function($scope) {
    var scope = $scope;
    var model = $scope.wbModel;

    scope.styles = [ {
	title : 'No Border',
	value : 'none'
    }, {
	title : 'Solid',
	value : 'solid'
    }, {
	title : 'Dotted',
	value : 'dotted'
    }, {
	title : 'Dashed',
	value : 'dashed'
    }, {
	title : 'Double',
	value : 'double'
    }, {
	title : 'Groove',
	value : 'groove'
    }, {
	title : 'Ridge',
	value : 'ridge'
    }, {
	title : 'Inset',
	value : 'inset'
    }, {
	title : 'Outset',
	value : 'outset'
    } ];

    //
    // scope.radiuses=[
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.topLeft
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.topRight
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.bottomLeft
    // },
    // {
    // title:'Top-Left: ',
    // model:$scope.mdeModel.style.borderRadius.bottomRight
    // }
    // ];

});
