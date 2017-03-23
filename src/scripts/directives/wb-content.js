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
 */
.directive('wbContent', function($compile, $widget, $controller, $settings, $q) {
    function postLink(scope, element, attrs) {
	// Note that object must be an object or array,
	// NOT a primitive value like string, number, etc.
	// Note: id must be incremental
	var objIdMap=new WeakMap();
	var objectCount = 0;
	function objectId(object){
	    if (!objIdMap.has(object)) 
		objIdMap.set(object,++objectCount);
	    return objIdMap.get(object);
	}

	/**
	 * Find the aunchor
	 * 
	 * The anchor is an element where widgets are added into.
	 * 
	 * @returns element anchor
	 */
	function getAnchor() {
	    return element//
	    .children(bodyElementSelector)//
	    .children(placeholderElementSelector);
	}

	/**
	 * Reload view
	 * 
	 * Removes all widgets and load the view agin.
	 */
	function reloadView() {
	    cleanView();
	    var anchor = getAnchor();
	    var compilesJob = [];
	    var elements = [];
	    scope.wbModel.contents.forEach(function(item, index) {
		compilesJob.push($widget.compile(item, scope)//
			.then(function(elem) {
			    elem.attr('id', objectId(item));
			    elements[index] = elem;
			}));
	    });
	    return $q.all(compilesJob)//
	    .then(function() {
		var anchor = getAnchor();
		elements.forEach(function(item){
		    anchor.append(item);
		});
	    });
	}

	/**
	 * New widget
	 */
	function newWidget() {
	    return $widget.select({
		wbModel : {},
		style : {}
	    })//
	    .then(function(model) {
		$widget.compile(model, scope)//
		.then(function(element) {
		    element.attr('id', objectId(model));
		    scope.wbModel.contents.push(model);
		    getAnchor().append(element);
		});
	    });
	}

	/**
	 * Clean view
	 * 
	 * Remove all widgets from the veiw and clean the tmeplate.
	 * 
	 */
	function cleanView() {
	    element//
	    .children(bodyElementSelector)//
	    .children(placeholderElementSelector)//
	    .empty();
	}

	/*
	 * Removes a widget
	 * 
	 * Data model and visual element related to the input model will be
	 * removed.
	 */
	function removeChild(model) {
	    var index = scope.wbModel.contents.indexOf(model);
	    if (index > -1) {
		var a = element//
		.children(bodyElementSelector)//
		.children(placeholderElementSelector)
		.children('#'+objectId(model));
		a.remove();
		scope.wbModel.contents.splice(index, 1);
	    }
	}

	/**
	 * Load container settings
	 * 
	 * Loads settings of the current container.
	 */
	function settings() {
	    return $settings.load({
		wbModel : scope.wbModel,
		wbParent : scope.wbParent
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
		newElement.attr('id', objectId(item));
		if (index < list[0].childNodes.length) {
		    newElement.insertBefore(list[0].childNodes[index]);
		} else {
		    list.append(newElement);
		}
		scope.wbModel.contents.splice(index, 0, item);
		console.log('widget add to list');
	    });
	    return true;
	}

	/*
	 * Watch the model for modification.
	 */
	scope.$watch('wbModel', function() {
	    if (!scope.wbModel) {
		// XXX: maso, 1395: هنوز مدل تعیین نشده
		return;
	    }
	    if (!angular.isArray(scope.wbModel.contents)) {
		scope.wbModel.contents = [];
	    }
	    scope.wbModel.type = 'Container';
	    reloadView();
	});

	scope.removeChild = removeChild;
	scope.settings = settings;
	scope.dropCallback = dropCallback;
	scope.newWidget = newWidget;
	scope.objectId = objectId;
    }

    return {
	templateUrl : 'views/directives/wb-content.html',
	transclude : true,
	restrict : 'E',
	replace : true,
	scope : {
	    wbModel : '=?',
	    wbEditable : '=?'
	},
	link : postLink
    };
});//

