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
 * @ngdoc Services
 * @name $widget
 * @memberof am-wb-core
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function(
		$wbUtil,
		$q, $sce, $templateRequest, $compile, $controller) {

	var _group_repo = [];
	var contentElementAsso = [];
	var elementKey = [];
	
	var notFoundWidget = {
			templateUrl : 'views/widgets/wb-notfound.html',
			label : 'Not found',
			description : 'Element not found'
	};
	var container = {
			type : 'Page',
			label : 'Page',
			description : 'Panel contains list of widgets.',
			image : 'images/wb/content.svg'
	};
	
	function _group(groupId){
		for(var i = 0; i < _group_repo.length; i++){
			if(_group_repo[i].id === groupId){
				return _group_repo[i];
			}
		}
		var group = {
				id: groupId
		};
		_group_repo.push(group);
		return group;
	}

	function _newGroup(group){
		var g = _group(group.id);
		angular.extend(g, group);
	}
	
	function _groups(){
		return _group_repo;
	}

	function _widget(model){
		if (model.type in contentElementAsso) {
			return contentElementAsso[model.type];
		}
		if (model.type === 'Page') {
			return container;
		}
		return notFoundWidget;
	}
	/**
	 * Finds a widget related to the input model.
	 * 
	 * Widget type is stored in the widget data model. This function get the
	 * model type from the input data type and return related widget.
	 * 
	 * NotFoundElement widget is returned if the widget type is not found.
	 * 
	 * @memberof $widget
	 * @param model to find a widget
	 * @returns promise to find a widget
	 */
	function widget(model) {
		return $q.when(_widget(model));
	}

	/**
	 * Returns list of all registerd widgets.
	 * 
	 * @memberof $widget
	 * @returns promise to load all widgets
	 */
	function widgets() {
		var widgets = {};
		// XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
		widgets.items = [];
		elementKey.forEach(function(type) {
			widgets.items.push(contentElementAsso[type]);
		});
		return $q.when(widgets);
	}
	
	/**
	 * List of all registered widgets
	 * 
	 * @memberof $widget
	 * @returns keys {array} list of all keys
	 */
	function getWidgetsKey(){
		return elementKey;
	}

	/**
	 * Registers new widget
	 * 
	 * @See the following page for more information:
	 * 
	 *    https://gitlab.com/weburger/angular-material-weburger/wikis/create-new-widget
	 * 
	 * @memberof $widget
	 * @param widget to add
	 * @return the service
	 */
	function newWidget(widget) {
		if (widget.type in contentElementAsso) {
			// XXX: maso, 2017: throw exception
			return;
		}
		// fix widget data
		widget.model = widget.model || {style:{}};
		widget.model.type = widget.type;
		widget.model.name = widget.model.name || widget.title; 
		
		contentElementAsso[widget.type] = widget;
		elementKey.push(widget.type);
		return this;
	}

	/**
	 * Compile element 
	 * 
	 * @name show
	 * @memberof $wbFloat
	 * @param optionsOrPreset
	 *            {object}
	 *            <ul>
	 *            <li>templateUrl - {string=}: The URL of a template that will
	 *            be used as the content of the dialog.</li>
	 *            <li>template- {string=}: HTML template to show in the dialog.
	 *            This must be trusted HTML with respect to Angular's $sce
	 *            service. This template should never be constructed with any
	 *            kind of user input or user data.</li>
	 *            <li>contentElement:</li>
	 *            <li>scope - {object=}: the scope to link the template
	 *            controller to. If none is specified, it will create a new
	 *            isolate scope. This scope will be destroyed when the dialog is
	 *            removed unless preserveScope is set to true.</li>
	 *            <li>controller - {function|string=}: The controller to
	 *            associate with the dialog. The controller will be injected
	 *            with the local $mdDialog, which passes along a scope for the
	 *            dialog.</li>
	 *            <li>controllerAs - {string=}: An alias to assign the
	 *            controller to on the scope.</li>
	 *            <li>parent - {element=}: The element to append the dialog to.
	 *            Defaults to appending to the root element of the application.</li>
	 *            </ul>
	 * @param parenScope
	 * @return promise A promise that resolve created element
	 */
	function compile(model, parenScope, parentElement){
		var widget = _widget(model);
		var childScope = null;
		var element = null;

		// 1- create scope
		childScope = parenScope.$new(false, parenScope);
		childScope.wbModel = model;

		// 2- create element
		return $q.when($wbUtil.getTemplateFor(widget))//
		.then(function(template) {
			if (model.type !== 'Group') {
				template = '<wb-widget ng-model="wbModel">' + template + '</wb-widget>';
			}
			element = angular.element(template);
			if(parentElement) {
				parentElement.append(element);
			}
			// 3- bind controller
			var link = $compile(element);
			if (angular.isDefined(widget.controller)) {
				var locals = {
						// TODO: maso, 2017: bind wbModel, wbParent,
						// and wbEditable
						$scope : childScope,
						$element : element
				};
				var controller = $controller(widget.controller, locals);
				if (widget.controllerAs) {
					childScope[widget.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
			}
			link(childScope);
			return element;
		});
	}
	
	/**
	 * Creates new serialized data of widget
	 * 
	 * @memberof $wbFloat
	 * @param widget
	 * @returns
	 */
	function widgetData(widget){
		return angular.copy(widget.model);
	}
	
	// widgets
	this.newWidget = newWidget;
	this.widget = widget;
	this.widgets = widgets;
	this.widgetData = widgetData;
	this.getWidgetsKey = getWidgetsKey;
	
	// widget groups
	this.group = _group;
	this.groups = _groups;
	this.newGroup = _newGroup;
	
	// utils
	this.compile = compile;
});
