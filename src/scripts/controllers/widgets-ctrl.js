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
 * @ngdoc Controllers
 * @name WbAbstractWidget
 * @descreption root of the widgets
 * 
 * This is an abstract implementation of the widgets.
 * 
 * ## Models
 * 
 * The model of the widget is consist of two main part:
 * 
 * <ul>
 * <li>User data</li>
 * <li>Runtime data</li>
 * </ul>
 * 
 * User data is set as input data model and the runtime data
 * is managed by events and user functions. 
 * 
 * Finally the combination of user and runtime data is used to
 * update the view.
 * 
 * The setModelProperty changes the user data model.
 * 
 * The setProperty changes the runtime properties.
 * 
 * 
 * ## Events
 * 
 * 
 * Here is list of allowed types:
 * 
 * <ul>
 * <li>modelChanged: some properties of the model is changed.</li>
 * <li>modelUpdated: A new data model is replaced with the current one.</li>
 * <li>styleChanged: Computed style of the current widget is update.</li>
 * <li>widgetIsEditable: Widget is in editable state (so the result of
 * isEditable() is true)</li>
 * <li>widgetIsNotEditable: widget is not in editable mode any more(so the
 * result of isEditable() is false)</li>
 * <li>widgetDeleted: the widgets is removed.</li>
 * <li>widgetUnderCursor: The widget is under the mouse</li>
 * <li>widgetSelected: the widget is selected</li>
 * <li>widgetUnselected: the widget is unselected</li>
 * </ul>
 * 
 * Following event propagate on the root too
 * 
 * <ul>
 * <li>widgetUnderCursor</li>
 * <li>widgetSelected</li>
 * </ul>
 */
var WbAbstractWidget = function () {
    
    function debounce(func, wait) {
        var timeout;
        return function() {
            var context = this, args = arguments;
            var later = function() {
                timeout = null;
                func.apply(context, args);
            };
            var callNow = !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }
    
	this.actions = [];
	this.callbacks = [];
	this.childWidgets = [];
	this.$scope = null;
	this.$element = null;
	/*
	 * This is a cache of customer function
	 * 
	 */
	this.eventFunctions = {};
	this.computedStyle = {};

	// models
	this.runtimeModel = {};
	this.model = {};

	// event listeners
	var ctrl = this;
	this.eventListeners = {
			click: function ($event) {
				if (ctrl.isEditable()) {
					ctrl.setSelected(true, $event);
					$event.stopPropagation();
				} else {
					ctrl.evalWidgetEvent('click', $event);
				}
				ctrl.fire('click', $event);
			},

			mouseout: function ($event) {
				ctrl.fire('mouseout', $event);
				ctrl.evalWidgetEvent('mouseout', $event);
			},
			mouseover: function ($event) {
				ctrl.fire('mouseover', $event);
				ctrl.evalWidgetEvent('mouseover', $event);
			}
	};

	/*
	 * Add resize observer to the element
	 */
	this.resizeObserver = new ResizeObserver(debounce(function ($event) {
		ctrl.fireResizeLayout($event);
		// check if there is a user function
		ctrl.evalWidgetEvent('resize', $event);
	}, 100));

};

/**
 * Loads SEO information from the model and update the element
 * 
 * NOTE: this is utility class and can move into a service
 * 
 * @param model
 *            {object} to load from
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.loadSeo = function () {
	var model = this.getModel();
	if (!model) {
		return;
	}
	var $element = this.getElement();
	$element.attr('id', model.id);

	// Add item scope
	if (model.category) {
		$element.attr('itemscope', '');
		$element.attr('itemtype', model.category);
	} else {
		$element.removeAttr('itemscope');
		$element.removeAttr('itemtype');
	}

	// Add item property
	if (model.property) {
		$element.attr('itemprop', model.property);
	} else {
		$element.removeAttr('itemprop');
	}

	// TODO: support of
//	- {Text} label (https://schema.org/title)
//	- {Text} description (https://schema.org/description)
//	- {Text} keywords (https://schema.org/keywords)
};

/**
 * Loads style from the input model.
 * 
 * The style is a part of widget data model.
 * 
 * NOTE: this is an internal function and supposed not to call from outside.
 * 
 * @param style
 *            {object} part of widget model
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.loadStyle = function () {
	var model = this.getModel();
	var runtimeModel = this.getRuntimeModel();
	if (!model) {
		return;
	}
	var computedStyle = angular.merge({}, model.style, runtimeModel.style);
	if(angular.equals(computedStyle, this.computedStyle)){
		return;
	}
	// TODO: maso, 2018:Create event
	var $event = {}
	$event.source = this;
	$event.oldValue = this.computedStyle;
	$event.newValue = computedStyle;

	// save computedStyle
	this.computedStyle = computedStyle;

	// load style
	this.$element.css(this.$wbUtil.convertToWidgetCss(this.computedStyle || {}));
	this.fire('styleChanged', $event);
};


WbAbstractWidget.prototype.refresh = function($event) {
	if(this.isSilent()) {
		return;
	}
	// to support old widget
	var model = this.getModel();
	this.getScope().wbModel = model;

	if($event){
		var key = $event.key || 'x';
		// update event
		if(key.startsWith('event')){
			this.eventFunctions = {};
		} else if(key.startsWith('style')) {
			this.loadStyle();
			this.loadSeo();
		}
	} else {
		this.eventFunctions = {};
		this.loadStyle();
		this.loadSeo();
	}

};

/**
 * Returns model of the widget 
 * 
 * The model is managed by other entity and used as read only part
 * in the widget. 
 * 
 *  By the way it is supposed that the model is used just in a widget and
 * to modify the model, a method of the widget is called. In this case the
 * widget fire the changes of the model.
 * 
 * @see #setModelProperty(key, value)
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.getModel = function () {
	return this.wbModel;
};

/**
 * Sets model of the widget
 * 
 * @see #getModel()
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.setModel = function (model) {
	if (model === this.wbModel) {
		return;
	}
	this.wbModel = model;
	this.refresh();
	this.fire('modelChanged');
};

/**
 * Checks if the key exist in the widget model
 * 
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.hasModelProperty = function(key){
	return objectPath.has(this.getModel(), key);
};
WbAbstractWidget.prototype.getModelProperty = function(key){
	return objectPath.get(this.getModel(), key);
};
WbAbstractWidget.prototype.setModelProperty = function (key, value){
	// create the event
	var $event = {};
	$event.source = this;
	$event.key = key;
	$event.oldValue = this.getModelProperty(key);
	$event.newValue =  value;

	// Set the address
	if(angular.isDefined(value)){
		objectPath.set(this.getModel(), key, value);
	} else {
		objectPath.del(this.getModel(), key);
	}

	// refresh the view
	this.refresh();
	this.fire('modelUpdated', $event);
};


WbAbstractWidget.prototype.getRuntimeModel = function () {
	return this.runtimeModel;
};
WbAbstractWidget.prototype.hasProperty = function (key){
	return objectPath.has(this.getRuntimeModel(), key);
};
WbAbstractWidget.prototype.getProperty = function (key){
	return objectPath.get(this.getRuntimeModel(), key);
};

/**
 * Changes property value
 * 
 *  If the change cause the view to update then this function will
 * update and render the view.
 * 
 * @memberof WbAbstractWidget
 * @name setProperty
 */
WbAbstractWidget.prototype.setProperty = function (key, value){
	// create the event
	var $event = {};
	$event.source = this;
	$event.key = key;
	$event.oldValue = this.getProperty(key);
	$event.newValue =  value;

	// Set the address
	var model = this.getRuntimeModel();
	if(angular.isDefined(value)){
		objectPath.set(model, key, value);
	} else {
		objectPath.del(model, key);
	}

	// refresh the view
	this.refresh($event);
};

/**
 * Sets or gets style of the widget
 * 
 * The function effect on runtime style not the model. To change the model use
 * #setModelProperty(key,value).
 * 
 * NOTE: this function is part of widget API.
 * 
 * Set style by key:
 * 
 * widget.style('background.color', '#ff00aa');
 * 
 * Get style by key:
 * 
 * var color = widget.style('background.color');
 * 
 * Remove style by key:
 * 
 * widget.style('background.color', null);
 * 
 * Set style by object:
 * 
 * widgt.style({ background: { color: 'red', image: null } });
 * 
 * The style object is read only and you can get it as follow:
 * 
 * var style = widget.style();
 */
WbAbstractWidget.prototype.style = function (style, value) {
	// there is no argument so act as get
	if(!angular.isDefined(style)){
		return angular.copy(this.getProperty('style'));
	}
	// style is a key
	if(angular.isString(style)){
		if(angular.isDefined(value)){
			return this.setStyle(style, value);
		} else {
			return this.getStyle(style);
		}
	}
};

/**
 * Sets style of the widget
 */
WbAbstractWidget.prototype.setStyle = function(key, value) {
	this.setProperty('style.' + key, value);
};

/**
 * Get style from widget
 */
WbAbstractWidget.prototype.getStyle = function(key) {
	return this.getProperty('style.' + key);
};

/**
 * Loads events for the widget
 * 
 * @param event
 *            {object} part of the widget data model
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.evalWidgetEvent = function (type, event) {
	if (this.isEditable()) {
		// User function will not evaluate in edit mode
		return;
	}
	var eventFunction;
	if (!this.eventFunctions.hasOwnProperty(type) && this.getEvent().hasOwnProperty(type)) {
		var body = '\'use strict\'; var $event = arguments[0]; var $widget = arguments[1]; var $http = arguments[2]; var $media =  arguments[3];' + this.getEvent()[type];
		this.eventFunctions[type] = new Function(body);
	}
	eventFunction = this.eventFunctions[type];
	if (eventFunction) {
		var $http = this.$http;
		var ctrl = this;
		eventFunction(event, ctrl, {
			post: function (url, obj) {
				return $http.post(url, obj);
			}
		}, this.$mdMedia);
	}
};

/**
 * Remove the widgets
 */
WbAbstractWidget.prototype.destroy = function () {
	// remove callbacks
	this.callbacks = [];
	this.actions = [];

	// destroy children
	angular.forEach(this.childWidgets, function (widget) {
		widget.destroy();
	});
	this.childWidgets = [];

	// destroy view
	this.$element.remove();
	this.$element = null;

	// remove scope
	this.$scope.$destroy();
	this.$scope = null;
};

WbAbstractWidget.prototype.setElement = function ($element) {
	this.disconnect();
	this.$element = $element;
	this.connect();
};

WbAbstractWidget.prototype.disconnect = function () {
	var $element = this.getElement();
	if (!$element) {
		return;
	}
	this.resizeObserver.unobserve($element[0]);
	angular.forEach(this.eventListeners, function (listener, key) {
		$element.off(key, listener);
	});
};

WbAbstractWidget.prototype.connect = function () {
	var $element = this.getElement();
	if (!$element) {
		return;
	}
	this.resizeObserver.observe($element[0]);
	angular.forEach(this.eventListeners, function (listener, key) {
		$element.on(key, listener);
	});
};

WbAbstractWidget.prototype.getElement = function () {
	return this.$element;
};

WbAbstractWidget.prototype.setSilent = function(silent) {
	this.silent = silent;
};

WbAbstractWidget.prototype.isSilent = function() {
	return this.silent;
};

/**
 * Adds new callback of type
 * 
 * @param typeof
 *            the event
 * @param callback
 *            to call on the event
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.on = function (type, callback) {
	if (!angular.isFunction(callback)) {
		throw {
			message: "Callback must be a function"
		};
	}
	if (!angular.isArray(this.callbacks[type])) {
		this.callbacks[type] = [];
	}
	this.callbacks[type].push(callback);
};

/**
 * Remove the callback
 * 
 * @param type
 *            of the event
 * @param callback
 *            to remove
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.off = function (type, callback) {
	if (!angular.isArray(this.callbacks[type])) {
		return;
	}
	// remove callback
	var callbacks = this.callbacks[type];
	var index = callbacks.indexOf(callback);
	if (index > -1) {
		callbacks.splice(index, 1);
	}
};

/**
 * Call all callbacks on the given event type.
 * 
 * @param type
 *            of the event
 * @param params
 *            to add to the event
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.fire = function (type, params) {
	if (this.isSilent() || !angular.isDefined(this.callbacks[type])) {
		return;
	}
	// TODO: maso, 2018: create event object
	var event = _.merge({
		source: this,
		type: type
	}, params || {});

	// fire
	var callbacks = this.callbacks[type];
	for(var i = 0; i < callbacks.length; i++){
		// TODO: maso, 2018: check if the event is stopped to propagate
		try {
			callbacks[i](event);
		} catch (error) {
			// NOTE: remove on release
			console.log(error);
		}
	}
};

WbAbstractWidget.prototype.fireResizeLayout = function ($event) {
	this.fire('resize', $event);
	var children = this.$widget.getChildren(this.getRoot());
	angular.forEach(children, function (widget) {
		widget.fire('resize-layout', $event);
	});
};


/**
 * Gets direction of the widget
 * 
 * This function get direction from user model and is equals to:
 * 
 * widget.getModelProperty('style.layout.direction');
 * 
 * NOTE: default layout direction is column.
 * 
 * @returns {WbAbstractWidget.wbModel.style.layout.direction|undefined}
 */
WbAbstractWidget.prototype.getDirection = function () {
	return this.getModelProperty('style.layout.direction') || 'column';
};

WbAbstractWidget.prototype.getEvent = function () {
	return this.getModelProperty('event') || {};
};


WbAbstractWidget.prototype.getTitle = function () {
	return this.getModelProperty('label');
};

WbAbstractWidget.prototype.getType = function () {
	return this.getModelProperty('type');
};

WbAbstractWidget.prototype.getId = function () {
	return this.getModelProperty('id');
};

/**
 * Get parent widget
 * 
 * Parent widget is called container in this model. It is attached dynamically
 * on the render phease.
 */
WbAbstractWidget.prototype.getParent = function () {
	return this.parent;
};

WbAbstractWidget.prototype.setParent = function (widget) {
	return this.parent = widget;
};

WbAbstractWidget.prototype.setScope = function ($scope) {
	this.$scope = $scope;
};
WbAbstractWidget.prototype.getScope = function () {
	return this.$scope;
};

WbAbstractWidget.prototype.isEditable = function () {
	return this.editable;
};

WbAbstractWidget.prototype.setEditable = function (editable) {
	if (this.editable === editable) {
		return;
	}
	this.editable = editable;
	if (this.isRoot()) {
		delete this.lastSelectedItem;
		this.setSelected(true);
	}
	if (editable) {
		// Lesson on click
		var ctrl = this;

		// TODO: remove watch for model update and fire in setting
		this._modelWatche = this.getScope().$watch('wbModel', function () {
			ctrl.fire('modelUpdate');
		}, true);
	} else {
		// remove selection handler
		if (this._modelWatche) {
			this._modelWatche();
			delete this._modelWatche;
		}
	}
	// propagate to child
	angular.forEach(this.childWidgets, function (widget) {
		widget.setEditable(editable);
	});

	if (editable) {
		this.fire('editable');
	} else {
		this.fire('noneditable');
	}
};

/**
 * Delete the widget
 * 
 * This function just used in edit mode
 */
WbAbstractWidget.prototype.delete = function () {
	// remove itself
	this.fire('delete');
	this.getParent()
	.removeChild(this);
};

/**
 * Clone current widget This method works in edit mode only.
 */
WbAbstractWidget.prototype.clone = function () {
	var index = this.getParent().indexOfChild(this);
	this.getParent()//
	.addChild(index, angular.copy(this.getModel()));
};

/**
 * This method moves widget one to next.
 */
WbAbstractWidget.prototype.moveNext = function () {
	this.getParent().moveChild(this, this.getParent().indexOfChild(this) + 1);
};



/**
 * This method moves widget one to before
 */
WbAbstractWidget.prototype.moveBefore = function () {
	this.getParent().moveChild(this, this.getParent().indexOfChild(this) - 1);
};

/**
 * This method moves widget to the first of it's parent
 */
WbAbstractWidget.prototype.moveFirst = function () {
	this.getParent().moveChild(this, 0);
};

/**
 * This method moves widget to the last of it's parent
 */
WbAbstractWidget.prototype.moveLast = function () {
	this.getParent().moveChild(this, this.getParent().getChildren().length - 1);
};

/**
 * Checks if the widget is root
 * 
 * If there is no parent controller then this is a root one.
 */
WbAbstractWidget.prototype.isRoot = function () {
	var parent = this.getParent();
	return angular.isUndefined(parent) || parent === null;
};

/**
 * Gets root widgets of the widget
 * 
 * @return the root widget
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.getRoot = function () {
	// check if the root is set
	if (this.rootWidget) {
		return this.rootWidget;
	}
	// find root if is empty
	this.rootWidget = this;
	while (!this.rootWidget.isRoot()) {
		this.rootWidget = this.rootWidget.getParent();
	}
	return this.rootWidget;
};


/**
 * Checks if the widget is selected.
 * 
 * NOTE: it is not possible to select root widget
 * 
 * @return true if the widget is selected.
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.isSelected = function () {
	return this.selected;
};

WbAbstractWidget.prototype.setSelected = function (flag, $event) {
	if (this.isRoot()) {
		return;
	}
	if (this.selected === flag) {
		return;
	}

	// fire events
	this.selected = flag;
	if (flag) {
		this.getRoot().childSelected(this, $event);
		this.fire('select');
	} else {
		this.getRoot().childUnSelected(this, {});
		this.fire('unselect');
	}
};

/**
 * Add new action in actions list
 * 
 * @memberof WbWidgetCtrl
 */
WbAbstractWidget.prototype.addAction = function (action) {
	this.actions.push(action);
};

/**
 * Gets widget actions
 */
WbAbstractWidget.prototype.getActions = function () {
	return this.actions;
};


/**
 * Returns bounding client rectangle to parent
 * 
 * @return bounding rectangle
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.getBoundingClientRect = function () {
	var element = this.getElement();

	var offset = element.position();
	var width = element.outerWidth();
	var height = element.outerHeight();

	return {
		// rect
		width: width,
		height: height,
		// offset
		top: offset.top + parseInt(element.css('marginTop'), 10) + element.scrollTop(),
		left: offset.left + parseInt(element.css('marginLeft'), 10)
	};
};


/**
 * Adds animation to the page
 */
WbAbstractWidget.prototype.animate = function (options) {
	var ctrl = this;
	var animation = {
			targets: this.getRuntimeModel(),
			update: function(/*anim*/) {
				// XXX: maso, 2019: support multiple key in event
				ctrl.refresh();
			}
	};
	var keys = [];

	// copy animation properties
	if(options.duration){
		animation.duration = options.duration;
	}
	if(options.loop){
		animation.loop = options.loop;
	}
	if(options.autoplay){
		animation.autoplay = options.autoplay;
	}
	if(options.delay){
		animation.delay = options.delay;
	}
	if(options.easing){
		animation.easing = options.easing;
	}

	// Create list of attributes
	for(var key in options){
		// ignore keys
		if(key === 'duration'|| 
				key === 'loop'|| 
				key === 'autoplay'||
				key === 'delay'||
				key === 'easing'){
			continue;
		}
		keys.push(key);
		animation[key] = options[key];
		
		// set initial value
		var val = this.getProperty(key);
		if(!val) {
			this.setProperty(key, this.getModelProperty(key));
		}
		
		// NOTE: if the value is empty then you have to set from values
	}

	return anime(animation);
};

/**
 * Remove animations from the widget
 * 
 */
WbAbstractWidget.prototype.removeAnimation = function () {
	// The animation will not add to element so there is no need to remove
};





/***********************************************************************************************
 *                                                                                             *
 *                                                                                             *
 *                                                                                             *
 *                                                                                             *
 ***********************************************************************************************/
/**
 * @ngdoc Controllers
 * @name wbWidgetCtrl
 * @description Controller of a widget
 * 
 * 
 * @ngInject
 */
var WbWidgetCtrl = function ($scope, $element, $wbUtil, $http, $widget, $mdMedia) {
	WbAbstractWidget.call(this);
	this.setElement($element);
	this.setScope($scope);
	this.$wbUtil = $wbUtil;
	this.$http = $http;
	this.$widget = $widget;
	this.$mdMedia = $mdMedia;
};
WbWidgetCtrl.prototype = new WbAbstractWidget();



/***********************************************************************************************
 *                                                                                             *
 *                                                                                             *
 *                                                                                             *
 *                                                                                             *
 ***********************************************************************************************/
/**
 * @ngdoc Controllers
 * @name WbWidgetGroupCtrl
 * @description Manages a group widget
 * 
 * This is a group controller
 * 
 * @ngInject
 */
var WbWidgetGroupCtrl = function ($scope, $element, $wbUtil, $widget, $mdTheming, $q, $http, $mdMedia, $timeout) {
	WbAbstractWidget.call(this);
	this.setElement($element);
	this.setScope($scope);

	this.$widget = $widget;
	this.$q = $q;
	this.$mdTheming = $mdTheming;
	this.$wbUtil = $wbUtil;
	this.$http = $http;
	this.$mdMedia = $mdMedia;
	this.$timeout = $timeout;

	var ctrl = this;
	this.on('modelChanged', function () {
		ctrl.loadWidgets(ctrl.getModel());
	});
};
WbWidgetGroupCtrl.prototype = new WbAbstractWidget();

/**
 * Check if the widget is selected
 */
WbWidgetGroupCtrl.prototype.isChildSelected = function (widget) {
	if (this.isRoot()) {
		return widget === this.lastSelectedItem;
	}
	return this.getParent().isChildSelected(widget);
};

WbWidgetGroupCtrl.prototype.getChildById = function (id) {
	var widgets = this.childWidgets;
	for (var i = 0; i < widgets.length; i++) {
		if (widgets[i].getId() === id) {
			return widgets[i];
		}
	}
};

/**
 * Gets all children of the group
 * 
 * @return list of all widgets
 */
WbWidgetGroupCtrl.prototype.getChildren = function () {
	return this.childWidgets;
};

WbWidgetGroupCtrl.prototype.loadWidgets = function (model) {
	// destroy all children
	angular.forEach(this.childWidgets, function (widget) {
		widget.destroy();
	});
	this.childWidgets = [];

	// check for new contents
	if (!model || !angular.isArray(model.contents)) {
		return;
	}

	// create contents
	var $widget = this.$widget;
	var $mdTheming = this.$mdTheming;
	var parentWidget = this;
	var $q = this.$q;

	var compilesJob = [];
	model.contents.forEach(function (item, index) {
		var job = $widget.compile(item, parentWidget)//
		.then(function (widget) {
			parentWidget.childWidgets[index] = widget;
		});
		compilesJob.push(job);
	});

	var ctrl = this;
	return $q.all(compilesJob)//
	.then(function () {
		var $element = parentWidget.getElement();
		parentWidget.childWidgets.forEach(function (widget) {
			$element.append(widget.getElement());
		});
	})
	.finally(function () {
		ctrl.fire('loaded');
	});
};



WbWidgetGroupCtrl.prototype.childSelected = function (ctrl, $event) {
	if (!this.isRoot()) {
		return this.getRoot().childSelected(ctrl, $event);
	}
	$event = $event || {};
	if (!$event.shiftKey) {
		this.selectionLock = true;
		angular.forEach(this.lastSelectedItems, function (widget) {
			widget.setSelected(false);
		});
		this.selectionLock = false;
		this.lastSelectedItems = [];
	}

	if (this.lastSelectedItems.indexOf(ctrl) >= 0) {
		return;
	}

	this.lastSelectedItems.push(ctrl);

	// maso, 2018: call the parent controller function
	this.fire('select', {
		widgets: this.lastSelectedItems
	});
};

WbWidgetGroupCtrl.prototype.childUnSelected = function(widget, $event){
	if (!this.isRoot()) {
		return this.getRoot().childSelected(widget, $event);
	}
	if(this.selectionLock){
		return;
	}
	$event = $event || {};
	var index = this.lastSelectedItems.indexOf(widget);
	if(index < 0)  {
		return;
	}
	this.lastSelectedItems.splice(index, 1);
	// maso, 2018: call the parent controller function
	this.fire('select', {
		widgets: this.lastSelectedItems
	});
};

/**
 * Removes a widget
 * 
 * Data model and visual element related to the input model will be removed.
 */
WbWidgetGroupCtrl.prototype.removeChild = function (widget) {
	var index = this.indexOfChild(widget);

	if (index > -1) {
		// remove selection
		if (widget.isSelected()) {
			this.$timeout(function(){
				widget.setSelected(false);
			});
		}
		// remove model
		this.childWidgets.splice(index, 1);

		var model = this.getModel();
		index = model.contents.indexOf(widget.getModel());
		model.contents.splice(index, 1);

		// destroy widget
		widget.destroy();
	}
	return false;
};

/**
 * Adds dragged widget
 */
WbWidgetGroupCtrl.prototype.addChild = function (index, item) {
	var model = this.getModel();
	var ctrl = this;

	// add widget
	item = this.$wbUtil.clean(item);
	this.$widget.compile(item, this)//
	.then(function (newWidget) {
		if (index < ctrl.childWidgets.length) {
			newWidget.getElement().insertBefore(ctrl.childWidgets[index].getElement());
		} else {
			ctrl.getElement().append(newWidget.getElement());
		}
		model.contents.splice(index, 0, item);
		ctrl.childWidgets.splice(index, 0, newWidget);

		// init the widget
		newWidget.setEditable(ctrl.isEditable());
		ctrl.fire('newchild', {
			widget: newWidget
		});
	});
	// TODO: replace with promise
	return true;
};

/**
 * Finds index of child element
 */
WbWidgetGroupCtrl.prototype.moveChild = function (widget, index) {

	function arraymove(arr, fromIndex, toIndex) {
		var element = arr[fromIndex];
		arr.splice(fromIndex, 1);
		arr.splice(toIndex, 0, element);
	}

	if (index < 0 || index > this.getChildren().length - 1 || this.getChildren().length === 1) {
		return;
	}
	if (this.getModel().contents.indexOf(widget.getModel()) === index) {
		return;
	}
	var positionWidget = this.getChildren()[index];
	// move element
	if (this.getModel().contents.indexOf(widget.getModel()) < index) {
		positionWidget.getElement().after(widget.getElement());
	} else {
		positionWidget.getElement().before(widget.getElement());
	}

	// move model
	arraymove(this.getModel().contents, this.getModel().contents.indexOf(widget.getModel()), index);

	// move controller
	arraymove(this.getChildren(), this.indexOfChild(widget), index);

	this.fireResizeLayout({
		source: widget
	});
};

/**
 * Finds index of child element
 */
WbWidgetGroupCtrl.prototype.indexOfChild = function (widget) {
	if (!this.childWidgets || !this.childWidgets.length) {
		return -1;
	}
	return this.childWidgets.indexOf(widget);
};


/**
 * Delete the widget
 * 
 * This function just used in edit mode
 * 
 * @memberof WbWidgetGroupCtrl
 */
WbWidgetGroupCtrl.prototype.delete = function () {
	// remove all children
	var widgets = this.getChildren();
	angular.forEach(widgets, function (widget) {
		widget.delete();
	});

	// remove itself
	this.fire('delete');
	if (!this.isRoot()) {
		this.getParent()
		.removeChild(this);
	}
};

/**
 * List of allowed child
 * 
 * @memeberof WbWidgetGroupCtrl
 */
WbWidgetGroupCtrl.prototype.getAllowedTypes = function () {
	if (!this.isRoot()) {
		return this.getParent().getAllowedTypes();
	}
	return this.allowedTypes;
};

WbWidgetGroupCtrl.prototype.setAllowedTypes = function (allowedTypes) {
	return this.allowedTypes = allowedTypes;
};


//submit the controller
angular.module('am-wb-core')//
.controller('WbWidgetCtrl', WbWidgetCtrl)//
.controller('WbWidgetGroupCtrl', WbWidgetGroupCtrl);

