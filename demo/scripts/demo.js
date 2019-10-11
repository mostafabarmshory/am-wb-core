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
angular.module('am-wb-coreTest', [ 'am-wb-core', 'jsonFormatter',])//
.controller('MyTestCtrl', function($scope, $http, $mdDialog, $widget, $wbUtil, $wbWindow, WidgetLocatorManager) {

	var ctrl = this;
	var dialogs = {};
	/*
	 * Display an area of a widget with extra informations. It must be set to
	 * visible.
	 */
	var widgetLocator = new WidgetLocatorManager({
		anchor: '#demo-anchor'
	});
	this.widgetLocator = widgetLocator;


//	$http.get('examples/window.json')
//	$http.get('examples/widgets.json')
	$http.get('examples/html.json')
//	$http.get('examples/map.json')
//	$http.get('examples/iframe-responsive.json')
	.then(function(res) {
		// NOTE: maso, 2018: clean data model
		$scope.model = $wbUtil.clean(res.data);
	});

	// load setting of model
	$scope.loadSettings = function($event){
		widgetLocator.setSelectedWidgets($event.widgets || []);
		// TODO: maso, 2018: support list of widget in settings too
		var widgets = $event.widgets;
		if(widgets.length) {
			var widget =  widgets[0];
			if(widget.isRoot()){
				widgetLocator.setRootWidget(widget);
			}
			$scope.selectedWidget = widget;
		} else {
			$scope.selectedWidget = null;
		}
		$scope.selectedWidgets = widgets;
	};


	$scope.runAction= function(action){
		action.action();
	};

	// load widgets
	$widget.widgets().then(function(list){
		$scope.widgets = list.items;
	});


	function openWidgets(){
		if(dialogs.widgets){
			return;
		}
		dialogs.widgets = $wbWindow.open({
			type: 'view',
			title: 'Widgets',
			template:'<wb-widgets-explorer ng-model="widgets" flex></wb-widgets-explorer>',
			parent: $scope,
			controller: function($scope, $wbFloat){
				$scope.$watch('editable', function(value){
					if(value === false) {
						$wbFloat.hide();
					}
				});
			},
		}, 'Widgets', {
			internal: true,
			// Extera options
			panelSize: '400 600',
			position: {
				my: 'right-top',
				at: 'right-top',
				autoposition: 'down',
				offsetX: -5,
				offsetY: 5
			}
		});
	}

	function openSettings(){
		if(dialogs.settings){
			return;
		}
		dialogs.settings = $wbWindow.open({
			type: 'view',
			title: 'Settings',
			template:'<wb-setting-panel-group wb-tab-mode ng-model="model" flex></wb-setting-panel-group>',
			parent: $scope,
			controller: function($scope, $wbFloat){
				$scope.$watch('editable', function(value){
					if(value === false) {
						$wbFloat.hide();
					}
				});
				$scope.$watch('selectedWidget', function(value){
					$scope.model = value;
				});
			}
		}, 'Settings', {
			internal: true,
			// Extera options
			position: {
				my: 'left-top',
				at: 'left-top',
				autoposition: 'down',
				offsetX: -5,
				offsetY: 5
			}
		});
		dialogs.settings1 = $wbWindow.open({
			type: 'view',
			title: 'Settings (tabs)',
			template:'<wb-setting-panel-group ng-model="model" flex></wb-setting-panel-group>',
			parent: $scope,
			controller: function($scope, $wbFloat){
				$scope.$watch('editable', function(value){
					if(value === false) {
						$wbFloat.hide();
					}
				});
				$scope.$watch('selectedWidget', function(value){
					$scope.model = value;
				});
			}
		}, 'Settings', {
			internal: true,
			// Extera options
			position: {
				my: 'left-top',
				at: 'left-top',
				autoposition: 'down',
				offsetX: -5,
				offsetY: 5
			}
		});
		
		
	}

	function openEvents(){
		if(dialogs.events){
			return;
		}
		dialogs.events = $wbWindow.open({
			type: 'view',
			title: 'Events',
			template:'<wb-event-panel ng-model="model"></wb-event-panel>',
			parent: $scope,
			controller: function($scope, $wbFloat){
				$scope.$watch('editable', function(value){
					if(value === false) {
						$wbFloat.hide();
					}
				});
				$scope.$watch('selectedWidget', function(value){
					$scope.model = value;
				});
			}
		}, 'Events', {
			internal: true,
			// Extera options
			position: {
				my: 'left-top',
				at: 'left-top',
				autoposition: 'down',
				offsetX: -5,
				offsetY: 5
			}
		});
	}

	function openContent(){
		if(dialogs.content){
			return;
		}
		dialogs.content = $wbWindow.open({
			type: 'view',
			title: 'Content',
			template:'<json-formatter json="model" open="1"></json-formatter>',
			parent: $scope,
			controller: function($scope, $wbFloat){
				$scope.$watch('editable', function(value){
					if(value === false) {
						$wbFloat.hide();
					}
				});
				$scope.$watch('selectedWidget', function(value){
					$scope.model = value;
				});
			},
		}, 'Content', {
			internal: true,
			// Extera options
			position: {
				my: 'left-top',
				at: 'left-top',
				autoposition: 'down',
				offsetX: -5,
				offsetY: 5
			}
		});
	}

	$scope.$watch('editable', function(value) {
		if(value && !widgetLocator.isEnable()){
			widgetLocator.setEnable(true);
			openWidgets();
			openSettings();
			openContent();
			openEvents();
		}
		widgetLocator.setVisible(value);
	});

	$scope.actions = [{
		icon: 'delete',
		action: function(){
			var widgets = $scope.selectedWidgets || [];
			for(var i = 0; i < widgets.length; i++){
				widgets[i].delete();
			}
			$scope.selectedWidgts= [];
		}
	}];
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


