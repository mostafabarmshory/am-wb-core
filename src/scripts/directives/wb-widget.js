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
///**
// * @ngdoc Directives
// * @name wbWidget
// * @description Widgets container
// * 
// * This is widget containers.
// * 
// * All primary actions of a widget are supported (such as remove and setting).
// * 
// * @deprecated
// */
//.directive('wbWidget', function($wbUtil) {
//	function postLink($scope, $element, $attrs, $ctrls, $transclude) {
//		// Modify angular transclude function
//		// see:
//		// http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
//		// FIXME: maso, 2017: use regular dom insted of ng-transclude
//		$transclude($scope, function(clone/*, $scope*/) {
//			if(clone){
//				$element.append(clone);
//			}
//		});
//
//		// set wbGroup
//		var group = $ctrls[1];
//		$scope.group = group;
//	}
//
//
//	return {
//		templateUrl : 'views/directives/wb-widget.html',
//		restrict : 'E',
//		replace : true,
//		transclude: true,
//		link : postLink,
//		controller : 'wbWidgetCtrl',
//		controllerAs: 'ctrl',
//		require:['wbWidget', '^^wbGroup', 'ngModel']
//	};
//});