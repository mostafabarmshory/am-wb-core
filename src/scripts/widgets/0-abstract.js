
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



/**
 * @ngdoc Widgets
 * @name WbWidget
 * @descreption Abstract widget
 * 
 * This is an abstract implementation of the widgets. ## Models
 * 
 * The model of the widget is consist of two main part:
 * 
 * <ul>
 * <li>User data</li>
 * <li>Runtime data</li>
 * </ul>
 * 
 * User data is set as input data model and the runtime data is managed by
 * events and user functions.
 * 
 * Finally the combination of user and runtime data is used to update the view.
 * 
 * The setModelProperty changes the user data model.
 * 
 * The setProperty changes the runtime properties.
 *  ## Events
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
angular.module('am-wb-core').factory('WbWidget', function($widget, $window, $objectPath, $log) {

	function debounce(func, wait) {
		var timeout;
		return function() {
			var context = this;
			var args = arguments;
			var later = function() {
				timeout = null;
				func.apply(context, args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	}

	function WbWidget($element, $parent) {
		this.elementAttributes = [
			// identification
			'id',
			'name',
			'title',
			'class',
			// access
			'accesskey',
			'contenteditable',
			'hidden',
			'tabindex',
			// language
			'dir',
			'lang',
			'translate',
			'spellcheck',
			/*
			 * NOTE: We must manage D&D internally to mange user D&D codes
			 * TODO: maso, 2019: move dnd into a processor
			 */
			'draggable',
			'dropzone',
		];
		this.$element = $element;
		this.$parent = $parent;
		/**
		 * State of the widget
		 * 
		 * - init
		 * - edit
		 * - ready
		 * - deleted
		 * 
		 * @memberof WbAbstractWidget
		 */
		this.state;

		this.actions = [];
		this.callbacks = [];
		this.childWidgets = [];

		/*
		 * This is a cache of customer function
		 * 
		 */
		this.eventFunctions = {};
		this.computedStyle = {};

		// models
		this.runtimeModel = {
			style: {},
			on: {},
		};
		this.model = {};
		// event listeners
		var ctrl = this;
		/*
		 * TODO: maso, 2019: move to event manager.
		 */
		this.eventListeners = {
			scroll: function($event) {
				ctrl.fire('scroll', $event);
			},
			click: function($event) {
				ctrl.fire('click', $event);
			},
			dblclick: function($event) {
				ctrl.fire('dblclick', $event);
			},
			mouseout: function($event) {
				ctrl.fire('mouseout', $event);
			},
			mouseover: function($event) {
				ctrl.fire('mouseover', $event);
			},
			mousedown: function($event) {
				ctrl.fire('mousedown', $event);
			},
			mouseup: function($event) {
				ctrl.fire('mouseup', $event);
			},
			mouseenter: function($event) {
				ctrl.fire('mouseenter', $event);
			},
			mouseleave: function($event) {
				ctrl.fire('mouseleave', $event);
			},

			// Media events
			error: function($event) {
				ctrl.fire('error', $event);
			},
			success: function($event) {
				ctrl.fire('success', $event);
			},
			load: function($event) {
				ctrl.fire('load', $event);
			},

			// DND
			dragstart: function($event) {
				ctrl.fire('dragstart', $event);
			},
			dragend: function($event) {
				ctrl.fire('dragend', $event);
			},
			dragenter: function($event) {
				ctrl.fire('dragenter', $event);
			},
			dragover: function($event) {
				ctrl.fire('dragover', $event);
			},
			dragleave: function($event) {
				ctrl.fire('dragleave', $event);
			},
			drop: function($event) {
				ctrl.fire('drop', $event);
			},

			change: function($event) {
				ctrl.fire('change', $event);
			},
			input: function($event) {
				ctrl.fire('input', $event);
			},

			/*
			 * Keyboard events
			 */
			keyup: function($event) {
				ctrl.fire('keyup', $event);
			},
			keydown: function($event) {
				ctrl.fire('keydown', $event);
			},
			keypress: function($event) {
				ctrl.fire('keypress', $event);
			},

		};

		/*
		 * Add resize observer to the element
		 */
		this.resizeObserver = new ResizeObserver(debounce(function($event) {
			if (angular.isArray($event)) {
				$event = $event[0];
			}
			ctrl.fire('resize', $event);
		}, 300));

		var options = {
			root: null,
			rootMargin: '0px',
			threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
		};

		this.intersectionObserver = new IntersectionObserver(function($event) {
			if (_.isArray($event)) {
				$event = $event[0];
			}
			ctrl.setIntersecting($event.isIntersecting, $event);
		}, options);

		this.connect();
	}

	/**
	 * Returns model of the widget
	 * 
	 * The model is managed by other entity and used as read only part in the
	 * widget.
	 * 
	 * By the way it is supposed that the model is used just in a widget and to
	 * modify the model, a method of the widget is called. In this case the widget
	 * fire the changes of the model.
	 * 
	 * @see #setModelProperty(key, value)
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getModel = function() {
		return this.model;
	};

	/**
	 * Sets model of the widget
	 * 
	 * @see #getModel()
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setModel = function(model) {
		if (model === this.model) {
			return;
		}
		this.setState('init');
		this.model = model;
		this.runtimeModel = {
			style: {},
			on: {},
		};
		this.fire('modelChanged');
		this.setState('ready');
		return this;
	};

	/**
	 * Checks if the key exist in the widget model
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.hasModelProperty = function(key) {
		return $objectPath.has(this.getModel(), key);
	};

	/**
	 * Get model property
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getModelProperty = function(key) {
		return $objectPath.get(this.getModel(), key);
	};

	/**
	 * Sets new model property value
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setModelProperty = function(key, value) {
		// create the event
		var $event = {
			source: this,
			key: key,
			keys: [key],
			oldValue: this.getModelProperty(key),
			value: value
		};

		// check if value changed
		if (angular.equals($event.oldValue, $event.value)) {
			return;
		}

		// Set the address
		if (value) {
			$objectPath.set(this.getModel(), key, value);
		} else {
			$objectPath.del(this.getModel(), key);
		}
		this.fire('modelUpdated', $event);
	};

	/**
	 * Gets runtime model
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getRuntimeModel = function() {
		return this.runtimeModel;
	};

	/**
	 * Checks if property exist
	 * 
	 * NOTE: just look for runtime property
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.hasProperty = function(key) {
		return $objectPath.has(this.getRuntimeModel(), key);
	};

	/**
	 * Gets property of the model
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getProperty = function(key) {
		return $objectPath.get(this.getRuntimeModel(), key);
	};

	/**
	 * Remove property
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.removeProperty = function(key) {
		var model = this.getRuntimeModel();
		$objectPath.del(model, key);
	};

	/**
	 * Changes property value
	 * 
	 * If the change cause the view to update then this function will update and
	 * render the view.
	 * 
	 * @memberof WbAbstractWidget
	 * @name setProperty
	 */
	WbWidget.prototype.setProperty = function(key, value) {
		/*
		 * Support old widget scripts
		 */
		switch (key) {
			case 'style.layout.direction':
				key = 'style.flexDirection';
				break;
			case 'style.background.color':
				key = 'style.backgroundColor';
				break;
			case 'style.size.width':
				key = 'style.width';
				break;
			case 'style.size.height':
				key = 'style.height';
				break;
		}
		// create the event
		var $event = {
			source: this,
			key: key,
			keys: [key],
			oldValue: this.getProperty(key),
			value: value
		};

		// check if value changed
		if (angular.equals($event.oldValue, $event.value)) {
			return;
		}

		// Set the address
		var model = this.getRuntimeModel();
		if (angular.isDefined(value)) {
			$objectPath.set(model, key, value);
		} else {
			$objectPath.del(model, key);
		}
		this.fire('modelUpdated', $event);
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
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.style = function(style, value) {
		// there is no argument so act as get
		if (!angular.isDefined(style)) {
			return angular.copy(this.getProperty('style'));
		}
		// style is a key
		if (angular.isString(style)) {
			if (angular.isDefined(value)) {
				return this.setStyle(style, value);
			} else {
				return this.getStyle(style);
			}
		}
	};

	/**
	 * Sets style of the widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setStyle = function(key, value) {
		this.setProperty('style.' + key, value);
	};

	/**
	 * Get style from widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getStyle = function(key) {
		return this.getProperty('style.' + key);
	};


	/**
	 * Delete the widget
	 * 
	 * This function just used in edit mode
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.delete = function() {
		// remove itself
		this.fire('delete');
		this.getParent().removeChild(this);
	};

	/**
	 * Remove the widgets
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.destroy = function($event) {
		// remove scope
		this.fire('destroy', $event);

		// remove callbacks
		this.callbacks = [];
		this.actions = [];
		this.model = null;

		// destroy children
		angular.forEach(this.childWidgets, function(widget) {
			widget.destroy();
		});
		this.childWidgets = [];

		// destroy view
		if (!this.isRoot()) {
			var $element = this.getElement();
			$element.remove();
		}
	};

	/**
	 * Disconnect view with the widget
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.disconnect = function() {
		var $element = this.getElement();
		if (!$element) {
			return;
		}
		this.resizeObserver.unobserve($element[0]);
		this.intersectionObserver.unobserve($element[0]);
		angular.forEach(this.eventListeners, function(listener, key) {
			$element.off(key, listener);
		});
	};

	/**
	 * Connects view with widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.connect = function() {
		var $element = this.getElement();
		if (!$element) {
			return;
		}
		angular.forEach(this.eventListeners, function(listener, key) {
			$element.on(key, listener);
		});
		this.resizeObserver.observe($element[0]);
		this.intersectionObserver.observe($element[0]);
	};

	/**
	 * Get elements of the widget
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getElement = function() {
		return this.$element;
	};

	/**
	 * Sets element attributes
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setElementAttribute = function(key, value) {
		var $element = this.$element;
		if (value) {
			$element.attr(key, value);
		} else {
			$element.removeAttr(key);
		}
	};

	/**
	 * Get element attribute
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getElementAttribute = function(key) {
		return this.$element.attr(key);
	};

	/**
	 * Remove element attribute
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.removeElementAttribute = function(key) {
		this.$element.removeAttr(key);
	};

	/**
	 * Set widget silent
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setSilent = function(silent) {
		this.silent = silent;
	};

	/**
	 * Checks if the element is silent
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.isSilent = function() {
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
	WbWidget.prototype.on = function(type, callback) {
		if (!angular.isFunction(callback)) {
			throw {
				message: 'Callback must be a function'
			};
		}
		if (!angular.isArray(this.callbacks[type])) {
			this.callbacks[type] = [];
		}
		if (this.callbacks[type].includes(callback)) {
			return;
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
	WbWidget.prototype.off = function(type, callback) {
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
	 * Before callbacks, widget processors will process the widget and event.
	 * 
	 * @param type
	 *            of the event
	 * @param params
	 *            to add to the event
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.fire = function(type, params) {
		params = params || {};

		// 1- Call processors
		var event = params || {};
		event.source = this;
		event.type = type;
		$widget.applyProcessors(this, event);

		// 2- call listeners
		if (this.isSilent() || !angular.isDefined(this.callbacks[type])) {
			return;
		}
		var callbacks = this.callbacks[type];
		var resultData = null;
		for (var i = 0; i < callbacks.length; i++) {
			// TODO: maso, 2018: check if the event is stopped to propagate
			try {
				resultData = callbacks[i](event) || resultData;
			} catch (error) {
				// NOTE: remove on release
				$log.log(error);
			}
		}
		return resultData;
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
	 * @returns {WbAbstractWidget.model.style.flexDirection|undefined}
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getDirection = function() {
		return this.getModelProperty('style.flexDirection') || 'column';
	};

	/**
	 * Get events of the widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getEvent = function() {
		return this.getModelProperty('on') || {};
	};

	/**
	 * Get title of the widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getTitle = function() {
		return this.getModelProperty('label');
	};

	/**
	 * Gets type
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getType = function() {
		return this.getModelProperty('type');
	};

	/**
	 * Gets Id of the model
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getId = function() {
		return this.getModelProperty('id');
	};

	/**
	 * Gets name of the widget
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getName = function() {
		return this.getModelProperty('name');
	};

	/**
	 * Get parent widget
	 * 
	 * Parent widget is called container in this model. It is attached dynamically
	 * on the render phease.
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getParent = function() {
		return this.$parent;
	};

	/**
	 * Sets the state of the widget
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setState = function(state) {
		if (state === this.state) {
			return;
		}
		var oldState = this.state;
		this.state = state;
		this.fire('stateChanged', {
			oldValue: oldState,
			value: state
		});
	};

	/**
	 * Checks if the editable mode is enable
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.isEditable = function() {
		return this.editable;
	};

	/**
	 * Set edit mode
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setEditable = function(editable) {
		if (this.editable === editable) {
			return;
		}
		this.editable = editable;
		if (editable) {
			this.setState('edit');
		} else {
			this.setState('ready');
		}
		// propagate to child
		angular.forEach(this.childWidgets, function(widget) {
			widget.setEditable(editable);
		});
	};

	/**
	 * Check if intersecting
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.isIntersecting = function() {
		return this.intersecting;
	};

	/**
	 * Set intersecting true
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.setIntersecting = function(intersecting, $event) {
		if (_.isUndefined(this.intersecting)) {
			intersecting = true;
		}
		this.intersecting = intersecting;
		this.fire('intersection', $event);
	};

	/**
	 * Clone current widget This method works in edit mode only.
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.clone = function() {
		var $parent = this.getParent();
		var index = $parent.indexOfChild(this);
		$parent.addChild(index, angular.copy(this.getModel()));
	};

	/**
	 * This method moves widget one to next.
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.moveNext = function() {
		var $parent = this.getParent();
		$parent.moveChild(this, $parent.indexOfChild(this) + 1);
	};

	/**
	 * This method moves widget one to before
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.moveBefore = function() {
		var $parent = this.getParent();
		$parent.moveChild(this, $parent.indexOfChild(this) - 1);
	};

	/**
	 * This method moves widget to the first of it's parent
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.moveFirst = function() {
		var $parent = this.getParent();
		$parent.moveChild(this, 0);
	};

	/**
	 * This method moves widget to the last of it's parent
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.moveLast = function() {
		var $parent = this.getParent();
		$parent.moveChild(this, $parent.getChildren().length - 1);
	};

	/**
	 * Checks if the widget is root
	 * 
	 * If there is no parent controller then this is a root one.
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.isRoot = function() {
		var $parent = this.getParent();
		return angular.isUndefined($parent) || $parent === null;
	};

	/**
	 * Gets root widgets of the widget
	 * 
	 * @return the root widget
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getRoot = function() {
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
	WbWidget.prototype.isSelected = function() {
		return this.selected;
	};

	WbWidget.prototype.setSelected = function(flag) {
		if (this.selected === flag) {
			return;
		}
		// fire events
		this.selected = flag;
		if (flag) {
			this.fire('select');
		} else {
			this.fire('unselect');
		}
	};

	/**
	 * Add new action in actions list
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.addAction = function(action) {
		this.actions.push(action);
	};

	/**
	 * Gets widget actions
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getActions = function() {
		return this.actions;
	};

	/**
	 * Returns bounding client rectangle to parent
	 * 
	 * @return bounding rectangle
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getBoundingClientRect = function() {
		var element = this.getElement();
		if (!element) {
			return {
				width: 0,
				height: 0,
				top: 0,
				left: 0
			};
		}

		var offset = element.offset();
		var width = element.outerWidth();
		var height = element.outerHeight();

		return {
			// rect
			width: width,
			height: height,
			// offset
			top: offset.top /*+ parseInt(element.css('marginTop'), 10)*/ + element.scrollTop(),
			left: offset.left /*+ parseInt(element.css('marginLeft'), 10)*/ + element.scrollLeft()
		};
	};


	/**
	 * Adds animation to the page
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.animate = function(options) {
		var animation = {
			targets: this.getRuntimeModel(),
		};

		// copy animation properties
		if (options.duration) {
			animation.duration = options.duration;
		}
		if (options.loop) {
			animation.loop = options.loop;
		}
		if (options.autoplay) {
			animation.autoplay = options.autoplay;
		}
		if (options.delay) {
			animation.delay = options.delay;
		}
		if (options.easing) {
			animation.easing = options.easing;
		}

		// Create list of attributes
		var ctrl = this;
		var keys = [];
		for (var key in options) {
			// ignore keys
			if (_.includes(['duration', 'loop', 'autoplay', 'delay', 'easing'], key)) {
				continue;
			}
			keys.push(key);
			animation[key] = options[key];
			// set initial value
			var val = this.getProperty(key);
			if (!val) {
				this.setProperty(key, this.getModelProperty(key));
			}
		}
		animation.update = function() {
			ctrl.fire('modelUpdated', {
				keys: keys,
				value: null,
				oldValue: null
			});
		};

		return anime(animation);
	};

	/**
	 * Remove animations from the widget
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.removeAnimation = function() {
		// The animation will not add to element so there is no need to remove
	};

	/**
	 * Sets window of the widget
	 * 
	 * @memberof WbAbstractWidget
	 * @params window {WbWindow} of the current widget
	 */
	WbWidget.prototype.setWindow = function(window) {
		this.window = window;
	};

	/**
	 * Gets window of the widget
	 * 
	 * @memberof WbAbstractWidget
	 * @return window of the current widget or from the root
	 */
	WbWidget.prototype.getWindow = function() {
		return this.window || this.getRoot().getWindow() || $window;
	};


	/**
	 * Adds attributes into the element attributes
	 * 
	 * $widget.addElementAttributes('a', 'b');
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.addElementAttributes = function() {
		this.elementAttributes = _.union(this.elementAttributes, arguments);
	};

	/**
	 * Gets element attributes
	 * 
	 * @memberof WbAbstractWidget
	 */
	WbWidget.prototype.getElementAttributes = function() {
		return this.elementAttributes;
	};

	return WbWidget;
});

