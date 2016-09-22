/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')


/**
 * @ngdoc directive
 * @name ngMaterialExtension.directive:mdeIconfontChoise
 * @description # mdeIconfontChoise
 */
.directive(
		'mdeIconfontChoise',
		function() {
			return {
				restrict : 'E',
				replace : 'true',
				templateUrl : 'views/directives/mdeiconfontchoise.html',
				require : '^mdeModel',
				scope : {
					mdeModel : '=',
					mdeFontSet : '@?',
					mdeListUrl : '@?'
				},
				controller : function($scope, $http, $q, $timeout, $log) {
					var self = $scope;
					self.mdeList = [];
					/**
					 * Search for icon... use $timeout to simulate remote
					 * dataservice call.
					 */
					function querySearch(query) {
						var deferred = $q.defer();
						$timeout(function() {
							var results = query ? self.mdeList
									.filter(createFilterFor(query))
									: self.mdeList;
							deferred.resolve(results);
						}, Math.random() * 100, false);
						return deferred.promise;
					}

					function searchTextChange(text) {
						$log.info('Text changed to ' + text);
					}

					function selectedItemChange(item) {
						$log.info('Item changed to ' + JSON.stringify(item));
						$scope.mdeModel = item;
					}
					
					/**
					 * Build `states` list of key/value pairs
					 */
					function loadAll() {
						$scope.state = 'loading';
						return $http.get($scope.mdeListUrl).then(function(res) {
							$scope.mdeList = res.data;
							$scope.state = 'normal';
						});
					}
					/**
					 * Create filter function for a query string
					 */
					function createFilterFor(query) {
						var lowercaseQuery = angular.lowercase(query);
						return function filterFn(state) {
							return (state.indexOf(lowercaseQuery) === 0);
						};
					}

					// list of `state` value/display objects
					loadAll();
					self.querySearch = querySearch;
					self.selectedItemChange = selectedItemChange;
					self.searchTextChange = searchTextChange;
				}
			};
		});
