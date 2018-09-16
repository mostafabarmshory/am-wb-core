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
 * @ngdoc directive
 * @name wbUiSettingColor
 * @memberof am-wb-core
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingBackgroundPosition', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-background-position.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value'
		},
		controllerAs: 'ctrl',
		controller: function DemoCtrl($timeout, $q) {
			var self = this;
			self.simulateQuery = false;
			self.isDisabled = false;

			// list of `state` value/display objects
			self.states = loadAll();
			self.querySearch = querySearch;

			function newState(state) {
				alert('Sorry! You`ll need to create a Constitution for ' + state + ' first!');
			}
			self.newState = newState;

			// ******************************
			// Internal methods
			// ******************************

			/**
			 * Search for states... use $timeout to simulate
			 * remote dataservice call.
			 */
			function querySearch(query) {
				var results = query ? self.states.filter(createFilterFor(query)) : self.states,
						deferred;
				if (self.simulateQuery) {
					deferred = $q.defer();
					$timeout(function () {
						deferred.resolve(results);
					}, Math.random() * 1000, false);
					return deferred.promise;
				} else {
					return results;
				}
			}

			/**
			 * Build `states` list of key/value pairs
			 */
			function loadAll() {
				return[
					{display: 'Left top', value: 'left top'},
					{display: 'Left center', value: 'left center'},
					{display: 'Left bottom', value: 'left bottom'},
					{display: 'Right top', value: 'right top'},
					{display: 'Right center', value: 'right center'},
					{display: 'Center top', value: 'center top'},
					{display: 'Center center', value: 'center center'},
					{display: 'Center bottom', value: 'center bottom'},
					{display: 'Initial', value: 'initial'},
					{display: 'Inherit', value: 'inherit'},
					{display: 'Nothing', value: ''}
					];
			}

			/**
			 * Create filter function for a query string
			 * @param {string} query to filter items 
			 */

			function createFilterFor(query) {
				var lowercaseQuery = query.toLowerCase();

				return function (state) {
					return (state.value.indexOf(lowercaseQuery) === 0);
				};

			}

		}
	};
});