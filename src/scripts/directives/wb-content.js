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

var dragClass = 'wb-content-dragenter';
var bodyElementSelector = 'div#wb-content-body';
var placeholderElementSelector = 'div#wb-content-placeholder';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:wbContent
 * @description
 * 
 * A container widget
 * 
 * This is an container widget to list and manage widgets. This is equal to a
 * group or a page of widgets.
 * 
 * Widget data is bind into the wbModel automatically.
 * 
 * هر صفحه یک ساختار داده‌ای را به عنوان ورودی دریافت می‌کند و در صورتی که کاربر
 * مجاز به ویرایش آن باشد، آن را ویرایش و ساختار داده‌ای جدید ایجاد می‌کند.
 * فرآیند ذخیره سازی این ساختار داده‌ای باید به صورت مستقل در کنترل‌هایی انجام
 * شود که این ساختار را فراهم کرده‌اند.
 * 
 */
.directive('wbContent', function($compile, $widget, $controller, $settings) {
    return {
	templateUrl : 'views/directives/wb-content.html',
	transclude : true,
	restrict : 'E',
	replace : true,
	scope : {
	    wbModel : '=?',
	    wbEditable : '=?'
	},
	link : function(scope, element, attrs) {
	    //
	    function empty() {
		element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector)//
		.empty();
	    }

	    function getAnchor() {
		return element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector);
	    }

	    function addWidget(anchor, item) {
		$widget.compile(item, scope)//
		.then(function(element) {
		    anchor.append(element);
		});
	    }
	    /**
	     * Adds dragged widget
	     */
	    function dropCallback(event, index, item, external, type) {
		// add widget
		$widget.compile(item, scope)//
		.then(function(newElement) {
		    var list = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    if (index < list[0].childNodes.length) {
			newElement.insertBefore(list[0].childNodes[index]);
		    } else {
			list.append(newElement);
		    }
		})//
		.then(function(){
		    console.log('widget add to list');
		    scope.wbModel.contents.splice(index, 0, item);
		});
		return true;
	    }


	    /*
	     * Removes a widget
	     *
	     * Data model and visual element related to the input model
	     * will be removed.
	     */
	    function removeChild(model) {
		var index = scope.wbModel.contents.indexOf(model);
		if (index > -1) {
		    var a = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    if(scope.wbModel.contents.length !== a[0].childNodes){
			// Need referesh
			scope.wbModel.contents.splice(index, 1);
			empty();
			var anchor = getAnchor();
			scope.wbModel.contents.forEach(function(item){
			    addWidget(anchor, item);
			});
			return;
		    }
		    scope.wbModel.contents.splice(index, 1);
		    a[0].childNodes[index].remove();
		}
	    }

	    /**
	     * @deprecated
	     */
	    function newWidget() {
		return $widget.select({
		    wbModel : {},
		    style : {}
		})//
		.then(function(model) {
		    scope.wbModel.contents.push(model);
		    addWidget(getAnchor(), model);
		});
	    }
	    
	    // TODO:
	    scope.$watch('wbModel', function() {
		empty();
		if (!scope.wbModel) {
		    // XXX: maso, 1395: هنوز مدل تعیین نشده
		    return;
		}
		if (!angular.isArray(scope.wbModel.contents)) {
		    scope.wbModel.contents = [];
		    return;
		}
		var anchor = getAnchor();
		scope.wbModel.contents.forEach(function(item){
		    addWidget(anchor, item);
		});
	    });


	    /**
	     * تنظیم‌های کلی صفحه را انجام می‌دهد
	     *
	     * یک دریچه محاوره‌ای باز می‌شود تا کاربر بتواند تنظیم‌های
	     * متفاوت مربوط به این صفحه را انجام دهد.
	     */
	    function settings() {
		return $settings.load({
		    wbModel : scope.wbModel,
		    wbParent : scope.wbParent
		});
	    }

	    scope.removeChild = removeChild;
	    scope.settings = settings;
	    scope.dropCallback = dropCallback;
	    scope.newWidget = newWidget;
	}
    };
})
/**
 * 
 */
.directive('wbPanel', function($compile, $widget, $controller, $settings) {
    return {
	templateUrl : 'views/directives/wb-panel.html',
	restrict : 'E',
	replace : true,
	link : function(scope, element, attrs) {
	    //
	    function empty() {
		element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector)//
		.empty();
	    }

	    function getAnchor() {
		return element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector);
	    }

	    function addWidget(anchor, item) {
		$widget.compile(item, scope)//
		.then(function(element) {
		    anchor.append(element);
		});
	    }
	    /**
	     * Adds dragged widget
	     */
	    function dropCallback(event, index, item, external, type) {
		// add widget
		$widget.compile(item, scope)//
		.then(function(newElement) {
		    var list = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    if (index < list[0].childNodes.length) {
			newElement.insertBefore(list[0].childNodes[index]);
		    } else {
			list.append(newElement);
		    }
		})//
		.then(function(){
		    console.log('widget add to list');
		    scope.wbModel.contents.splice(index, 0, item);
		});
		return true;
	    }


	    /*
	     * Removes a widget
	     *
	     * Data model and visual element related to the input model
	     * will be removed.
	     */
	    function removeChild(model) {
		var index = scope.wbModel.contents.indexOf(model);
		if (index > -1) {
		    var a = element//
		    .children(bodyElementSelector)//
		    .children(placeholderElementSelector);
		    if(scope.wbModel.contents.length !== a[0].childNodes){
			// Need referesh
			scope.wbModel.contents.splice(index, 1);
			empty();
			var anchor = getAnchor();
			scope.wbModel.contents.forEach(function(item){
			    addWidget(anchor, item);
			});
			return;
		    }
		    scope.wbModel.contents.splice(index, 1);
		    a[0].childNodes[index].remove();
		}
	    }

	    /**
	     * تنظیم‌های کلی صفحه را انجام می‌دهد
	     *
	     * یک دریچه محاوره‌ای باز می‌شود تا کاربر بتواند تنظیم‌های
	     * متفاوت مربوط به این صفحه را انجام دهد.
	     */
	    function settings() {
		return $settings.load({
		    wbModel : scope.wbModel,
		    wbParent : scope.$parent
		});
	    }
	    /**
	     * @deprecated
	     */
	    function newWidget() {
		return $widget.select({
		    wbModel : {},
		    style : {}
		})//
		.then(function(model) {
		    scope.wbModel.contents.push(model);
		    addWidget(getAnchor(), model);
		});
	    }

	    scope.removeChild = removeChild;
	    scope.settings = settings;
	    scope.dropCallback = dropCallback;
	    scope.newWidget = newWidget;
	    
	    if (!angular.isArray(scope.wbModel.contents)) {
		scope.wbModel.contents = [];
		return;
	    }
	    var anchor = getAnchor();
	    scope.wbModel.contents.forEach(function(item){
		addWidget(anchor, item);
	    });
	}
    };
});//

