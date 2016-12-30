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
.service('$widget', function($q, $timeout, $mdDialog, PaginatorPage) {

    var contentElementAsso = [];
    var elementKey = [];
    var notFoundWidget = {
	dom : '<wb-notfound-element></wb-notfound-element>',
	label : 'Not found',
	image : 'images/wb/notfoundelement.svg',
	link : 'link',
    };
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
	    var widget = notFoundWidget;
	    if (model.type in contentElementAsso) {
		widget = contentElementAsso[model.type];
	    }
	    deferred.resolve(widget);
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
     * 
     * @param type
     * @param model
     * @returns
     */
    function newWidget(type, model) {
	var deferred = $q.defer();
	$timeout(function() {
	    if (type in contentElementAsso) {
		deferred.reject({
		    data : {
			message : 'Widget with the same type registerd before'
		    }
		});
		return;
	    }
	    contentElementAsso[type] = model;
	    elementKey.push(type);
	    deferred.resolve(model);
	}, 1);
	return deferred.promise;
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

    // تعیین سرویس‌ها
    this.newWidget = newWidget;
    this.widget = widget;
    this.widgets = widgets;
    this.select = select;
});
