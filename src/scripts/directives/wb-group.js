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
 * @name wb-group
 * @description Render a list of widget
 * 
 */
.directive('wbGroup', function($compile, $widget, $wbUtil, $controller, $settings, $parse) {

    /*
     * Link widget view
     */
    function wbGroupLink($scope, $element, $attrs, $ctrls) {

        // Loads wbGroup
        var ctrl = $ctrls[0];

        // Load ngModel
        var ngModelCtrl = $ctrls[1];
        ngModelCtrl.$render = function() {
            ctrl.setModel(ngModelCtrl.$viewValue);
        };

        /*
         * Watch for editable in root element
         */
        $scope.$watch('wbEditable', function(editable){
            ctrl.setEditable(editable);
        });

        if($scope.wbOnModelSelect) {
            var onModelSelectionFu = $parse($scope.wbOnModelSelect);
            ctrl.on('widgetSelected', function($event){
                var widgets = $event.widgets;
                var locals = {
                        '$event': $event,
                        'widgets': widgets
                };
                if(angular.isArray(widgets) && widgets.length){
                    locals.$model =ctrl.getModel();
                    locals.$ctrl = ctrl;
                }
                $scope.$eval(function() {
                    onModelSelectionFu($scope.$parent, locals);
                });
            });
        }
    }


    return {
        templateUrl : 'views/directives/wb-group.html',
        restrict : 'E',
        replace : true,
        scope : {
            wbEditable : '=?',
            wbOnModelSelect : '@?',
            wbAllowedTypes: '<?',
            wbLocals: '<?'
        },
        link : wbGroupLink,
        controllerAs: 'ctrl',
        controller: 'WbWidgetGroupCtrl',
        require:['wbGroup', 'ngModel']
    };
});
