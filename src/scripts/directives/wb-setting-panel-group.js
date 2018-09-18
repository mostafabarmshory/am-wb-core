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
.directive('wbSettingPanelGroup', function($settings, $widget, $rootScope, $wbUtil, $compile, $mdTheming, $controller, $q) {

    /**
     * Init settings
     */
    function postLink($scope, $element, $attrs, $ctrls) {

        // Load ngModel
        var ngModelCtrl = $ctrls[0];

        /**
         * encapsulate template srce with panel widget template.
         * 
         * @param page
         *            setting page config
         * @param tempateSrc
         *            setting page html template
         * @returns encapsulate html template
         */
        function _encapsulateSettingPanel(page, templateSrc) {
            // TODO: maso, 2017: pass all paramter to the setting
            // panel.
            var attr = ' ';
            if (page.label) {
                attr += ' label=\"' + page.label + '\"';
            }
            if (page.icon) {
                attr += ' icon=\"' + page.icon + '\"';
            }
            if (page.description) {
                attr += ' description=\"' + page.description + '\"';
            }
            return '<wb-setting-panel ' + attr + '>' + templateSrc + '</wb-setting-panel>';
        }

        function isLoaded(){
            // TODO: check if settings is loaded
            return false;
        }

        var oldScope;

        /**
         * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
         * 
         * @returns
         */
        function loadSetting(model) {
            var jobs = [];
            var pages = [];

            // 0- destroy old resource
            if(isLoaded(model)){
                return;
            }
            if (angular.isDefined(oldScope)) {
                oldScope.$destroy();
            }
            var scope = $rootScope.$new(true, $rootScope);
            scope.wbModel = model;
            oldScope = scope;

            // 2- Clear children
            $element.empty();

            // 3- load pages
            $widget.widget(model)//
            .then(function(w) {
                var widgetSettings = $settings.getSettingsFor(w);
                angular.forEach(widgetSettings, function(type) {
                    var page = $settings.page(type);
                    var job = $wbUtil.getTemplateFor(page)
                    .then(function(templateSrc){
                        templateSrc = _encapsulateSettingPanel(page, templateSrc);
                        var element = angular.element(templateSrc);
                        if (angular.isDefined(page.controller)) {
                            var controller = $controller(page.controller, {
                                $scope : scope,
                                $element : element
                            });
                            if (page.controllerAs) {
                                scope[page.controllerAs] = controller;
                            }
                            element.data('$ngControllerController', controller);
                        }
                        $compile(element)(scope);
                        element.attr('label', page.lable);
                        $mdTheming(element);
                        pages.push(element);
                    });
                    jobs.push(job);
                });
            })
            //
            .then(function() {
                $q.all(jobs)//
                .then(function() {
                    pages.sort(function(a, b) {
                        if (a.attr('label') < b.attr('label')){
                            return -1;
                        }
                        if (a.attr('label') > b.attr('label')){
                            return 1;
                        }
                        return 0;
                    });
                    angular.forEach(pages, function(element) {
                        $element.append(element);
                    });
                });
            });
        }


        ngModelCtrl.$render = function() {
            if(ngModelCtrl.$viewValue) {
                loadSetting(ngModelCtrl.$viewValue);
            }
        };
    }

    function panelController(){
    }

    return {
        restrict : 'E',
        template: '<div></div>',
        scope : {},
        link : postLink,
        controller: panelController,
        controllerAs: 'ctrl',
        require:['ngModel']
    };
});
