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

angular.module('ngMaterialWeburger')

/**
 * @ngdoc service
 * @name $widget
 * @memberof ngMaterialWeburger
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function(
		$q, $sce, $templateRequest, $compile, $controller, $rootScope,
		$timeout, $mdDialog, PaginatorPage) {

	var contentElementAsso = [];
	var elementKey = [];
	var notFoundWidget = {
			templateUrl : 'views/widgets/wb-notfound.html',
			label : 'Not found',
			description : 'Element not found',
	};
	var container = {
			type : 'Page',
			label : 'Page',
			description : 'Panel contains list of widgets.',
			image : 'images/wb/content.svg',
	};

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
	 * @param model
	 * @returns
	 */
	function widget(model) {
		var deferred = $q.defer();
		$timeout(function() {
			deferred.resolve(_widget(model));
		}, 1);
		return deferred.promise;
	}

	/**
	 * Returns list of all registerd widgets.
	 * 
	 * @returns
	 */
	function widgets() {
		var deferred = $q.defer();
		$timeout(function() {
			var widgets = new PaginatorPage({});
			// XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
			widgets.items = [];
			elementKey.forEach(function(type) {
				widgets.items.push(contentElementAsso[type]);
			});
			deferred.resolve(widgets);
		}, 1);
		return deferred.promise;
	}

	/**
	 * Registers new widget
	 * 
	 * @See the following page for more information:
	 * 
	 *    https://gitlab.com/weburger/angular-material-weburger/wikis/create-new-widget
	 * 
	 * @param type
	 * @param model
	 * @returns
	 */
	function newWidget(widget) {
		if (widget.type in contentElementAsso) {
			// XXX: maso, throw exception
			return;
		}
		contentElementAsso[widget.type] = widget;
		elementKey.push(widget.type);
	}

	/**
	 * Selects a widgetd
	 * 
	 * This is an utility method to help a user to select a widget.
	 * 
	 * @param locals
	 * @returns
	 */
	function select(locals) {
		// TODO: maso, 1394: just prepare data for view
		return $mdDialog.show({
			controller : 'WbDialogsCtrl',
			templateUrl : 'views/dialogs/wb-selectwidget.html',
			parent : angular.element(document.body),
			clickOutsideToClose : true,
			fullscreen : true,
			locals : locals,
		});
	}


	/*
	 * get setting page template
	 */
	function getTemplateFor(widget) {
		var template, templateUrl;
		if (angular.isDefined(template = widget.template)) {
			if (angular.isFunction(template)) {
				template = template(widget.params);
			}
		} else if (angular.isDefined(templateUrl = widget.templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(widget.params);
			}
			if (angular.isDefined(templateUrl)) {
				widget.loadedTemplateUrl = $sce.valueOf(templateUrl);
				template = $templateRequest(templateUrl);
			}
		}
		return template;
	}

	function compile(model, parenScope){
		var widget = _widget(model);
		var childScope = null;
		var element = null;

		// 1- create scope
		childScope = parenScope.$new(false, parenScope);
		childScope.wbModel = model;

		// 2- create element
		return $q.when(getTemplateFor(widget))//
		.then(function(template) {
			if (model.type != 'Group') {
				template = '<wb-widget>' + template + '</wb-widget>';
			}
			element = angular.element(template);

			// 3- bind controller
			var link = $compile(element);
			if (angular.isDefined(widget.controller)) {
				var locals = {
						$scope : childScope,
						$element : element,
						// TODO: maso, 2017: bind wbModel, wbParent,
						// and wbEditable
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
	 * @param widget
	 * @returns
	 */
	function widgetData(widget){
		var sample = widget.data || {style:{}};
		var data = angular.copy(sample);
		data.type = widget.type;
		return data;
	}

	// تعیین سرویس‌ها
	this.newWidget = newWidget;
	this.widget = widget;
	this.widgets = widgets;
	this.widgetData = widgetData;
	this.select = select;
	this.getTemplateFor = getTemplateFor;
	this.compile = compile;
});
