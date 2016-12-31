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
 * @ngdoc directive
 * @name donateMainApp.directive:wbContent
 * @description
 * 
 * نمایش یک محتوی
 * 
 * از این ساختار برای ایجاد یک محتوی استفاده می‌شود. هر محتوی معال با یک صفحه
 * معادل است که تمام موجودیت‌های خود را به صورت سطری و یا سطونی نمایش می‌دهد.
 * 
 * هر صفحه یک ساختار داده‌ای را به عنوان ورودی دریافت می‌کند و در صورتی که کاربر
 * مجاز به ویرایش آن باشد، آن را ویرایش و ساختار داده‌ای جدید ایجاد می‌کند.
 * فرآیند ذخیره سازی این ساختار داده‌ای باید به صورت مستقل در کنترل‌هایی انجام
 * شود که این ساختار را فراهم کرده‌اند.
 * 
 */
.directive(
	'wbContent',
	function($compile, $widget) {

	    var dragClass = 'wb-content-dragenter';
	    var bodyElementSelector = 'div#wb-content-body';
	    var placeholderElementSelector = 'div#wb-content-placeholder';

	    return {
		templateUrl : 'views/directives/wb-content.html',
		transclude : true,
		restrict : 'E',
		replace : true,
		scope : {
		    wbModel : '=?',
		    wbEditable : '=?',
		    wbParent : '=?'
		},

		link : function(scope, element, attrs) {
		    // TODO:
		},

		controller : function($scope, $element, $settings, $widget) {
		    var scope = $scope;
		    var element = $element;

		    function isEditable() {
			if (scope.wbParent) {
			    return scope.wbParent.isEditable();
			}
			return scope.wbEditable;
		    }

		    function createWidget(widget, parentScope, model) {
			var element = angular.element(widget);
			element.attr('wb-model', 'model');
			element.attr('wb-editable', 'wbEditable()');
			element.attr('wb-parent', 'wbParent');
			var childScope = parentScope.$new(true, parentScope);
			childScope.model = model;
			childScope.wbEditable = scope.isEditable;
			childScope.wbParent = parentScope;
			// TODO: maso, 1395: این موجودیت باید ایجاد شود
			return $compile(element)(childScope);
		    }

		    function removeWidgets() {
			$element//
			.children(bodyElementSelector)//
			.children(placeholderElementSelector)//
			.empty();
		    }

		    function removeWidget(model) {
			if (model == scope.wbModel) {
			    // باید از پدر بخواهیم که این کار رو انجام بده
			    scope.wbParent.removeWidget(model);
			}
			var index = scope.wbModel.contents.indexOf(model);
			if (index > -1) {
			    scope.wbModel.contents.splice(index, 1);
			}
			// TODO: maso, 1395: بهتره که المان معادل را پیدا و حذف
			// کنیم.
			removeWidgets();
			scope.wbModel.contents.forEach(addWidget);
		    }

		    /**
		     * یک دریجه محاوره‌ای برای انتخاب و اضافه کردن ویجت باز
		     * می‌کند
		     * 
		     * کاربر با استفاده از دریچه محاوره‌ای ویجت را انتخاب می‌کند
		     * و بعد از آن این ویجت به صورت یک ساختار داده‌ای جدید به
		     * مدل داده‌ای و نمایش اضافه خواهد شد.‌
		     */
		    function newWidget(wbModel) {
			return $widget.select({
			    wbModel : {},
			    style : {}
			})//
			.then(function(model) {
			    wbModel.contents.push(model);
			    addWidget(model);
			});
		    }

		    function addWidget(item) {
			$widget.widget(item).then(function(widget) {
			    $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector)//
			    .append(createWidget(widget.dom, $scope, item));
			});
		    }

		    /**
		     * Adds dragged widget
		     */
		    function addDraggedWidget(event, index, item, external,
			    type) {
			// insert in model
			scope.wbModel.contents.splice(index, 0, item);
			// add widget
			$widget.widget(item).then(function(widget) {
			    var list = $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector);
			    var w = createWidget(widget.dom, $scope, item);
			    if(index < list[0].childNodes.length){
				w.insertBefore(list[0].childNodes[index]);
			    } else {
				list.append(w);
			    }
			});
			return true;
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
			    wbParent : scope.wbParent,
			    style : {
				pages : [ 'description', 'border',
					'background', 'pageLayout',
					'selfLayout' ]
			    }
			});
		    }

		    function isArray(model) {
			return (model && model.constructor === Array);
		    }

		    scope.settings = settings;
		    scope.removeWidgets = removeWidgets;
		    scope.removeWidget = removeWidget;
		    scope.newWidget = newWidget;
		    scope.isEditable = isEditable
		    scope.addDraggedWidget = addDraggedWidget;

		    scope.$watch('wbModel', function() {
			removeWidgets();
			if (!scope.wbModel) {
			    // XXX: maso, 1395: هنوز مدل تعیین نشده
			    return;
			}
			if (!isArray(scope.wbModel.contents)) {
			    scope.wbModel.contents = [];
			}
			scope.wbModel.type = 'Page';
			scope.wbModel.contents.forEach(addWidget);
		    });
		}
	    };
	});
