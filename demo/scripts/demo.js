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

/**
 * @ngdoc module
 * @name ngDonate
 * @description
 * 
 */
angular.module('am-wb-coreTest', [ 'am-wb-core', 'jsonFormatter',])//
.controller('MyTestCtrl', function($scope, $http, $widget, $wbUtil,
        // new model
        WbProcessorLocator, WbProcessorSelect, WbProcessorDnd) {
    'use strict';
    
    var locatorProcessor;
    var selectProcessor;
    var dndProcessor;

    /*
     * Set data model
     */
    this.setDocumentPath = function(path){
        var ctrl = this;
        $http.get(path)
        .then(function(res) {
            ctrl.model = $wbUtil.clean(res.data);
        });
    }

    this.toggleEditable = function(){
        this.editable = !this.editable;
        if(this.editable) {
            this.initEditor();
        }
        this.getRootWidget().setEditable(this.editable);
    };

    this.setRootWidget = function(rootWidget){
        this.rootWidget = rootWidget;
    }

    this.getRootWidget = function(){
        return this.rootWidget;
    }

    this.initEditor = function(){
        if(!locatorProcessor){
            locatorProcessor = new WbProcessorLocator();
            $widget.setProcessor('locator', locatorProcessor);
            locatorProcessor.setEnable(true);
        }
        if(!selectProcessor){
            selectProcessor = new WbProcessorSelect();
            $widget.setProcessor('select', selectProcessor);
            var ctrl = this;
            selectProcessor.on('selectionChange', function(){
                ctrl.selectedWidgets = selectProcessor.getSelectedWidgets();
            });
        }
        
        if(!dndProcessor){
            dndProcessor = new WbProcessorDnd();
            $widget.setProcessor('dnd', dndProcessor);
        }
    }

    this.init = function(){
        var ctrl = this;
        // load widgets
        $widget.widgets()
        .then(function(list){
            ctrl.widgets = list.items;
        });
        
        $scope.actions = [{
            icon: 'delete',
            run: function(){
                var widgets = selectProcessor.getSelectedWidgets();
                for(var i = 0; i < widgets.length; i++){
                    widgets[i].delete();
                }
            }
        },{
            icon: 'edit',
            run: function(){
                ctrl.toggleEditable();
            }
        }];

        
        $scope.$on('$destroy', function(){
            if(locatorProcessor){
                locatorProcessor.setEnable(false);
            }
            if(selectProcessor){
                selectProcessor.setEnable(false);
            }
        });
    };
    
    this.init();
    

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

    $widget.newWidget({
        type: 'hello-button',
        title: 'Hello button',
        description : 'An HTML block which is used to test widgets explorer. Do not use in real usage   .',
        icon : 'wb-widget-html',
        template: '<md-button ng-click="ctrl.hi()">Say Hello</md-button>',
        controller: function(){
            this.hi = function(){
                alert("Hello");
            }
        },
        controllerAs: 'ctrl'
    });

    for(var i = 0; i < 5; i++){
        // HTML text
        $widget.newWidget({
            // widget description
            type: 'HtmlText-'+i,
            title : 'HTML text witloooooooooooong title',
            description : 'An HTML block which is used to test widgets explorer. Do not use in real usage	.',
            icon : 'wb-widget-html',
            groups: ['test', 'test'+i],
            model : {
                text : '<h2>HTML Text</h2><p>Insert HTML text heare</p>'
            },
            // functional properties
            templateUrl : 'views/widgets/wb-html.html',
            help : 'http://dpq.co.ir',
            setting:['text'],
            helpId: 'test'+i
        });
    }
    for(i = 0; i < 5; i++){
        // HTML text
        $widget.newWidget({
            // widget description
            type: 'HtmlText-'+i+5,
            title : 'HTML text ',
            description : 'An HTML block which<br/> is used to test widgets explorer. Do not use in<br/> real usage,real usagereal usagereal<br/> usagereal usagereal usagereal <br/>usagereal usagereal usagereal usagereal usagereal usagereal usagereal usagereal usagereal usagereal usagereal usagereal <br/>usagereal usagereal<br/> usagereal<br/> usagereal usagereal usage	.',
            icon : 'wb-widget-html',
            groups: ['test', 'test'+i],
            model : {
                text : '<h2>HTML Text</h2><p>Insert HTML text heare</p>'
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
     * By adding a function into the $window service, you can display help of an
     * widget
     */
    $window.openHelp = function (object){
        alert('Adding openHelp to $window to display help:'+object.helpId);
    };
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
        };
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
    for(var i = 0; i < 100; i++){
        $resource.newPage({
            type : 'wb-sheet-'+i,
            icon: 'face',
            label : 'Cunstant sheet#3',
            template : '<div layout="column"><md-button ng-repeat="i in [1,2,3,4,5,6,7,8,9,10, 11,12,13,14,15,16,17,18,19,20,21]">Random sheet: ({{x}}, {{y}})</md-button></div>',
            controller : 'ConstSheetTestCtrl',
            tags : [ 'data' ]
        });
    }
});


