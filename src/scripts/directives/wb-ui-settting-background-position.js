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
                    value: '=value',
                }
                ,
                controllerAs: 'ctrl',
                controller: function DemoCtrl($timeout, $q) {
                    var self = this;
                    self.simulateQuery = false;
                    self.isDisabled = false;

                    // list of `state` value/display objects
                    self.states = loadAll();
                    self.querySearch = querySearch;
                    self.newState = newState;

                    function newState(state) {
                        alert("Sorry! You'll need to create a Constitution for " + state + " first!");
                    }

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