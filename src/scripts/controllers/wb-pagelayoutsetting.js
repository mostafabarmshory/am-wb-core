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
angular

/**
 * 
 * @date 2016
 * @author mgh
 */
.module('am-wb-core')

.controller('WbPageLayoutWbSettingsCtrl', function($scope, $settings) {
    var wbModel = $scope.wbModel;
    if (!wbModel.style) {
	wbModel.style = {};
    }
    $scope.flexDirection = [ {
	title : 'row',
	icon : 'wb-vertical-boxes',
	value : 'wb-flex-row'
    }, {
	title : 'column',
	icon : 'wb-horizontal-boxes',
	value : 'wb-flex-column'
    } ];

    $scope.justifyContent = [ {
	title : 'Start',
	icon : 'looks_one',
	value : 'wb-flex-justify-content-start'
    }, {
	title : 'End',
	icon : 'looks_two',
	value : 'wb-flex-justify-content-end'
    }, {
	title : 'Center',
	icon : 'looks_3',
	value : 'wb-flex-justify-content-center'
    }, {
	title : 'Space Around',
	icon : 'looks_4',
	value : 'wb-flex-justify-content-space-around'
    }, {
	title : 'Space Between',
	icon : 'looks_5',
	value : 'wb-flex-justify-content-space-between'
    } ];

    $scope.alignItems = [ {
	title : 'Stretch',
	icon : 'looks_one',
	value : 'wb-flex-align-items-stretch'
    }, {
	title : 'Start',
	icon : 'looks_two',
	value : 'wb-flex-align-items-start'
    }, {
	title : 'End',
	icon : 'looks_3',
	value : 'wb-flex-align-items-end'
    }, {
	title : 'Center',
	icon : 'looks_4',
	value : 'wb-flex-align-items-center'
    } ];
});
