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
//  $mdThemingProvider.theme('default')
//  .backgroundPalette('blue')
//  .warnPalette('red')
//  .primaryPalette('pink')
//  .accentPalette('orange');
})


/**
 * Load widgets
 */
.run(function($wbUi, $widget, $window) {
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


    for(var i = 0; i < 10; i++){
        // HTML text
        $widget.newWidget({
            // widget description
            type: 'HtmlText-'+i,
            title : 'HTML text',
            description : 'An HTML block which is used to test widgets explorer. Do not use in real usage	.',
            icon : 'wb-widget-html',
            groups: ['test', 'test'+i],
            model : {
                text : '<h2>HTML Text</h2><p>Insert HTML text heare</p>',
            },
            // functional properties
            templateUrl : 'views/widgets/wb-html.html',
            help : 'http://dpq.co.ir',
            setting:['text'],
            helpId: 'test'+i
        });
    }

    /**
     * Show help
     * 
     * By adding a function into the $window service, you can display help of
     * an widget
     */
    $window.openHelp = function (object){
        alert('Adding openHelp to $window to display help:'+object.helpId);
    }
})


.controller('ConstSheetTestCtrl', function($scope){
    function answer(){
        var values = [];
        for(var i = 0; i < $scope.x; i ++){
            var data = [];
            for(var j = 0; j < $scope.y; j++){
                data.push(Math.random());
            }
            values.push(data);
        }
        return {
            key: 'constant sheet',
            values:values
        }
    }
    
    $scope.x = 4; 
    $scope.y = 4;
    $scope.answer = answer;
})
/**
 * Load default resources
 */
.run(function($resource) {
    $resource.newPage({
        type : 'wb-sheet2',
        icon: 'border_all',
        label : 'Cunstant sheet',
        template : '<div>Random sheet: ({{x}}, {{y}})</div>',
        controller : 'ConstSheetTestCtrl',
        tags : [ 'data' ]
    });
    $resource.newPage({
        type : 'wb-sheet3',
        icon: 'face',
        label : 'Cunstant sheet#3',
        template : '<div>Random sheet: ({{x}}, {{y}})</div>',
        controller : 'ConstSheetTestCtrl',
        tags : [ 'data' ]
    });
});
