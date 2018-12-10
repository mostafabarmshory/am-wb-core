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

angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name CursorWidgetLocator
 * @description Manages list of locators
 * 
 */
.factory('WidgetLocatorManager', function(BoundWidgetLocator, CursorWidgetLocator, AbstractWidgetLocator) {

	
	/**
	 * Get path of a widget to the root
	 */
	function getPathOf (widget) {
		var widgets = [];
		while(widget != null) {
			widgets.push(widget);
			widget = widget.getParent();
		}
		return widgets;
	}
	
	/**
	 * Creates new instance of the manager
	 * 
	 * @memberof CursorWidgetLocator
	 */
	function WidgetLocatorManager(options) {
		options = options || {};
		// attributes
		this.selectLocators = [];
		this.cursorLocator;
		this.pathLocators = [];
		
		// selection options
		this.Selection = options.selectionLocator || BoundWidgetLocator;
		this.SelectionOption = options.selectOption || {};
		this.selectionPath = options.selectionPath || false;
		this.selectionEnable = true;
		if(angular.isDefined(options.selectionEnable)){
			this.selectionEnable = options.selectionEnable;
		}
		
		// cursor options
		this.Cursor = options.cursorLocator || CursorWidgetLocator;
		this.CursorOption = options.cursorOption || {};
		this.cursorPath = options.cursorPath || false;
		this.cursorEnable = true;
		if(angular.isDefined(options.cursorEnable)){
			this.cursorEnable = options.cursorEnable;
		}
		
		// actions
		this.Action = options.actionLocator || AbstractWidgetLocator;
		this.actionEnable = false;
		if(angular.isDefined(options.actionEnable)){
			this.actionEnable = options.actionEnable;
		}
	}

	/**
	 * Destroies all locators and remove from view
	 * 
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.destroy = function() {
		if(this.cursorLocator) {
			this.cursorLocator.destroy();
		}
		angular.forEach(this.selectLocators, function(locator) {
			locator.destroy();
		});
		angular.forEach(this.pathLocators, function(locator) {
			locator.destroy();
		});
		
		this.selectLocators = [];
		delete this.cursorLocator;
		this.pathLocators = [];
	}

	/**
	 * Sets visibility of locators
	 * 
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.setVisible = function(visible) {
		if(this.visible === visible) {
			return;
		}
		this.visible = visible;
		if(this.cursorLocator) {
				this.cursorLocator.setVisible(visible);
		}
		angular.forEach(this.selectLocators, function(locator) {
			locator.setVisible(visible);
		});
		angular.forEach(this.pathLocators, function(locator) {
			locator.setVisible(visible);
		});
	}
	WidgetLocatorManager.prototype.isVisible = function() {
		return this.visible;
	}

	/**
	 * Sets widgets
	 * 
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.setSelectedWidgets = function(widgets) {
		if(this.selectLocators.length > widgets.length) {
			// disable extra
			for(var i = widgets.length; i < this.selectLocators.length; i++){
				this.selectLocators[i].setEnable(false);
			}
		} else if (this.selectLocators.length < widgets.length) {
			// add new
			while(this.selectLocators.length < widgets.length){
				var locator = new this.Selection(this.SelectionOption);
				this.selectLocators.push(locator);
			}
		}
		
		// set widgets
		var ctrl = this;
		angular.forEach(this.selectLocators, function(locator, index){
			locator.setWidget(widgets[index]);
			locator.setVisible(ctrl.isVisible());
			locator.setEnable(true);
		});
	}
	
	/**
	 * Sets a cursor widget
	 */
	WidgetLocatorManager.prototype.setCursorWidget = function(widget) {
		if(!this.cursorEnable) {
			return;
		}
		
		// list widgets
		if(this.cursorPath){
			this.updateCursorPath(widget);
		}
		if(!this.cursorLocator) {
			this.cursorLocator = new this.Cursor(this.CursorOption);
		}
		this.cursorLocator.setWidget(widget);
		this.cursorLocator.setVisible(this.isVisible());
		this.cursorLocator.setEnable(!!widget);
	}
	
	
	return WidgetLocatorManager;
});