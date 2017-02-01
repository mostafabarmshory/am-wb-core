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
.directive(
	'wbContent',
	function($compile, $widget, $controller) {

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

		    /*
		     * Check editable mode
		     * 
		     * Returns true if the model is in editable mode.
		     */
		    function isEditable() {
			if (scope.wbParent) {
			    return scope.wbParent.isEditable();
			}
			return scope.wbEditable;
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
			    var a = $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector);
			    
			    if(scope.wbModel.contents.length !== a[0].childNodes){
				// Need referesh
				scope.wbModel.contents.splice(index, 1);
				removeWidgets();
				scope.wbModel.contents.forEach(addWidget);
				return;
			    }
			    
			    scope.wbModel.contents.splice(index, 1);
			    a[0].childNodes[index].remove();
			}
		    }

		    /*
		     * Remove the node
		     */
		    function remove(){
			return scope.wbParent.removeChild($scope.wbModel);
		    }


		    function createWidget(item) {
			var widget = null;
			var childScope = null;
			var element = null;

			// 0- get widget
			return $widget.widget(item)//
			.then(function(w) {
			    widget = w;
			})

			// 1- create scope
			.then(function() {
			    childScope = $scope.$new(true, $scope);
			    childScope.model = item;
			    childScope.editable = $scope.isEditable;
			    childScope.parent = $scope;
			})

			// 2- create element
			.then(function() {
			    return $widget.getTemplateFor(widget);
			})//
			.then(function(template) {
			    if (item.type != 'Page') {
				template = '<wb-widget>' + template + '</wb-widget>';
			    }
			    element = angular.element(template);
			    element.attr('wb-model', 'model');
			    element.attr('wb-editable', 'editable()');
			    element.attr('wb-parent', 'parent');
			})

			// 3- bind controller
			.then(function() {
			    if (angular.isDefined(widget.controller)) {
				$controller(widget.controller, {
				    $scope : childScope,
				    $element : element,
				    // TODO: maso, 2017: bind wbModel, wbParent,
				    // and wbEditable
				});
			    }
			    $compile(element)(childScope);
			})//

			// Return value
			.then(function(){
			    return element;
			});
		    }


		    /*
		     * Creates and add a widget
		     * 
		     * @see createWidget
		     */
		    function addWidget(item) {
			createWidget(item)//
			.then(function(element) {
			    $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector)//
			    .append(element);
			});
		    }


		    /**
		     * Adds dragged widget
		     */
		    function dropCallback(event, index, item, external,
			    type) {
			// add widget
			createWidget(item)//
			.then(function(element) {
			    var list = $element//
			    .children(bodyElementSelector)//
			    .children(placeholderElementSelector);
			    if (index < list[0].childNodes.length) {
				element.insertBefore(list[0].childNodes[index]);
			    } else {
				list.append(element);
			    }
			})//
			.then(function(){
			    console.log('widget add to list');
			    scope.wbModel.contents.splice(index, 0, item);
			});
			return true;
		    }


		    /**
		     * @deprecated
		     */
		    function removeWidgets() {
			$element//
			.children(bodyElementSelector)//
			.children(placeholderElementSelector)//
			.empty();
		    }

		    /**
		     * @deprecated
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

		    scope.isEditable = isEditable
		    scope.settings = settings;
		    scope.remove = remove;
		    scope.removeChild = removeChild;

		    scope.dropCallback = dropCallback;
		    scope.movedCallback = remove;
		    
//		    scope.removeWidgets = removeWidgets;
		    scope.newWidget = newWidget;

		    scope.$watch('wbModel', function() {
			removeWidgets();
			if (!scope.wbModel) {
			    // XXX: maso, 1395: هنوز مدل تعیین نشده
			    return;
			}
			if (!angular.isArray(scope.wbModel.contents)) {
			    scope.wbModel.contents = [];
			}
			scope.wbModel.type = 'Page';
			scope.wbModel.contents.forEach(addWidget);
		    });
		}
	    };
	});
