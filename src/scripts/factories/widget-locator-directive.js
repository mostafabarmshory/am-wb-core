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
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 */
.factory('CursorWidgetLocator', function (AbstractWidgetLocator, $rootScope) {

	var cursorWidgetLocator = function (options) {
		options = options || {};
		AbstractWidgetLocator.apply(this, options);

		// load templates
		var template = options.template
		|| '<div class="wb-widget-locator-cursor"></div>';

		// load elements
		this.topElement = angular.element(template);
		this.topElement.attr('id', 'top');

		this.rightElement = angular.element(template);
		this.rightElement.attr('id', 'right');

		this.buttomElement = angular.element(template);
		this.buttomElement.attr('id', 'buttom');

		this.leftElement = angular.element(template);
		this.leftElement.attr('id', 'left');

		// init controller
		this.setElements([this.topElement, this.rightElement,
			this.buttomElement, this.leftElement]);
		var ctrl = this;
		function getBound() {
			var $element = ctrl.getWidget().getElement();
			var off = $element.offset();
			return {
				left: off.left,
				top: off.top,
				width: $element.outerWidth(),
				height: $element.outerHeight()
			};
		}
		this.on('widgetChanged', function () {
			if (ctrl._oldWidgetWatch) {
				ctrl._oldWidgetWatch();
			}
			var widget = ctrl.getWidget();
			if (widget) {
				ctrl._oldWidgetWatch = widget.getScope().$watch(getBound, function (bound) {
					if (!bound) {
						return;
					}
					ctrl.updateView(bound);
				}, true);
				ctrl.updateView(getBound());
				ctrl.show();
			} else {
				ctrl.hide();
			}
		});
	};
	cursorWidgetLocator.prototype = new AbstractWidgetLocator();

	cursorWidgetLocator.prototype.updateView = function (bound) {
		this.topElement.css({
			top: bound.top + 1,
			left: bound.left + 1,
			width: bound.width - 2
		});
		this.rightElement.css({
			top: bound.top + 1,
			left: bound.left + bound.width - 2,
			height: bound.height - 2
		});
		this.buttomElement.css({
			top: bound.top + bound.height - 1,
			left: bound.left + 1,
			width: bound.width - 2
		});
		this.leftElement.css({
			top: bound.top + 1,
			left: bound.left + 1,
			height: bound.height - 2
		});

	};
	return cursorWidgetLocator;
})//

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 */
.factory('BoundWidgetLocator', function (AbstractWidgetLocator) {

	var boundWidgetLocator = function (options) {
		options = options || {};
		AbstractWidgetLocator.apply(this, options);

		// load headerTemplate
		var headerTag = '<div style="position: absolute; background: black; color: red; border: 1px solid black;">header</div>';
		this.titleElement = angular.element(headerTag);

		// load templates
		var template = options.template
		|| '<div class="wb-widget-locator-bound"></div>';

		// load elements
		this.topElement = angular.element(template);
		this.topElement.attr('id', 'top');

		this.rightElement = angular.element(template);
		this.rightElement.attr('id', 'right');

		this.buttomElement = angular.element(template);
		this.buttomElement.attr('id', 'buttom');

		this.leftElement = angular.element(template);
		this.leftElement.attr('id', 'left');

		// init controller
		this.setElements([this.titleElement, this.topElement, this.rightElement,
			this.buttomElement, this.leftElement]);
		var ctrl = this;
		function getBound() {
			var $element = ctrl.getWidget().getElement();
			var off = $element.offset();
			return {
				left: off.left,
				top: off.top,
				width: $element.outerWidth(),
				height: $element.outerHeight()
			};
		}

		this.on('widgetChanged', function () {
			if (ctrl._oldWidgetWatch) {
				ctrl._oldWidgetWatch();
			}
			var widget = ctrl.getWidget();
			if (widget) {
				ctrl._oldWidgetWatch = widget.getScope().$watch(getBound, function (bound) {
					if (!bound) {
						return;
					}
					ctrl.updateView(bound);
				}, true);
				ctrl.updateView(getBound());
				ctrl.show();

				var model = widget.getModel();
				ctrl.titleElement.html(model.label || model.type);
			} else {
				ctrl.hide();
			}
		});
	};
	boundWidgetLocator.prototype = new AbstractWidgetLocator();

	boundWidgetLocator.prototype.updateView = function (bound) {
		this.topElement.css({
			top: bound.top + 1,
			left: bound.left + 1,
			width: bound.width - 2
		});
		this.rightElement.css({
			top: bound.top + 1,
			left: bound.left + bound.width - 2,
			height: bound.height - 2
		});
		this.buttomElement.css({
			top: bound.top + bound.height - 1,
			left: bound.left + 1,
			width: bound.width - 2
		});
		this.leftElement.css({
			top: bound.top + 1,
			left: bound.left + 1,
			height: bound.height - 2
		});
		if (bound.top < 32) {
			this.titleElement.css({
				top: bound.top + bound.height,
				left: bound.left + bound.width- this.titleElement.width() - 5
			});
		} else {
			this.titleElement.css({
				top: bound.top -  this.titleElement.height(),
				left: bound.left + bound.width - this.titleElement.width() - 5
			});
		}
	};
	return boundWidgetLocator;
})//




/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 */
.factory('ActionsWidgetLocator', function (CursorWidgetLocator) {
	var actionsWidgetLocator = function () {
		// TODO:
	}
	actionsWidgetLocator.prototype = new AbstractWidgetLocator();

	return actionsWidgetLocator;
})//

/**
 * @ngdoc Factories
 * @name AbstractWidgetLocator
 * @description Locates a widget on the view
 * 
 * It is used to display extra information about a widget on the screen. For
 * example it is used to show widget actions on the fly.
 * 
 */
.factory('AbstractWidgetLocator', function ($rootElement) {

	/**
	 * Creates new instance of the widget locator
	 */
	function abstractWidgetLocator() {
		this.callbacks = [];
		this.elements = [];
	}

	abstractWidgetLocator.prototype.setVisible = function (visible) {
		this.visible = visible;
		if (visible) {
			this.show();
			this.fire('show');
		} else {
			this.hide();
			this.fire('hide');
		}
	};

	abstractWidgetLocator.prototype.isVisible = function () {
		return this.visible;
	};

	abstractWidgetLocator.prototype.setWidget = function (widget) {
		var ctrl = this;
		function widgetDeleted(){
			ctrl.setWidget(null);
		};
		// remove old listener
		if(this.widget) {
			this.widget.off('widgetDeleted', widgetDeleted);
		}
		// set widget
		this.widget = widget;
		this.fire('widgetChanged');
		// add listener
		if(this.widget){
			this.widget.on('widgetDeleted', widgetDeleted);
		}
	};

	abstractWidgetLocator.prototype.getWidget = function () {
		return this.widget;
	};

	abstractWidgetLocator.prototype.setElements = function (elements) {
		this.elements = elements;
		angular.forEach(elements, function (element) {
			$rootElement.append(element);
			element.hide();
		});
	};

	abstractWidgetLocator.prototype.getElements = function () {
		return this.elements;
	};

	abstractWidgetLocator.prototype.on = function (type, callback) {
		if (!angular.isArray(this.callbacks[type])) {
			this.callbacks[type] = [];
		}
		this.callbacks[type].push(callback);
	};

	abstractWidgetLocator.prototype.fire = function (type) {
		if (angular.isDefined(this.callbacks[type])) {
			for (var i = 0; i < this.callbacks[type].length; i++) {
				try {
					this.callbacks[type][i]();
				} catch (error) {
					console.log(error);
				}
			}
		}
	};

	abstractWidgetLocator.prototype.hide = function () {
		this.setVisible(false);
	}

	abstractWidgetLocator.prototype.show = function () {
		this.setVisible(true);
	}

	abstractWidgetLocator.prototype.setVisible = function (visible) {
		this.visible = visible;
		visible = this.visible && this.enable;
		angular.forEach(this.elements, function (element) {
			if(visible) {
				element.show();
			} else {
				element.hide();
			}
		});
	}

	abstractWidgetLocator.prototype.isVisible = function () {
		return this.visible;
	}


	abstractWidgetLocator.prototype.setEnable = function (enable) {
		this.enable = enable;
		this.setVisible(this.enable && this.visible);
	}

	abstractWidgetLocator.prototype.isEnable = function () {
		return this.enable;
	}

	abstractWidgetLocator.prototype.destroy = function () {
		this.fire('distroied');
		angular.forEach(this.elements, function (element) {
			element.remove();
		});
		this.elements = [];
		this.callbacks = [];
	}

	return abstractWidgetLocator;
});
