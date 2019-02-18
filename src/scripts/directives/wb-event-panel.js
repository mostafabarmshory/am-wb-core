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
 * @name wb-setting-panel-group
 * @description Widgets settings
 * 
 * Loads list of settings.
 * 
 */
.directive('wbEventPanel', function ($settings, $widget) {
    /**
     * Init settings
     */
    function postLink($scope, $element, $attrs, $ctrls) {
        // Load ngModel
        var ngModelCtrl = $ctrls[0];
        var widget = null;
        var keys = [ 'click', 'mouseout', 'mouseover', 'resize' ];
        var titles = [ 'Click', 'Mouseout', 'Mouseover', 'Resize' ];

        ngModelCtrl.$render = function () {
            if (ngModelCtrl.$viewValue) {
                widget = ngModelCtrl.$viewValue;
                if(angular.isArray(widget) && widget.length > 0){
                	widget = widget[0];
                	loadEvents();
                } else {
                	cleanEvents();
                }
            }
        };

        function cleanEvents(){
        	$scope.events = [];
        }
        
        function loadEvents() {
        	cleanEvents();
            for (var i = 0; i < keys.length; i++) {
                var event = {};
                event.key = keys[i];
                event.title = titles[i];
                event.code = widget.getModelProperty('event.' + event.key);
                $scope.events.push(event);
            }
        }

        function saveEvents() {
            for (var i = 0; i < $scope.events.length; i++) {
                var event = $scope.events[i];
                if (event.code) {
                    widget.setModelProperty('event.' + event.key, event.code);
                } else {
                    widget.setModelProperty('event.' + event.key, undefined);
                }
            }
        }

        /**
         * Save events into the model
         */
        $scope.saveEvents = saveEvents;
    }

    return {
        restrict : 'E',
        replace : true,
        templateUrl : 'views/directives/wb-event-panel.html',
        scope : {},
        link : postLink,
        require : [ 'ngModel' ],
        controllerAs: 'ctrl',
        /*
         * @ngInject
         */
        controller: function($scope, $resource){
            this.editEvent = function(event) {
                $resource.get('js', {
                    data: event.code
                })
                .then(function(value){
                    event.code = value;
                    if(!value){
                        delete event.code;
                    }
                    $scope.saveEvents();
                });
            };

            this.deleteEvent = function(event) {
                delete event.code;
                $scope.saveEvents();
            };
        }
    };
});
