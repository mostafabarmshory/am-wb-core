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

/**
 * @ngdoc module
 * @name ngDonate
 * @description
 * 
 */
angular.module('am-wb-coreTest', [ 'am-wb-core' ])//
.controller('MyTestCtrl', function($scope, $http, $mdDialog) {
	$http.get('examples/empty.json')
	.then(function(res) {
		$scope.model = res.data;
	});
})

.config(function($mdThemingProvider) {
	  $mdThemingProvider.theme('default')
	  	.backgroundPalette('blue')
	  	.warnPalette('red')
	    .primaryPalette('pink')
	    .accentPalette('orange');
})


/**
 * Load widgets
 */
.run(function($wbUi) {
	// Page
	$wbUi
	.newTemplate({
		name : 'Blank page',
		thumbnail : 'images/html.svg',
		template: '{}',
		priority: 1000
	})
	.newTemplate({
		name : 'Test template2',
		thumbnail : 'images/brandaction.svg',
		templateUrl: 'resources/templates/test-en.json',
		language: 'en',
		priority: 100
	})
	.newTemplate({
		name : 'Test template3',
		thumbnail : 'images/brandaction.svg',
		templateUrl: 'resources/templates/test-fa.json',
		language: 'fa',
		priority: 100
	});
});