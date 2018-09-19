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
//describe('Dirctive wb-setting-page', function () {
//
//	// load the service's module
//	beforeEach(module('am-wb-core'));
//
//	var $compile;
//	var $rootScope;
//
//
//	// Store references to $rootScope and $compile
//	// so they are available to all tests in this describe block
//	beforeEach(inject(function(_$compile_, _$rootScope_){
//		// The injector unwraps the underscores (_) from around the parameter names when matching
//		$compile = _$compile_;
//		$rootScope = _$rootScope_;
//	}));
//
//
//
//	it('should load setting of description', function () {
//		var wbModel = {};
//		var $scope = $rootScope.$new();
//		$scope.wbModel = wbModel;
//
//		var src = '<wb-setting-page ng-model="wbModel" wb-type="description"></wb-setting-page>';
//		var element = $compile(src)($scope);
//
//		// fire all the watches, so the scope expression {{1 + 1}} will be evaluated
//		$rootScope.$digest();
//
//		// Check that the compiled element contains the templated content
////		expect(element.html()).toContain("lidless, wreathed in flame, 2 times");
//		expect(element).not.toBe(null);
//	});
//});
