(function (global, factory) {
	'use strict';
	if(typeof exports === 'object' && typeof module !== 'undefined'){
		module.exports = factory();
	} else {
//		typeof define === 'function' && define.amd ? define(factory) :
		global.ResizeObserver = factory();
	}
}(this, (function () { 
	'use strict';

	/**
	 * A collection of shims that provide minimal functionality of the ES6 collections.
	 *
	 * These implementations are not meant to be used outside of the ResizeObserver
	 * modules as they cover only a limited range of use cases.
	 */
	/* eslint-disable require-jsdoc, valid-jsdoc */
	var MapShim = (function () {
		if (typeof Map !== 'undefined') {
			return Map;
		}
		/**
		 * Returns index in provided array that matches the specified key.
		 *
		 * @param {Array<Array>} arr
		 * @param {*} key
		 * @returns {number}
		 */
		function getIndex(arr, key) {
			var result = -1;
			arr.some(function (entry, index) {
				if (entry[0] === key) {
					result = index;
					return true;
				}
				return false;
			});
			return result;
		}
		return /** @class */ (function () {
			function class_1() {
				this.__entries__ = [];
			}
			Object.defineProperty(class_1.prototype, "size", {
				/**
				 * @returns {boolean}
				 */
				get: function () {
					return this.__entries__.length;
				},
				enumerable: true,
				configurable: true
			});
			/**
			 * @param {*} key
			 * @returns {*}
			 */
			class_1.prototype.get = function (key) {
				var index = getIndex(this.__entries__, key);
				var entry = this.__entries__[index];
				return entry && entry[1];
			};
			/**
			 * @param {*} key
			 * @param {*} value
			 * @returns {void}
			 */
			class_1.prototype.set = function (key, value) {
				var index = getIndex(this.__entries__, key);
				if (~index) {
					this.__entries__[index][1] = value;
				}
				else {
					this.__entries__.push([key, value]);
				}
			};
			/**
			 * @param {*} key
			 * @returns {void}
			 */
			class_1.prototype.delete = function (key) {
				var entries = this.__entries__;
				var index = getIndex(entries, key);
				if (~index) {
					entries.splice(index, 1);
				}
			};
			/**
			 * @param {*} key
			 * @returns {void}
			 */
			class_1.prototype.has = function (key) {
				return !!~getIndex(this.__entries__, key);
			};
			/**
			 * @returns {void}
			 */
			class_1.prototype.clear = function () {
				this.__entries__.splice(0);
			};
			/**
			 * @param {Function} callback
			 * @param {*} [ctx=null]
			 * @returns {void}
			 */
			class_1.prototype.forEach = function (callback, ctx) {
				if (ctx === void 0) { ctx = null; }
				for (var _i = 0, _a = this.__entries__; _i < _a.length; _i++) {
					var entry = _a[_i];
					callback.call(ctx, entry[1], entry[0]);
				}
			};
			return class_1;
		}());
	})();

	/**
	 * Detects whether window and document objects are available in current environment.
	 */
	var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

	// Returns global object of a current environment.
	var global$1 = (function () {
		if (typeof global !== 'undefined' && global.Math === Math) {
			return global;
		}
		if (typeof self !== 'undefined' && self.Math === Math) {
			return self;
		}
		if (typeof window !== 'undefined' && window.Math === Math) {
			return window;
		}
		// eslint-disable-next-line no-new-func
		return Function('return this')();
	})();

	/**
	 * A shim for the requestAnimationFrame which falls back to the setTimeout if
	 * first one is not supported.
	 *
	 * @returns {number} Requests' identifier.
	 */
	var requestAnimationFrame$1 = (function () {
		if (typeof requestAnimationFrame === 'function') {
			// It's required to use a bounded function because IE sometimes throws
			// an "Invalid calling object" error if rAF is invoked without the global
			// object on the left hand side.
			return requestAnimationFrame.bind(global$1);
		}
		return function (callback) { return setTimeout(function () { return callback(Date.now()); }, 1000 / 60); };
	})();

	// Defines minimum timeout before adding a trailing call.
	var trailingTimeout = 2;
	/**
	 * Creates a wrapper function which ensures that provided callback will be
	 * invoked only once during the specified delay period.
	 *
	 * @param {Function} callback - Function to be invoked after the delay period.
	 * @param {number} delay - Delay after which to invoke callback.
	 * @returns {Function}
	 */
	function throttle (callback, delay) {
		var leadingCall = false, trailingCall = false, lastCallTime = 0;
		/**
		 * Invokes the original callback function and schedules new invocation if
		 * the "proxy" was called during current request.
		 *
		 * @returns {void}
		 */
		function resolvePending() {
			if (leadingCall) {
				leadingCall = false;
				callback();
			}
			if (trailingCall) {
				proxy();
			}
		}
		/**
		 * Callback invoked after the specified delay. It will further postpone
		 * invocation of the original function delegating it to the
		 * requestAnimationFrame.
		 *
		 * @returns {void}
		 */
		function timeoutCallback() {
			requestAnimationFrame$1(resolvePending);
		}
		/**
		 * Schedules invocation of the original function.
		 *
		 * @returns {void}
		 */
		function proxy() {
			var timeStamp = Date.now();
			if (leadingCall) {
				// Reject immediately following calls.
				if (timeStamp - lastCallTime < trailingTimeout) {
					return;
				}
				// Schedule new call to be in invoked when the pending one is resolved.
				// This is important for "transitions" which never actually start
				// immediately so there is a chance that we might miss one if change
				// happens amids the pending invocation.
				trailingCall = true;
			}
			else {
				leadingCall = true;
				trailingCall = false;
				setTimeout(timeoutCallback, delay);
			}
			lastCallTime = timeStamp;
		}
		return proxy;
	}

	// Minimum delay before invoking the update of observers.
	var REFRESH_DELAY = 20;
	// A list of substrings of CSS properties used to find transition events that
	// might affect dimensions of observed elements.
	var transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
	// Check if MutationObserver is available.
	var mutationObserverSupported = typeof MutationObserver !== 'undefined';
	/**
	 * Singleton controller class which handles updates of ResizeObserver instances.
	 */
	var ResizeObserverController = /** @class */ (function () {
		/**
		 * Creates a new instance of ResizeObserverController.
		 *
		 * @private
		 */
		function ResizeObserverController() {
			/**
			 * Indicates whether DOM listeners have been added.
			 *
			 * @private {boolean}
			 */
			this.connected_ = false;
			/**
			 * Tells that controller has subscribed for Mutation Events.
			 *
			 * @private {boolean}
			 */
			this.mutationEventsAdded_ = false;
			/**
			 * Keeps reference to the instance of MutationObserver.
			 *
			 * @private {MutationObserver}
			 */
			this.mutationsObserver_ = null;
			/**
			 * A list of connected observers.
			 *
			 * @private {Array<ResizeObserverSPI>}
			 */
			this.observers_ = [];
			this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
			this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
		}
		/**
		 * Adds observer to observers list.
		 *
		 * @param {ResizeObserverSPI} observer - Observer to be added.
		 * @returns {void}
		 */
		ResizeObserverController.prototype.addObserver = function (observer) {
			if (!~this.observers_.indexOf(observer)) {
				this.observers_.push(observer);
			}
			// Add listeners if they haven't been added yet.
			if (!this.connected_) {
				this.connect_();
			}
		};
		/**
		 * Removes observer from observers list.
		 *
		 * @param {ResizeObserverSPI} observer - Observer to be removed.
		 * @returns {void}
		 */
		ResizeObserverController.prototype.removeObserver = function (observer) {
			var observers = this.observers_;
			var index = observers.indexOf(observer);
			// Remove observer if it's present in registry.
			if (~index) {
				observers.splice(index, 1);
			}
			// Remove listeners if controller has no connected observers.
			if (!observers.length && this.connected_) {
				this.disconnect_();
			}
		};
		/**
		 * Invokes the update of observers. It will continue running updates insofar
		 * it detects changes.
		 *
		 * @returns {void}
		 */
		ResizeObserverController.prototype.refresh = function () {
			var changesDetected = this.updateObservers_();
			// Continue running updates if changes have been detected as there might
			// be future ones caused by CSS transitions.
			if (changesDetected) {
				this.refresh();
			}
		};
		/**
		 * Updates every observer from observers list and notifies them of queued
		 * entries.
		 *
		 * @private
		 * @returns {boolean} Returns "true" if any observer has detected changes in
		 *      dimensions of it's elements.
		 */
		ResizeObserverController.prototype.updateObservers_ = function () {
			// Collect observers that have active observations.
			var activeObservers = this.observers_.filter(function (observer) {
				return observer.gatherActive(), observer.hasActive();
			});
			// Deliver notifications in a separate cycle in order to avoid any
			// collisions between observers, e.g. when multiple instances of
			// ResizeObserver are tracking the same element and the callback of one
			// of them changes content dimensions of the observed target. Sometimes
			// this may result in notifications being blocked for the rest of observers.
			activeObservers.forEach(function (observer) { return observer.broadcastActive(); });
			return activeObservers.length > 0;
		};
		/**
		 * Initializes DOM listeners.
		 *
		 * @private
		 * @returns {void}
		 */
		ResizeObserverController.prototype.connect_ = function () {
			// Do nothing if running in a non-browser environment or if listeners
			// have been already added.
			if (!isBrowser || this.connected_) {
				return;
			}
			// Subscription to the "Transitionend" event is used as a workaround for
			// delayed transitions. This way it's possible to capture at least the
			// final state of an element.
			document.addEventListener('transitionend', this.onTransitionEnd_);
			window.addEventListener('resize', this.refresh);
			if (mutationObserverSupported) {
				this.mutationsObserver_ = new MutationObserver(this.refresh);
				this.mutationsObserver_.observe(document, {
					attributes: true,
					childList: true,
					characterData: true,
					subtree: true
				});
			}
			else {
				document.addEventListener('DOMSubtreeModified', this.refresh);
				this.mutationEventsAdded_ = true;
			}
			this.connected_ = true;
		};
		/**
		 * Removes DOM listeners.
		 *
		 * @private
		 * @returns {void}
		 */
		ResizeObserverController.prototype.disconnect_ = function () {
			// Do nothing if running in a non-browser environment or if listeners
			// have been already removed.
			if (!isBrowser || !this.connected_) {
				return;
			}
			document.removeEventListener('transitionend', this.onTransitionEnd_);
			window.removeEventListener('resize', this.refresh);
			if (this.mutationsObserver_) {
				this.mutationsObserver_.disconnect();
			}
			if (this.mutationEventsAdded_) {
				document.removeEventListener('DOMSubtreeModified', this.refresh);
			}
			this.mutationsObserver_ = null;
			this.mutationEventsAdded_ = false;
			this.connected_ = false;
		};
		/**
		 * "Transitionend" event handler.
		 *
		 * @private
		 * @param {TransitionEvent} event
		 * @returns {void}
		 */
		ResizeObserverController.prototype.onTransitionEnd_ = function (_a) {
			var _b = _a.propertyName, propertyName = _b === void 0 ? '' : _b;
			// Detect whether transition may affect dimensions of an element.
			var isReflowProperty = transitionKeys.some(function (key) {
				return !!~propertyName.indexOf(key);
			});
			if (isReflowProperty) {
				this.refresh();
			}
		};
		/**
		 * Returns instance of the ResizeObserverController.
		 *
		 * @returns {ResizeObserverController}
		 */
		ResizeObserverController.getInstance = function () {
			if (!this.instance_) {
				this.instance_ = new ResizeObserverController();
			}
			return this.instance_;
		};
		/**
		 * Holds reference to the controller's instance.
		 *
		 * @private {ResizeObserverController}
		 */
		ResizeObserverController.instance_ = null;
		return ResizeObserverController;
	}());

	/**
	 * Defines non-writable/enumerable properties of the provided target object.
	 *
	 * @param {Object} target - Object for which to define properties.
	 * @param {Object} props - Properties to be defined.
	 * @returns {Object} Target object.
	 */
	var defineConfigurable = (function (target, props) {
		for (var _i = 0, _a = Object.keys(props); _i < _a.length; _i++) {
			var key = _a[_i];
			Object.defineProperty(target, key, {
				value: props[key],
				enumerable: false,
				writable: false,
				configurable: true
			});
		}
		return target;
	});

	/**
	 * Returns the global object associated with provided element.
	 *
	 * @param {Object} target
	 * @returns {Object}
	 */
	var getWindowOf = (function (target) {
		// Assume that the element is an instance of Node, which means that it
		// has the "ownerDocument" property from which we can retrieve a
		// corresponding global object.
		var ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
		// Return the local global object if it's not possible extract one from
		// provided element.
		return ownerGlobal || global$1;
	});

	// Placeholder of an empty content rectangle.
	var emptyRect = createRectInit(0, 0, 0, 0);
	/**
	 * Converts provided string to a number.
	 *
	 * @param {number|string} value
	 * @returns {number}
	 */
	function toFloat(value) {
		return parseFloat(value) || 0;
	}
	/**
	 * Extracts borders size from provided styles.
	 *
	 * @param {CSSStyleDeclaration} styles
	 * @param {...string} positions - Borders positions (top, right, ...)
	 * @returns {number}
	 */
	function getBordersSize(styles) {
		var positions = [];
		for (var _i = 1; _i < arguments.length; _i++) {
			positions[_i - 1] = arguments[_i];
		}
		return positions.reduce(function (size, position) {
			var value = styles['border-' + position + '-width'];
			return size + toFloat(value);
		}, 0);
	}
	/**
	 * Extracts paddings sizes from provided styles.
	 *
	 * @param {CSSStyleDeclaration} styles
	 * @returns {Object} Paddings box.
	 */
	function getPaddings(styles) {
		var positions = ['top', 'right', 'bottom', 'left'];
		var paddings = {};
		for (var _i = 0, positions_1 = positions; _i < positions_1.length; _i++) {
			var position = positions_1[_i];
			var value = styles['padding-' + position];
			paddings[position] = toFloat(value);
		}
		return paddings;
	}
	/**
	 * Calculates content rectangle of provided SVG element.
	 *
	 * @param {SVGGraphicsElement} target - Element content rectangle of which needs
	 *      to be calculated.
	 * @returns {DOMRectInit}
	 */
	function getSVGContentRect(target) {
		var bbox = target.getBBox();
		return createRectInit(0, 0, bbox.width, bbox.height);
	}
	/**
	 * Calculates content rectangle of provided HTMLElement.
	 *
	 * @param {HTMLElement} target - Element for which to calculate the content rectangle.
	 * @returns {DOMRectInit}
	 */
	function getHTMLElementContentRect(target) {
		// Client width & height properties can't be
		// used exclusively as they provide rounded values.
		var clientWidth = target.clientWidth, clientHeight = target.clientHeight;
		// By this condition we can catch all non-replaced inline, hidden and
		// detached elements. Though elements with width & height properties less
		// than 0.5 will be discarded as well.
		//
		// Without it we would need to implement separate methods for each of
		// those cases and it's not possible to perform a precise and performance
		// effective test for hidden elements. E.g. even jQuery's ':visible' filter
		// gives wrong results for elements with width & height less than 0.5.
		if (!clientWidth && !clientHeight) {
			return emptyRect;
		}
		var styles = getWindowOf(target).getComputedStyle(target);
		var paddings = getPaddings(styles);
		var horizPad = paddings.left + paddings.right;
		var vertPad = paddings.top + paddings.bottom;
		// Computed styles of width & height are being used because they are the
		// only dimensions available to JS that contain non-rounded values. It could
		// be possible to utilize the getBoundingClientRect if only it's data wasn't
		// affected by CSS transformations let alone paddings, borders and scroll bars.
		var width = toFloat(styles.width), height = toFloat(styles.height);
		// Width & height include paddings and borders when the 'border-box' box
		// model is applied (except for IE).
		if (styles.boxSizing === 'border-box') {
			// Following conditions are required to handle Internet Explorer which
			// doesn't include paddings and borders to computed CSS dimensions.
			//
			// We can say that if CSS dimensions + paddings are equal to the "client"
			// properties then it's either IE, and thus we don't need to subtract
			// anything, or an element merely doesn't have paddings/borders styles.
			if (Math.round(width + horizPad) !== clientWidth) {
				width -= getBordersSize(styles, 'left', 'right') + horizPad;
			}
			if (Math.round(height + vertPad) !== clientHeight) {
				height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
			}
		}
		// Following steps can't be applied to the document's root element as its
		// client[Width/Height] properties represent viewport area of the window.
		// Besides, it's as well not necessary as the <html> itself neither has
		// rendered scroll bars nor it can be clipped.
		if (!isDocumentElement(target)) {
			// In some browsers (only in Firefox, actually) CSS width & height
			// include scroll bars size which can be removed at this step as scroll
			// bars are the only difference between rounded dimensions + paddings
			// and "client" properties, though that is not always true in Chrome.
			var vertScrollbar = Math.round(width + horizPad) - clientWidth;
			var horizScrollbar = Math.round(height + vertPad) - clientHeight;
			// Chrome has a rather weird rounding of "client" properties.
			// E.g. for an element with content width of 314.2px it sometimes gives
			// the client width of 315px and for the width of 314.7px it may give
			// 314px. And it doesn't happen all the time. So just ignore this delta
			// as a non-relevant.
			if (Math.abs(vertScrollbar) !== 1) {
				width -= vertScrollbar;
			}
			if (Math.abs(horizScrollbar) !== 1) {
				height -= horizScrollbar;
			}
		}
		return createRectInit(paddings.left, paddings.top, width, height);
	}
	/**
	 * Checks whether provided element is an instance of the SVGGraphicsElement.
	 *
	 * @param {Element} target - Element to be checked.
	 * @returns {boolean}
	 */
	var isSVGGraphicsElement = (function () {
		// Some browsers, namely IE and Edge, don't have the SVGGraphicsElement
		// interface.
		if (typeof SVGGraphicsElement !== 'undefined') {
			return function (target) { return target instanceof getWindowOf(target).SVGGraphicsElement; };
		}
		// If it's so, then check that element is at least an instance of the
		// SVGElement and that it has the "getBBox" method.
		// eslint-disable-next-line no-extra-parens
		return function (target) { return (target instanceof getWindowOf(target).SVGElement &&
				typeof target.getBBox === 'function'); };
	})();
	/**
	 * Checks whether provided element is a document element (<html>).
	 *
	 * @param {Element} target - Element to be checked.
	 * @returns {boolean}
	 */
	function isDocumentElement(target) {
		return target === getWindowOf(target).document.documentElement;
	}
	/**
	 * Calculates an appropriate content rectangle for provided html or svg element.
	 *
	 * @param {Element} target - Element content rectangle of which needs to be calculated.
	 * @returns {DOMRectInit}
	 */
	function getContentRect(target) {
		if (!isBrowser) {
			return emptyRect;
		}
		if (isSVGGraphicsElement(target)) {
			return getSVGContentRect(target);
		}
		return getHTMLElementContentRect(target);
	}
	/**
	 * Creates rectangle with an interface of the DOMRectReadOnly.
	 * Spec: https://drafts.fxtf.org/geometry/#domrectreadonly
	 *
	 * @param {DOMRectInit} rectInit - Object with rectangle's x/y coordinates and dimensions.
	 * @returns {DOMRectReadOnly}
	 */
	function createReadOnlyRect(_a) {
		var x = _a.x, y = _a.y, width = _a.width, height = _a.height;
		// If DOMRectReadOnly is available use it as a prototype for the rectangle.
		var Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
		var rect = Object.create(Constr.prototype);
		// Rectangle's properties are not writable and non-enumerable.
		defineConfigurable(rect, {
			x: x, y: y, width: width, height: height,
			top: y,
			right: x + width,
			bottom: height + y,
			left: x
		});
		return rect;
	}
	/**
	 * Creates DOMRectInit object based on the provided dimensions and the x/y coordinates.
	 * Spec: https://drafts.fxtf.org/geometry/#dictdef-domrectinit
	 *
	 * @param {number} x - X coordinate.
	 * @param {number} y - Y coordinate.
	 * @param {number} width - Rectangle's width.
	 * @param {number} height - Rectangle's height.
	 * @returns {DOMRectInit}
	 */
	function createRectInit(x, y, width, height) {
		return { x: x, y: y, width: width, height: height };
	}

	/**
	 * Class that is responsible for computations of the content rectangle of
	 * provided DOM element and for keeping track of it's changes.
	 */
	var ResizeObservation = /** @class */ (function () {
		/**
		 * Creates an instance of ResizeObservation.
		 *
		 * @param {Element} target - Element to be observed.
		 */
		function ResizeObservation(target) {
			/**
			 * Broadcasted width of content rectangle.
			 *
			 * @type {number}
			 */
			this.broadcastWidth = 0;
			/**
			 * Broadcasted height of content rectangle.
			 *
			 * @type {number}
			 */
			this.broadcastHeight = 0;
			/**
			 * Reference to the last observed content rectangle.
			 *
			 * @private {DOMRectInit}
			 */
			this.contentRect_ = createRectInit(0, 0, 0, 0);
			this.target = target;
		}
		/**
		 * Updates content rectangle and tells whether it's width or height properties
		 * have changed since the last broadcast.
		 *
		 * @returns {boolean}
		 */
		ResizeObservation.prototype.isActive = function () {
			var rect = getContentRect(this.target);
			this.contentRect_ = rect;
			return (rect.width !== this.broadcastWidth ||
					rect.height !== this.broadcastHeight);
		};
		/**
		 * Updates 'broadcastWidth' and 'broadcastHeight' properties with a data
		 * from the corresponding properties of the last observed content rectangle.
		 *
		 * @returns {DOMRectInit} Last observed content rectangle.
		 */
		ResizeObservation.prototype.broadcastRect = function () {
			var rect = this.contentRect_;
			this.broadcastWidth = rect.width;
			this.broadcastHeight = rect.height;
			return rect;
		};
		return ResizeObservation;
	}());

	var ResizeObserverEntry = /** @class */ (function () {
		/**
		 * Creates an instance of ResizeObserverEntry.
		 *
		 * @param {Element} target - Element that is being observed.
		 * @param {DOMRectInit} rectInit - Data of the element's content rectangle.
		 */
		function ResizeObserverEntry(target, rectInit) {
			var contentRect = createReadOnlyRect(rectInit);
			// According to the specification following properties are not writable
			// and are also not enumerable in the native implementation.
			//
			// Property accessors are not being used as they'd require to define a
			// private WeakMap storage which may cause memory leaks in browsers that
			// don't support this type of collections.
			defineConfigurable(this, { target: target, contentRect: contentRect });
		}
		return ResizeObserverEntry;
	}());

	var ResizeObserverSPI = /** @class */ (function () {
		/**
		 * Creates a new instance of ResizeObserver.
		 *
		 * @param {ResizeObserverCallback} callback - Callback function that is invoked
		 *      when one of the observed elements changes it's content dimensions.
		 * @param {ResizeObserverController} controller - Controller instance which
		 *      is responsible for the updates of observer.
		 * @param {ResizeObserver} callbackCtx - Reference to the public
		 *      ResizeObserver instance which will be passed to callback function.
		 */
		function ResizeObserverSPI(callback, controller, callbackCtx) {
			/**
			 * Collection of resize observations that have detected changes in dimensions
			 * of elements.
			 *
			 * @private {Array<ResizeObservation>}
			 */
			this.activeObservations_ = [];
			/**
			 * Registry of the ResizeObservation instances.
			 *
			 * @private {Map<Element, ResizeObservation>}
			 */
			this.observations_ = new MapShim();
			if (typeof callback !== 'function') {
				throw new TypeError('The callback provided as parameter 1 is not a function.');
			}
			this.callback_ = callback;
			this.controller_ = controller;
			this.callbackCtx_ = callbackCtx;
		}
		/**
		 * Starts observing provided element.
		 *
		 * @param {Element} target - Element to be observed.
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.observe = function (target) {
			if (!arguments.length) {
				throw new TypeError('1 argument required, but only 0 present.');
			}
			// Do nothing if current environment doesn't have the Element interface.
			if (typeof Element === 'undefined' || !(Element instanceof Object)) {
				return;
			}
			if (!(target instanceof getWindowOf(target).Element)) {
				throw new TypeError('parameter 1 is not of type "Element".');
			}
			var observations = this.observations_;
			// Do nothing if element is already being observed.
			if (observations.has(target)) {
				return;
			}
			observations.set(target, new ResizeObservation(target));
			this.controller_.addObserver(this);
			// Force the update of observations.
			this.controller_.refresh();
		};
		/**
		 * Stops observing provided element.
		 *
		 * @param {Element} target - Element to stop observing.
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.unobserve = function (target) {
			if (!arguments.length) {
				throw new TypeError('1 argument required, but only 0 present.');
			}
			// Do nothing if current environment doesn't have the Element interface.
			if (typeof Element === 'undefined' || !(Element instanceof Object)) {
				return;
			}
			if (!(target instanceof getWindowOf(target).Element)) {
				throw new TypeError('parameter 1 is not of type "Element".');
			}
			var observations = this.observations_;
			// Do nothing if element is not being observed.
			if (!observations.has(target)) {
				return;
			}
			observations.delete(target);
			if (!observations.size) {
				this.controller_.removeObserver(this);
			}
		};
		/**
		 * Stops observing all elements.
		 *
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.disconnect = function () {
			this.clearActive();
			this.observations_.clear();
			this.controller_.removeObserver(this);
		};
		/**
		 * Collects observation instances the associated element of which has changed
		 * it's content rectangle.
		 *
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.gatherActive = function () {
			var _this = this;
			this.clearActive();
			this.observations_.forEach(function (observation) {
				if (observation.isActive()) {
					_this.activeObservations_.push(observation);
				}
			});
		};
		/**
		 * Invokes initial callback function with a list of ResizeObserverEntry
		 * instances collected from active resize observations.
		 *
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.broadcastActive = function () {
			// Do nothing if observer doesn't have active observations.
			if (!this.hasActive()) {
				return;
			}
			var ctx = this.callbackCtx_;
			// Create ResizeObserverEntry instance for every active observation.
			var entries = this.activeObservations_.map(function (observation) {
				return new ResizeObserverEntry(observation.target, observation.broadcastRect());
			});
			this.callback_.call(ctx, entries, ctx);
			this.clearActive();
		};
		/**
		 * Clears the collection of active observations.
		 *
		 * @returns {void}
		 */
		ResizeObserverSPI.prototype.clearActive = function () {
			this.activeObservations_.splice(0);
		};
		/**
		 * Tells whether observer has active observations.
		 *
		 * @returns {boolean}
		 */
		ResizeObserverSPI.prototype.hasActive = function () {
			return this.activeObservations_.length > 0;
		};
		return ResizeObserverSPI;
	}());

	// Registry of internal observers. If WeakMap is not available use current shim
	// for the Map collection as it has all required methods and because WeakMap
	// can't be fully polyfilled anyway.
	var observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();
	/**
	 * ResizeObserver API. Encapsulates the ResizeObserver SPI implementation
	 * exposing only those methods and properties that are defined in the spec.
	 */
	var ResizeObserver = /** @class */ (function () {
		/**
		 * Creates a new instance of ResizeObserver.
		 *
		 * @param {ResizeObserverCallback} callback - Callback that is invoked when
		 *      dimensions of the observed elements change.
		 */
		function ResizeObserver(callback) {
			if (!(this instanceof ResizeObserver)) {
				throw new TypeError('Cannot call a class as a function.');
			}
			if (!arguments.length) {
				throw new TypeError('1 argument required, but only 0 present.');
			}
			var controller = ResizeObserverController.getInstance();
			var observer = new ResizeObserverSPI(callback, controller, this);
			observers.set(this, observer);
		}
		return ResizeObserver;
	}());
	// Expose public methods of ResizeObserver.
	[
		'observe',
		'unobserve',
		'disconnect'
		].forEach(function (method) {
			ResizeObserver.prototype[method] = function () {
				var _a;
				return (_a = observers.get(this))[method].apply(_a, arguments);
			};
		});

	var index = (function () {
		// Export existing implementation if available.
		if (typeof global$1.ResizeObserver !== 'undefined') {
			return global$1.ResizeObserver;
		}
		return ResizeObserver;
	})();

	return index;

})));
/*
 * anime.js v3.0.1
 * (c) 2019 Julian Garnier
 * Released under the MIT license
 * animejs.com
 */
(function (root, factory){
	'use strict';

	/*istanbul ignore next:cant test*/
	if (typeof module === 'object' && typeof module.exports === 'object') {
		module.exports = factory();
	} else {
		// Browser globals
		root.anime = factory();
	}
})(this, function(){
	'use strict';

	// Defaults

	var defaultInstanceSettings = {
			update: null,
			begin: null,
			loopBegin: null,
			changeBegin: null,
			change: null,
			changeComplete: null,
			loopComplete: null,
			complete: null,
			loop: 1,
			direction: 'normal',
			autoplay: true,
			timelineOffset: 0
	};

	var defaultTweenSettings = {
			duration: 1000,
			delay: 0,
			endDelay: 0,
			easing: 'easeOutElastic(1, .5)',
			round: 0
	};

	var validTransforms = ['translateX', 'translateY', 'translateZ', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 'scale', 'scaleX', 'scaleY', 'scaleZ', 'skew', 'skewX', 'skewY', 'perspective'];

	// Caching

	var cache = {
			CSS: {},
			springs: {}
	};

	// Utils

	function minMax(val, min, max) {
		return Math.min(Math.max(val, min), max);
	}

	function stringContains(str, text) {
		return str.indexOf(text) > -1;
	}

	function applyArguments(func, args) {
		return func.apply(null, args);
	}

	var is = {
			arr: function (a) { return Array.isArray(a); },
			obj: function (a) { return stringContains(Object.prototype.toString.call(a), 'Object'); },
			pth: function (a) { return is.obj(a) && a.hasOwnProperty('totalLength'); },
			svg: function (a) { return a instanceof SVGElement; },
			inp: function (a) { return a instanceof HTMLInputElement; },
			dom: function (a) { return a.nodeType || is.svg(a); },
			str: function (a) { return typeof a === 'string'; },
			fnc: function (a) { return typeof a === 'function'; },
			und: function (a) { return typeof a === 'undefined'; },
			hex: function (a) { return /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(a); },
			rgb: function (a) { return /^rgb/.test(a); },
			hsl: function (a) { return /^hsl/.test(a); },
			col: function (a) { return (is.hex(a) || is.rgb(a) || is.hsl(a)); },
			key: function (a) { return !defaultInstanceSettings.hasOwnProperty(a) && !defaultTweenSettings.hasOwnProperty(a) && a !== 'targets' && a !== 'keyframes'; }
	};

	// Easings

	function parseEasingParameters(string) {
		var match = /\(([^)]+)\)/.exec(string);
		return match ? match[1].split(',').map(function (p) { return parseFloat(p); }) : [];
	}

	// Spring solver inspired by Webkit Copyright © 2016 Apple Inc. All rights reserved. https://webkit.org/demos/spring/spring.js

	function spring(string, duration) {

		var params = parseEasingParameters(string);
		var mass = minMax(is.und(params[0]) ? 1 : params[0], 0.1, 100);
		var stiffness = minMax(is.und(params[1]) ? 100 : params[1], 0.1, 100);
		var damping = minMax(is.und(params[2]) ? 10 : params[2], 0.1, 100);
		var velocity =  minMax(is.und(params[3]) ? 0 : params[3], 0.1, 100);
		var w0 = Math.sqrt(stiffness / mass);
		var zeta = damping / (2 * Math.sqrt(stiffness * mass));
		var wd = zeta < 1 ? w0 * Math.sqrt(1 - zeta * zeta) : 0;
		var a = 1;
		var b = zeta < 1 ? (zeta * w0 + -velocity) / wd : -velocity + w0;

		function solver(t) {
			var progress = duration ? (duration * t) / 1000 : t;
			if (zeta < 1) {
				progress = Math.exp(-progress * zeta * w0) * (a * Math.cos(wd * progress) + b * Math.sin(wd * progress));
			} else {
				progress = (a + b * progress) * Math.exp(-progress * w0);
			}
			if (t === 0 || t === 1) { return t; }
			return 1 - progress;
		}

		function getDuration() {
			var cached = cache.springs[string];
			if (cached) { return cached; }
			var frame = 1/6;
			var elapsed = 0;
			var rest = 0;
			while(rest < 16) {
				elapsed += frame;
				if (solver(elapsed) === 1) {
					rest++;
//					if (rest >= 16) { 
//						break;
//					}
				} else {
					rest = 0;
				}
			}
			var duration = elapsed * frame * 1000;
			cache.springs[string] = duration;
			return duration;
		}

		return duration ? solver : getDuration;

	}

	// Elastic easing adapted from jQueryUI http://api.jqueryui.com/easings/

	function elastic(amplitude, period) {
		if ( amplitude === void 0 ) {amplitude = 1;}
		if ( period === void 0 ) {period = 0.5;}

		var a = minMax(amplitude, 1, 10);
		var p = minMax(period, 0.1, 2);
		return function (t) {
			return (t === 0 || t === 1) ? t : 
				-a * Math.pow(2, 10 * (t - 1)) * Math.sin((((t - 1) - (p / (Math.PI * 2) * Math.asin(1 / a))) * (Math.PI * 2)) / p);
		};
	}

	// Basic steps easing implementation https://developer.mozilla.org/fr/docs/Web/CSS/transition-timing-function
	function steps(basicSteps) {
		if ( basicSteps === void 0 ) {
			basicSteps = 10;
		}

		return function (t) { 
			return Math.round(t * basicSteps) * (1 / basicSteps); 
		};
	}

	// BezierEasing https://github.com/gre/bezier-easing

	var bezier = (function () {

		var kSplineTableSize = 11;
		var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

		function fA(aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
		function fB(aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
		function fC(aA1)      { return 3.0 * aA1; }

		function calcBezier(aT, aA1, aA2) { 
			return ((fA(aA1, aA2) * aT + fB(aA1, aA2)) * aT + fC(aA1)) * aT; 
		}
		function getSlope(aT, aA1, aA2) { 
			return 3.0 * fA(aA1, aA2) * aT * aT + 2.0 * fB(aA1, aA2) * aT + fC(aA1); 
		}

		function binarySubdivide(aX, aA, aB, mX1, mX2) {
			var currentX, currentT, i = 0;
			do {
				currentT = aA + (aB - aA) / 2.0;
				currentX = calcBezier(currentT, mX1, mX2) - aX;
				if (currentX > 0.0) { 
					aB = currentT; 
				} else { 
					aA = currentT;
				}
			} while (Math.abs(currentX) > 0.0000001 && ++i < 10);
			return currentT;
		}

		function newtonRaphsonIterate(aX, aGuessT, mX1, mX2) {
			for (var i = 0; i < 4; ++i) {
				var currentSlope = getSlope(aGuessT, mX1, mX2);
				if (currentSlope === 0.0) { return aGuessT; }
				var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
				aGuessT -= currentX / currentSlope;
			}
			return aGuessT;
		}

		function bezier(mX1, mY1, mX2, mY2) {

			if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) { return; }
			var sampleValues = new Float32Array(kSplineTableSize);

			if (mX1 !== mY1 || mX2 !== mY2) {
				for (var i = 0; i < kSplineTableSize; ++i) {
					sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
				}
			}

			function getTForX(aX) {

				var intervalStart = 0;
				var currentSample = 1;
				var lastSample = kSplineTableSize - 1;

				for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
					intervalStart += kSampleStepSize;
				}

				--currentSample;

				var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
				var guessForT = intervalStart + dist * kSampleStepSize;
				var initialSlope = getSlope(guessForT, mX1, mX2);

				if (initialSlope >= 0.001) {
					return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
				} else if (initialSlope === 0.0) {
					return guessForT;
				} else {
					return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
				}

			}

			return function (x) {
				if (mX1 === mY1 && mX2 === mY2) {
					return x;
				}
				if (x === 0 || x === 1) { 
					return x; 
				}
				return calcBezier(getTForX(x), mY1, mY2);
			};

		}

		return bezier;

	})();

	var penner = (function () {

		var names = ['Quad', 'Cubic', 'Quart', 'Quint', 'Sine', 'Expo', 'Circ', 'Back', 'Elastic'];

		// Approximated Penner equations http://matthewlein.com/ceaser/

		var curves = {
				In: [
					[0.550, 0.085, 0.680, 0.530], /* inQuad */
					[0.550, 0.055, 0.675, 0.190], /* inCubic */
					[0.895, 0.030, 0.685, 0.220], /* inQuart */
					[0.755, 0.050, 0.855, 0.060], /* inQuint */
					[0.470, 0.000, 0.745, 0.715], /* inSine */
					[0.950, 0.050, 0.795, 0.035], /* inExpo */
					[0.600, 0.040, 0.980, 0.335], /* inCirc */
					[0.600,-0.280, 0.735, 0.045], /* inBack */
					elastic /* inElastic */
					],
					Out: [
						[0.250, 0.460, 0.450, 0.940], /* outQuad */
						[0.215, 0.610, 0.355, 1.000], /* outCubic */
						[0.165, 0.840, 0.440, 1.000], /* outQuart */
						[0.230, 1.000, 0.320, 1.000], /* outQuint */
						[0.390, 0.575, 0.565, 1.000], /* outSine */
						[0.190, 1.000, 0.220, 1.000], /* outExpo */
						[0.075, 0.820, 0.165, 1.000], /* outCirc */
						[0.175, 0.885, 0.320, 1.275], /* outBack */
						function (a, p) { return function (t) { return 1 - elastic(a, p)(1 - t); }; } /* outElastic */
						],
						InOut: [
							[0.455, 0.030, 0.515, 0.955], /* inOutQuad */
							[0.645, 0.045, 0.355, 1.000], /* inOutCubic */
							[0.770, 0.000, 0.175, 1.000], /* inOutQuart */
							[0.860, 0.000, 0.070, 1.000], /* inOutQuint */
							[0.445, 0.050, 0.550, 0.950], /* inOutSine */
							[1.000, 0.000, 0.000, 1.000], /* inOutExpo */
							[0.785, 0.135, 0.150, 0.860], /* inOutCirc */
							[0.680,-0.550, 0.265, 1.550], /* inOutBack */
							function (a, p) { 
								return function (t) { 
									return t < 0.5 ? elastic(a, p)(t * 2) / 2 : 1 - elastic(a, p)(t * -2 + 2) / 2; 
								}; 
							} /* inOutElastic */
							]
		};

		var eases = { 
				linear: [0.250, 0.250, 0.750, 0.750]
		};

		var loop = function ( coords ) {
			curves[coords].forEach(function (ease, i) {
				eases['ease'+coords+names[i]] = ease;
			});
		};

		for (var coords in curves){ 
			loop( coords );
		}

		return eases;

	})();

	function parseEasings(easing, duration) {
		if (is.fnc(easing)) { return easing; }
		var name = easing.split('(')[0];
		var ease = penner[name];
		var args = parseEasingParameters(easing);
		switch (name) {
		case 'spring' : return spring(easing, duration);
		case 'cubicBezier' : return applyArguments(bezier, args);
		case 'steps' : return applyArguments(steps, args);
		default : return is.fnc(ease) ? applyArguments(ease, args) : applyArguments(bezier, ease);
		}
	}

	// Strings

	function selectString(str) {
		try {
			var nodes = document.querySelectorAll(str);
			return nodes;
		} catch(e) {
			return;
		}
	}

	// Arrays

	function filterArray(arr, callback) {
		var len = arr.length;
		var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
		var result = [];
		for (var i = 0; i < len; i++) {
			if (i in arr) {
				var val = arr[i];
				if (callback.call(thisArg, val, i, arr)) {
					result.push(val);
				}
			}
		}
		return result;
	}

	function flattenArray(arr) {
		return arr.reduce(function (a, b) { return a.concat(is.arr(b) ? flattenArray(b) : b); }, []);
	}

	function toArray(o) {
		if (is.arr(o)) { return o; }
		if (is.str(o)) { o = selectString(o) || o; }
		if (o instanceof NodeList || o instanceof HTMLCollection) { return [].slice.call(o); }
		return [o];
	}

	function arrayContains(arr, val) {
		return arr.some(function (a) { return a === val; });
	}

	// Objects

	function cloneObject(o) {
		var clone = {};
		for (var p in o) { clone[p] = o[p]; }
		return clone;
	}

	function replaceObjectProps(o1, o2) {
		var o = cloneObject(o1);
		for (var p in o1) { o[p] = o2.hasOwnProperty(p) ? o2[p] : o1[p]; }
		return o;
	}

	function mergeObjects(o1, o2) {
		var o = cloneObject(o1);
		for (var p in o2) { o[p] = is.und(o1[p]) ? o2[p] : o1[p]; }
		return o;
	}

	// Colors

	function rgbToRgba(rgbValue) {
		var rgb = /rgb\((\d+,\s*[\d]+,\s*[\d]+)\)/g.exec(rgbValue);
		return rgb ? ('rgba(' + (rgb[1]) + ',1)') : rgbValue;
	}

	function hexToRgba(hexValue) {
		var rgx = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		var hex = hexValue.replace(rgx, function (m, r, g, b) { return r + r + g + g + b + b; } );
		var rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		var r = parseInt(rgb[1], 16);
		var g = parseInt(rgb[2], 16);
		var b = parseInt(rgb[3], 16);
		return ('rgba(' + r + ',' + g + ',' + b + ',1)');
	}

	function hslToRgba(hslValue) {
		var hsl = /hsl\((\d+),\s*([\d.]+)%,\s*([\d.]+)%\)/g.exec(hslValue) || /hsla\((\d+),\s*([\d.]+)%,\s*([\d.]+)%,\s*([\d.]+)\)/g.exec(hslValue);
		var h = parseInt(hsl[1], 10) / 360;
		var s = parseInt(hsl[2], 10) / 100;
		var l = parseInt(hsl[3], 10) / 100;
		var a = hsl[4] || 1;
		function hue2rgb(p, q, t) {
			if (t < 0) { t += 1; }
			if (t > 1) { t -= 1; }
			if (t < 1/6) { return p + (q - p) * 6 * t; }
			if (t < 1/2) { return q; }
			if (t < 2/3) { return p + (q - p) * (2/3 - t) * 6; }
			return p;
		}
		var r, g, b;
		if (s === 0) {
			r = g = b = l;
		} else {
			var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
			var p = 2 * l - q;
			r = hue2rgb(p, q, h + 1/3);
			g = hue2rgb(p, q, h);
			b = hue2rgb(p, q, h - 1/3);
		}
		return ('rgba(' + (r * 255) + ',' + (g * 255) + ',' + (b * 255) + ',' + a + ')');
	}

	function colorToRgb(val) {
		if (is.rgb(val)) { return rgbToRgba(val); }
		if (is.hex(val)) { return hexToRgba(val); }
		if (is.hsl(val)) { return hslToRgba(val); }
	}

	// Units

	function getUnit(val) {
		var split = /([\+\-]?[0-9#\.]+)(%|px|pt|em|rem|in|cm|mm|ex|ch|pc|vw|vh|vmin|vmax|deg|rad|turn)?$/.exec(val);
		if (split) { return split[2]; }
	}

	function getTransformUnit(propName) {
		if (stringContains(propName, 'translate') || propName === 'perspective') { return 'px'; }
		if (stringContains(propName, 'rotate') || stringContains(propName, 'skew')) { return 'deg'; }
	}

	// Values

	function getFunctionValue(val, animatable) {
		if (!is.fnc(val)) { return val; }
		return val(animatable.target, animatable.id, animatable.total);
	}

	function getAttribute(el, prop) {
		return el.getAttribute(prop);
	}

	function convertPxToUnit(el, value, unit) {
		var valueUnit = getUnit(value);
		if (arrayContains([unit, 'deg', 'rad', 'turn'], valueUnit)) { return value; }
		var cached = cache.CSS[value + unit];
		if (!is.und(cached)) { return cached; }
		var baseline = 100;
		var tempEl = document.createElement(el.tagName);
		var parentEl = (el.parentNode && (el.parentNode !== document)) ? el.parentNode : document.body;
		parentEl.appendChild(tempEl);
		tempEl.style.position = 'absolute';
		tempEl.style.width = baseline + unit;
		var factor = baseline / tempEl.offsetWidth;
		parentEl.removeChild(tempEl);
		var convertedUnit = factor * parseFloat(value);
		cache.CSS[value + unit] = convertedUnit;
		return convertedUnit;
	}

	function getCSSValue(el, prop, unit) {
		if (prop in el.style) {
			var uppercasePropName = prop.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
			var value = el.style[prop] || getComputedStyle(el).getPropertyValue(uppercasePropName) || '0';
			return unit ? convertPxToUnit(el, value, unit) : value;
		}
	}

	function getAnimationType(el, prop) {
		if (is.dom(el) && !is.inp(el) && (getAttribute(el, prop) || (is.svg(el) && el[prop]))) {
			return 'attribute'; 
		}
		if (is.dom(el) && arrayContains(validTransforms, prop)) { 
			return 'transform'; 
		}
		if (is.dom(el) && (prop !== 'transform' && getCSSValue(el, prop))) {
			return 'css'; 
		}
		// Direct object
		return 'object';
	}

	function getElementTransforms(el) {
		if (!is.dom(el)) { return; }
		var str = el.style.transform || '';
		var reg  = /(\w+)\(([^)]*)\)/g;
		var transforms = new Map();
		var m = reg.exec(str);
		while (m) { 
			transforms.set(m[1], m[2]); 
			m = reg.exec(str);
		}
		return transforms;
	}

	function getTransformValue(el, propName, animatable, unit) {
		var defaultVal = stringContains(propName, 'scale') ? 1 : 0 + getTransformUnit(propName);
		var value = getElementTransforms(el).get(propName) || defaultVal;
		if (animatable) {
			animatable.transforms.list.set(propName, value);
			animatable.transforms.last = propName;
		}
		return unit ? convertPxToUnit(el, value, unit) : value;
	}

	function getOriginalTargetValue(target, propName, unit, animatable) {
		switch (getAnimationType(target, propName)) {
		case 'transform': return getTransformValue(target, propName, animatable, unit);
		case 'css': return getCSSValue(target, propName, unit);
		case 'attribute': return getAttribute(target, propName);
		default: {
			var value = objectPath.get(target, propName);
			return value || 0;
		}
		}
	}

	function getRelativeValue(to, from) {
		var operator = /^(\*=|\+=|-=)/.exec(to);
		if (!operator) { return to; }
		var u = getUnit(to) || 0;
		var x = parseFloat(from);
		var y = parseFloat(to.replace(operator[0], ''));
		switch (operator[0][0]) {
		case '+': return x + y + u;
		case '-': return x - y + u;
		case '*': return x * y + u;
		}
	}

	function validateValue(val, unit) {
		if (is.col(val)) { return colorToRgb(val); }
		var originalUnit = getUnit(val);
		var unitLess = originalUnit ? val.substr(0, val.length - originalUnit.length) : val;
		return unit && !/\s/g.test(val) ? unitLess + unit : unitLess;
	}

	// getTotalLength() equivalent for circle, rect, polyline, polygon and line shapes
	// adapted from https://gist.github.com/SebLambla/3e0550c496c236709744

	function getDistance(p1, p2) {
		return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
	}

	function getCircleLength(el) {
		return Math.PI * 2 * getAttribute(el, 'r');
	}

	function getRectLength(el) {
		return (getAttribute(el, 'width') * 2) + (getAttribute(el, 'height') * 2);
	}

	function getLineLength(el) {
		return getDistance(
				{x: getAttribute(el, 'x1'), y: getAttribute(el, 'y1')}, 
				{x: getAttribute(el, 'x2'), y: getAttribute(el, 'y2')}
		);
	}

	function getPolylineLength(el) {
		var points = el.points;
		var totalLength = 0;
		var previousPos;
		for (var i = 0 ; i < points.numberOfItems; i++) {
			var currentPos = points.getItem(i);
			if (i > 0) { totalLength += getDistance(previousPos, currentPos); }
			previousPos = currentPos;
		}
		return totalLength;
	}

	function getPolygonLength(el) {
		var points = el.points;
		return getPolylineLength(el) + getDistance(points.getItem(points.numberOfItems - 1), points.getItem(0));
	}

	// Path animation

	function getTotalLength(el) {
		if (el.getTotalLength) { return el.getTotalLength(); }
		switch(el.tagName.toLowerCase()) {
		case 'circle': return getCircleLength(el);
		case 'rect': return getRectLength(el);
		case 'line': return getLineLength(el);
		case 'polyline': return getPolylineLength(el);
		case 'polygon': return getPolygonLength(el);
		}
	}

	function setDashoffset(el) {
		var pathLength = getTotalLength(el);
		el.setAttribute('stroke-dasharray', pathLength);
		return pathLength;
	}

	// Motion path

	function getParentSvgEl(el) {
		var parentEl = el.parentNode;
		while (is.svg(parentEl)) {
			parentEl = parentEl.parentNode;
			if (!is.svg(parentEl.parentNode)) { break; }
		}
		return parentEl;
	}

	function getParentSvg(pathEl, svgData) {
		var svg = svgData || {};
		var parentSvgEl = svg.el || getParentSvgEl(pathEl);
		var rect = parentSvgEl.getBoundingClientRect();
		var viewBoxAttr = getAttribute(parentSvgEl, 'viewBox');
		var width = rect.width;
		var height = rect.height;
		var viewBox = svg.viewBox || (viewBoxAttr ? viewBoxAttr.split(' ') : [0, 0, width, height]);
		return {
			el: parentSvgEl,
			viewBox: viewBox,
			x: viewBox[0] / 1,
			y: viewBox[1] / 1,
			w: width / viewBox[2],
			h: height / viewBox[3]
		};
	}

	function getPath(path, percent) {
		var pathEl = is.str(path) ? selectString(path)[0] : path;
		var p = percent || 100;
		return function(property) {
			return {
				property: property,
				el: pathEl,
				svg: getParentSvg(pathEl),
				totalLength: getTotalLength(pathEl) * (p / 100)
			};
		};
	}

	function getPathProgress(path, progress) {
		function point(offset) {
			if ( offset === void 0 ) { 
				offset = 0;
			}

			var l = progress + offset >= 1 ? progress + offset : 0;
			return path.el.getPointAtLength(l);
		}
		var svg = getParentSvg(path.el, path.svg);
		var p = point();
		var p0 = point(-1);
		var p1 = point(+1);
		switch (path.property) {
		case 'x': return (p.x - svg.x) * svg.w;
		case 'y': return (p.y - svg.y) * svg.h;
		case 'angle': return Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180 / Math.PI;
		}
	}

	// Decompose value

	function decomposeValue(val, unit) {
		var rgx = /-?\d*\.?\d+/g;
		var value = validateValue((is.pth(val) ? val.totalLength : val), unit) + '';
		return {
			original: value,
			numbers: value.match(rgx) ? value.match(rgx).map(Number) : [0],
					strings: (is.str(val) || unit) ? value.split(rgx) : []
		};
	}

	// Animatables

	function parseTargets(targets) {
		var targetsArray = targets ? (flattenArray(is.arr(targets) ? targets.map(toArray) : toArray(targets))) : [];
		return filterArray(targetsArray, function (item, pos, self) { return self.indexOf(item) === pos; });
	}

	function getAnimatables(targets) {
		var parsed = parseTargets(targets);
		return parsed.map(function (t, i) {
			return {
				target: t, 
				id: i, 
				total: parsed.length, 
				transforms: { 
					list: getElementTransforms(t) 
				} 
			};
		});
	}

	// Properties

	function normalizePropertyTweens(prop, tweenSettings) {
		var settings = cloneObject(tweenSettings);
		// Override duration if easing is a spring
		if (/^spring/.test(settings.easing)) { settings.duration = spring(settings.easing); }
		if (is.arr(prop)) {
			var l = prop.length;
			var isFromTo = (l === 2 && !is.obj(prop[0]));
			if (!isFromTo) {
				// Duration divided by the number of tweens
				if (!is.fnc(tweenSettings.duration)) { settings.duration = tweenSettings.duration / l; }
			} else {
				// Transform [from, to] values shorthand to a valid tween value
				prop = {value: prop};
			}
		}
		var propArray = is.arr(prop) ? prop : [prop];
		return propArray.map(function (v, i) {
			var obj = (is.obj(v) && !is.pth(v)) ? v : {value: v};
			// Default delay value should only be applied to the first tween
			if (is.und(obj.delay)) { obj.delay = !i ? tweenSettings.delay : 0; }
			// Default endDelay value should only be applied to the last tween
			if (is.und(obj.endDelay)) { obj.endDelay = i === propArray.length - 1 ? tweenSettings.endDelay : 0; }
			return obj;
		}).map(function (k) { return mergeObjects(k, settings); });
	}


	function flattenKeyframes(keyframes) {
		var propertyNames = filterArray(flattenArray(keyframes.map(function (key) { return Object.keys(key); })), function (p) { return is.key(p); })
		.reduce(function (a,b) { if (a.indexOf(b) < 0) { a.push(b); } return a; }, []);
		var properties = {};
		var loop = function ( i ) {
			var propName = propertyNames[i];
			properties[propName] = keyframes.map(function (key) {
				var newKey = {};
				for (var p in key) {
					if (is.key(p)) {
						if (p === propName) { newKey.value = key[p]; }
					} else {
						newKey[p] = key[p];
					}
				}
				return newKey;
			});
		};

		for (var i = 0; i < propertyNames.length; i++) {
			loop( i );
		}
		return properties;
	}

	function getProperties(tweenSettings, params) {
		var properties = [];
		var keyframes = params.keyframes;
		if (keyframes) { params = mergeObjects(flattenKeyframes(keyframes), params); }
		for (var p in params) {
			if (is.key(p)) {
				properties.push({
					name: p,
					tweens: normalizePropertyTweens(params[p], tweenSettings)
				});
			}
		}
		return properties;
	}

	// Tweens

	function normalizeTweenValues(tween, animatable) {
		function mapF(v) { 
			return getFunctionValue(v, animatable); 
		}
		var t = {};
		for (var p in tween) {
			var value = getFunctionValue(tween[p], animatable);
			if (is.arr(value)) {
				value = value.map(mapF);
				if (value.length === 1) {
					value = value[0]; 
				}
			}
			t[p] = value;
		}
		t.duration = parseFloat(t.duration);
		t.delay = parseFloat(t.delay);
		return t;
	}

	function normalizeTweens(prop, animatable) {
		var previousTween;
		return prop.tweens.map(function (t) {
			var tween = normalizeTweenValues(t, animatable);
			var tweenValue = tween.value;
			var to = is.arr(tweenValue) ? tweenValue[1] : tweenValue;
			var toUnit = getUnit(to);
			var originalValue = getOriginalTargetValue(animatable.target, prop.name, toUnit, animatable);
			var previousValue = previousTween ? previousTween.to.original : originalValue;
			var from = is.arr(tweenValue) ? tweenValue[0] : previousValue;
			var fromUnit = getUnit(from) || getUnit(originalValue);
			var unit = toUnit || fromUnit;
			if (is.und(to)) { to = previousValue; }
			tween.from = decomposeValue(from, unit);
			tween.to = decomposeValue(getRelativeValue(to, from), unit);
			tween.start = previousTween ? previousTween.end : 0;
			tween.end = tween.start + tween.delay + tween.duration + tween.endDelay;
			tween.easing = parseEasings(tween.easing, tween.duration);
			tween.isPath = is.pth(tweenValue);
			tween.isColor = is.col(tween.from.original);
			if (tween.isColor) { tween.round = 1; }
			previousTween = tween;
			return tween;
		});
	}

	// Tween progress

	var setProgressValue = {
			css: function (t, p, v) { 
				t.style[p] = v;
				return v; 
			},
			attribute: function (t, p, v) { 
				return t.setAttribute(p, v);
			},
			object: function (target, property, value) { 
				return objectPath.set(target, property, value);
			},
			transform: function (t, p, v, transforms, manual) {
				transforms.list.set(p, v);
				if (p === transforms.last || manual) {
					var str = '';
					transforms.list.forEach(function (value, prop) { str += prop + '(' + value + ') '; });
					t.style.transform = str;
				}
			}
	};

	// Set Value helper

	function setTargetsValue(targets, properties) {
		var animatables = getAnimatables(targets);
		animatables.forEach(function (animatable) {
			for (var property in properties) {
				var value = getFunctionValue(properties[property], animatable);
				var target = animatable.target;
				var valueUnit = getUnit(value);
				var originalValue = getOriginalTargetValue(target, property, valueUnit, animatable);
				var unit = valueUnit || getUnit(originalValue);
				var to = getRelativeValue(validateValue(value, unit), originalValue);
				var animType = getAnimationType(target, property);
				setProgressValue[animType](target, property, to, animatable.transforms, true);
			}
		});
	}

	// Animations

	function createAnimation(animatable, prop) {
		var animType = getAnimationType(animatable.target, prop.name);
		if (animType) {
			var tweens = normalizeTweens(prop, animatable);
			var lastTween = tweens[tweens.length - 1];
			return {
				type: animType,
				property: prop.name,
				animatable: animatable,
				tweens: tweens,
				duration: lastTween.end,
				delay: tweens[0].delay,
				endDelay: lastTween.endDelay
			};
		}
	}

	function getAnimations(animatables, properties) {
		return filterArray(flattenArray(animatables.map(function (animatable) {
			return properties.map(function (prop) {
				return createAnimation(animatable, prop);
			});
		})), function (a) { return !is.und(a); });
	}

	// Create Instance

	function getInstanceTimings(animations, tweenSettings) {
		var animLength = animations.length;
		var getTlOffset = function (anim) { 
			return anim.timelineOffset ? anim.timelineOffset : 0; 
		};
		var timings = {};
		timings.duration = animLength ? Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration; })) : tweenSettings.duration;
		timings.delay = animLength ? Math.min.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.delay; })) : tweenSettings.delay;
		timings.endDelay = animLength ? timings.duration - Math.max.apply(Math, animations.map(function (anim) { return getTlOffset(anim) + anim.duration - anim.endDelay; })) : tweenSettings.endDelay;
		return timings;
	}

	var instanceID = 0;

	function createNewInstance(params) {
		var instanceSettings = replaceObjectProps(defaultInstanceSettings, params);
		var tweenSettings = replaceObjectProps(defaultTweenSettings, params);
		var properties = getProperties(tweenSettings, params);
		var animatables = getAnimatables(params.targets);
		var animations = getAnimations(animatables, properties);
		var timings = getInstanceTimings(animations, tweenSettings);
		var id = instanceID;
		instanceID++;
		return mergeObjects(instanceSettings, {
			id: id,
			children: [],
			animatables: animatables,
			animations: animations,
			duration: timings.duration,
			delay: timings.delay,
			endDelay: timings.endDelay
		});
	}

	// Core

	var activeInstances = [];
	var pausedInstances = [];
	var raf;

	var engine = (function () {
		function play() { 
			raf = requestAnimationFrame(step);
		}
		function step(t) {
			var activeInstancesLength = activeInstances.length;
			if (activeInstancesLength) {
				var i = 0;
				while (i < activeInstancesLength) {
					var activeInstance = activeInstances[i];
					if (!activeInstance.paused) {
						activeInstance.tick(t);
					} else {
						var instanceIndex = activeInstances.indexOf(activeInstance);
						if (instanceIndex > -1) {
							activeInstances.splice(instanceIndex, 1);
							activeInstancesLength = activeInstances.length;
						}
					}
					i++;
				}
				play();
			} else {
				raf = cancelAnimationFrame(raf);
			}
		}
		return play;
	})();

	function handleVisibilityChange() {
		if (document.hidden) {
			activeInstances.forEach(function (ins) { return ins.pause(); });
			pausedInstances = activeInstances.slice(0);
			activeInstances = [];
		} else {
			pausedInstances.forEach(function (ins) { return ins.play(); });
		}
	}

	if (typeof document !== 'undefined') {
		document.addEventListener('visibilitychange', handleVisibilityChange);
	}

	// Public Instance

	function anime(params) {
		if ( params === void 0 ) {
			params = {};
		}


		var startTime = 0, lastTime = 0, now = 0;
		var children, childrenLength = 0;
		var resolve = null;

		function makePromise(instance) {
			var promise = window.Promise && new Promise(function (_resolve) { 
				resolve = _resolve; 
				return resolve;
			});
			instance.finished = promise;
			return promise;
		}

		var instance = createNewInstance(params);
		var promise = makePromise(instance);

		function toggleInstanceDirection() {
			var direction = instance.direction;
			if (direction !== 'alternate') {
				instance.direction = direction !== 'normal' ? 'normal' : 'reverse';
			}
			instance.reversed = !instance.reversed;
			children.forEach(function (child) { 
				child.reversed = instance.reversed; 
				return child.reversed;
			});
		}

		function adjustTime(time) {
			return instance.reversed ? instance.duration - time : time;
		}

		function resetTime() {
			startTime = 0;
			lastTime = adjustTime(instance.currentTime) * (1 / anime.speed);
		}

		function seekCild(time, child) {
			if (child) { 
				child.seek(time - child.timelineOffset); 
			}
		}

		function syncInstanceChildren(time) {
			if (!instance.reversePlayback) {
				for (var i = 0; i < childrenLength; i++) {
					seekCild(time, children[i]);
				}
			} else {
				for (var i$1 = childrenLength; i$1--;) {
					seekCild(time, children[i$1]); 
				}
			}
		}

		function setAnimationsProgress(insTime) {
			function filterF(t) {
				return (insTime < t.end); 
			}
			var i = 0;
			var animations = instance.animations;
			var animationsLength = animations.length;
			while (i < animationsLength) {
				var anim = animations[i];
				var animatable = anim.animatable;
				var tweens = anim.tweens;
				var tweenLength = tweens.length - 1;
				var tween = tweens[tweenLength];
				// Only check for keyframes if there is more than one tween
				if (tweenLength) { 
					tween = filterArray(tweens, filterF)[0] || tween; 
				}
				var elapsed = minMax(insTime - tween.start - tween.delay, 0, tween.duration) / tween.duration;
				var eased = isNaN(elapsed) ? 1 : tween.easing(elapsed);
				var strings = tween.to.strings;
				var round = tween.round;
				var numbers = [];
				var toNumbersLength = tween.to.numbers.length;
				var progress = (void 0);
				for (var n = 0; n < toNumbersLength; n++) {
					var value = (void 0);
					var toNumber = tween.to.numbers[n];
					var fromNumber = tween.from.numbers[n] || 0;
					if (!tween.isPath) {
						value = fromNumber + (eased * (toNumber - fromNumber));
					} else {
						value = getPathProgress(tween.value, eased * toNumber);
					}
					if (round) {
						if (!(tween.isColor && n > 2)) {
							value = Math.round(value * round) / round;
						}
					}
					numbers.push(value);
				}
				// Manual Array.reduce for better performances
				var stringsLength = strings.length;
				if (!stringsLength) {
					progress = numbers[0];
				} else {
					progress = strings[0];
					for (var s = 0; s < stringsLength; s++) {
//						var a = strings[s];
						var b = strings[s + 1];
						var n$1 = numbers[s];
						if (!isNaN(n$1)) {
							if (!b) {
								progress += n$1 + ' ';
							} else {
								progress += n$1 + b;
							}
						}
					}
				}
				setProgressValue[anim.type](animatable.target, anim.property, progress, animatable.transforms);
				anim.currentValue = progress;
				i++;
			}
		}

		function setCallback(cb) {
			if (instance[cb] && !instance.passThrough) { instance[cb](instance); }
		}

		function countIteration() {
			if (instance.remaining && instance.remaining !== true) {
				instance.remaining--;
			}
		}

		function setInstanceProgress(engineTime) {
			var insDuration = instance.duration;
			var insDelay = instance.delay;
			var insEndDelay = insDuration - instance.endDelay;
			var insTime = adjustTime(engineTime);
			instance.progress = minMax((insTime / insDuration) * 100, 0, 100);
			instance.reversePlayback = insTime < instance.currentTime;
			if (children) {
				syncInstanceChildren(insTime);
			}
			if (!instance.began && instance.currentTime > 0) {
				instance.began = true;
				setCallback('begin');
				setCallback('loopBegin');
			}
			if (insTime <= insDelay && instance.currentTime !== 0) {
				setAnimationsProgress(0);
			}
			if ((insTime >= insEndDelay && instance.currentTime !== insDuration) || !insDuration) {
				setAnimationsProgress(insDuration);
			}
			if (insTime > insDelay && insTime < insEndDelay) {
				if (!instance.changeBegan) {
					instance.changeBegan = true;
					instance.changeCompleted = false;
					setCallback('changeBegin');
				}
				setCallback('change');
				setAnimationsProgress(insTime);
			} else {
				if (instance.changeBegan) {
					instance.changeCompleted = true;
					instance.changeBegan = false;
					setCallback('changeComplete');
				}
			}
			instance.currentTime = minMax(insTime, 0, insDuration);
			if (instance.began) { 
				setCallback('update');
			}
			if (engineTime >= insDuration) {
				lastTime = 0;
				countIteration();
				if (instance.remaining) {
					startTime = now;
					setCallback('loopComplete');
					setCallback('loopBegin');
					if (instance.direction === 'alternate') { 
						toggleInstanceDirection(); 
					}
				} else {
					instance.paused = true;
					if (!instance.completed) {
						instance.completed = true;
						setCallback('loopComplete');
						setCallback('complete');
						if (!instance.passThrough && 'Promise' in window) {
							resolve();
							promise = makePromise(instance);
						}
					}
				}
			}
		}

		instance.reset = function() {
			var direction = instance.direction;
			instance.passThrough = false;
			instance.currentTime = 0;
			instance.progress = 0;
			instance.paused = true;
			instance.began = false;
			instance.changeBegan = false;
			instance.completed = false;
			instance.changeCompleted = false;
			instance.reversePlayback = false;
			instance.reversed = direction === 'reverse';
			instance.remaining = instance.loop;
			children = instance.children;
			childrenLength = children.length;
			for (var i = childrenLength; i--;) { 
				instance.children[i].reset(); 
			}
			if (instance.reversed && instance.loop !== true || (direction === 'alternate' && instance.loop === 1)) { instance.remaining++; }
			setAnimationsProgress(0);
		};

		// Set Value helper

		instance.set = function(targets, properties) {
			setTargetsValue(targets, properties);
			return instance;
		};

		instance.tick = function(t) {
			now = t;
			if (!startTime) { 
				startTime = now; 
			}
			setInstanceProgress((now + (lastTime - startTime)) * anime.speed);
		};

		instance.seek = function(time) {
			setInstanceProgress(adjustTime(time));
		};

		instance.pause = function() {
			instance.paused = true;
			resetTime();
		};

		instance.play = function() {
			if (!instance.paused) { 
				return; 
			}
			if (instance.completed) { 
				instance.reset(); 
			}
			instance.paused = false;
			activeInstances.push(instance);
			resetTime();
			if (!raf) { 
				engine(); 
			}
		};

		instance.reverse = function() {
			toggleInstanceDirection();
			resetTime();
		};

		instance.restart = function() {
			instance.reset();
			instance.play();
		};

		instance.reset();

		if (instance.autoplay) { 
			instance.play(); 
		}

		return instance;

	}

	// Remove targets from animation

	function removeTargetsFromAnimations(targetsArray, animations) {
		for (var a = animations.length; a--;) {
			if (arrayContains(targetsArray, animations[a].animatable.target)) {
				animations.splice(a, 1);
			}
		}
	}

	function removeTargets(targets) {
		var targetsArray = parseTargets(targets);
		for (var i = activeInstances.length; i--;) {
			var instance = activeInstances[i];
			var animations = instance.animations;
			var children = instance.children;
			removeTargetsFromAnimations(targetsArray, animations);
			for (var c = children.length; c--;) {
				var child = children[c];
				var childAnimations = child.animations;
				removeTargetsFromAnimations(targetsArray, childAnimations);
				if (!childAnimations.length && !child.children.length) { 
					children.splice(c, 1); 
				}
			}
			if (!animations.length && !children.length) { 
				instance.pause(); 
			}
		}
	}

	// Stagger helpers

	function stagger(val, params) {
		if ( params === void 0 ) {
			params = {};
		}

		var direction = params.direction || 'normal';
		var easing = params.easing ? parseEasings(params.easing) : null;
		var grid = params.grid;
		var axis = params.axis;
		var fromIndex = params.from || 0;
		var fromFirst = fromIndex === 'first';
		var fromCenter = fromIndex === 'center';
		var fromLast = fromIndex === 'last';
		var isRange = is.arr(val);
		var val1 = isRange ? parseFloat(val[0]) : parseFloat(val);
		var val2 = isRange ? parseFloat(val[1]) : 0;
		var unit = getUnit(isRange ? val[1] : val) || 0;
		var start = params.start || 0 + (isRange ? val1 : 0);
		var values = [];
		var maxValue = 0;
		return function (el, i, t) {
			if (fromFirst) { fromIndex = 0; }
			if (fromCenter) { fromIndex = (t - 1) / 2; }
			if (fromLast) { fromIndex = t - 1; }
			if (!values.length) {
				for (var index = 0; index < t; index++) {
					if (!grid) {
						values.push(Math.abs(fromIndex - index));
					} else {
						var fromX = !fromCenter ? fromIndex%grid[0] : (grid[0]-1)/2;
						var fromY = !fromCenter ? Math.floor(fromIndex/grid[0]) : (grid[1]-1)/2;
						var toX = index%grid[0];
						var toY = Math.floor(index/grid[0]);
						var distanceX = fromX - toX;
						var distanceY = fromY - toY;
						var value = Math.sqrt(distanceX * distanceX + distanceY * distanceY);
						if (axis === 'x') { 
							value = -distanceX; 
						}
						if (axis === 'y') { 
							value = -distanceY; 
						}
						values.push(value);
					}
					maxValue = Math.max.apply(Math, values);
				}
				if (easing) { 
					values = values.map(function (val) { 
						return easing(val / maxValue) * maxValue; 
					}); 
				}
				if (direction === 'reverse') { 
					values = values.map(function (val) { 
						return axis ? (val < 0) ? val * -1 : -val : Math.abs(maxValue - val); 
					}); 
				}
			}
			var spacing = isRange ? (val2 - val1) / maxValue : val1;
			return start + (spacing * (Math.round(values[i] * 100) / 100)) + unit;
		};
	}

	// Timeline
	function timeline(params) {
		if ( params === void 0 ) {
			params = {};
		}

		var tl = anime(params);
		tl.duration = 0;
		tl.add = function(instanceParams, timelineOffset) {
			var tlIndex = activeInstances.indexOf(tl);
			var children = tl.children;
			if (tlIndex > -1) { activeInstances.splice(tlIndex, 1); }
			function passThrough(ins) { ins.passThrough = true; }
			for (var i = 0; i < children.length; i++) { 
				passThrough(children[i]); 
			}
			var insParams = mergeObjects(instanceParams, replaceObjectProps(defaultTweenSettings, params));
			insParams.targets = insParams.targets || params.targets;
			var tlDuration = tl.duration;
			insParams.autoplay = false;
			insParams.direction = tl.direction;
			insParams.timelineOffset = is.und(timelineOffset) ? tlDuration : getRelativeValue(timelineOffset, tlDuration);
			passThrough(tl);
			tl.seek(insParams.timelineOffset);
			var ins = anime(insParams);
			passThrough(ins);
			children.push(ins);
			var timings = getInstanceTimings(children, params);
			tl.delay = timings.delay;
			tl.endDelay = timings.endDelay;
			tl.duration = timings.duration;
			tl.seek(0);
			tl.reset();
			if (tl.autoplay) { 
				tl.play(); 
			}
			return tl;
		};
		return tl;
	}

	anime.version = '3.0.1';
	anime.speed = 1;
	anime.running = activeInstances;
	anime.remove = removeTargets;
	anime.get = getOriginalTargetValue;
	anime.set = setTargetsValue;
	anime.convertPx = convertPxToUnit;
	anime.path = getPath;
	anime.setDashoffset = setDashoffset;
	anime.stagger = stagger;
	anime.timeline = timeline;
	anime.easing = parseEasings;
	anime.penner = penner;
	anime.random = function (min, max) { 
		return Math.floor(Math.random() * (max - min + 1)) + min; 
	};

	return anime;
});


/* PrismJS 1.15.0
https://prismjs.com/download.html#themes=prism&languages=markup+css+clike+javascript&plugins=line-numbers */

/**
 * Prism: Lightweight, robust, elegant syntax highlighting
 * MIT license http://www.opensource.org/licenses/mit-license.php/
 * @author Lea Verou http://lea.verou.me
 */

var Prism = (function(){
	'use strict';

//	Private helper vars
	var lang = /\blang(?:uage)?-([\w-]+)\b/i;
	var uniqueId = 0;

	var _ = window.Prism = {
			manual: window.Prism && window.Prism.manual,
			disableWorkerMessageHandler: window.Prism && window.Prism.disableWorkerMessageHandler,
			util: {
				encode: function (tokens) {
					if (tokens instanceof Token) {
						return new Token(tokens.type, _.util.encode(tokens.content), tokens.alias);
					} else if (_.util.type(tokens) === 'Array') {
						return tokens.map(_.util.encode);
					} else {
						return tokens.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\u00a0/g, ' ');
					}
				},

				type: function (o) {
					return Object.prototype.toString.call(o).slice(8, -1);
				},

				objId: function (obj) {
					if (!obj['__id']) {
						Object.defineProperty(obj, '__id', { value: ++uniqueId });
					}
					return obj['__id'];
				},

				// Deep clone a language definition (e.g. to extend it)
				clone: function (o, visited) {
					var type = _.util.type(o);
					visited = visited || {};

					switch (type) {
					case 'Object':
						if (visited[_.util.objId(o)]) {
							return visited[_.util.objId(o)];
						}
						var clone = {};
						visited[_.util.objId(o)] = clone;

						for (var key in o) {
							if (o.hasOwnProperty(key)) {
								clone[key] = _.util.clone(o[key], visited);
							}
						}

						return clone;

					case 'Array':
						if (visited[_.util.objId(o)]) {
							return visited[_.util.objId(o)];
						}
						var clone = [];
						visited[_.util.objId(o)] = clone;

						o.forEach(function (v, i) {
							clone[i] = _.util.clone(v, visited);
						});

						return clone;
					}

					return o;
				}
			},

			languages: {
				extend: function (id, redef) {
					var lang = _.util.clone(_.languages[id]);

					for (var key in redef) {
						lang[key] = redef[key];
					}

					return lang;
				},

				/**
				 * Insert a token before another token in a language literal
				 * As this needs to recreate the object (we cannot actually insert before keys in object literals),
				 * we cannot just provide an object, we need an object and a key.
				 * @param inside The key (or language id) of the parent
				 * @param before The key to insert before.
				 * @param insert Object with the key/value pairs to insert
				 * @param root The object that contains `inside`. If equal to Prism.languages, it can be omitted.
				 */
				insertBefore: function (inside, before, insert, root) {
					root = root || _.languages;
					var grammar = root[inside];
					var ret = {};

					for (var token in grammar) {
						if (grammar.hasOwnProperty(token)) {

							if (token == before) {
								for (var newToken in insert) {
									if (insert.hasOwnProperty(newToken)) {
										ret[newToken] = insert[newToken];
									}
								}
							}

							// Do not insert token which also occur in insert. See #1525
							if (!insert.hasOwnProperty(token)) {
								ret[token] = grammar[token];
							}
						}
					}

					var old = root[inside];
					root[inside] = ret;

					// Update references in other language definitions
					_.languages.DFS(_.languages, function(key, value) {
						if (value === old && key != inside) {
							this[key] = ret;
						}
					});

					return ret;
				},

				// Traverse a language definition with Depth First Search
				DFS: function(o, callback, type, visited) {
					visited = visited || {};
					for (var i in o) {
						if (o.hasOwnProperty(i)) {
							callback.call(o, i, o[i], type || i);

							if (_.util.type(o[i]) === 'Object' && !visited[_.util.objId(o[i])]) {
								visited[_.util.objId(o[i])] = true;
								_.languages.DFS(o[i], callback, null, visited);
							}
							else if (_.util.type(o[i]) === 'Array' && !visited[_.util.objId(o[i])]) {
								visited[_.util.objId(o[i])] = true;
								_.languages.DFS(o[i], callback, i, visited);
							}
						}
					}
				}
			},
			plugins: {},

			highlightAll: function(async, callback) {
				_.highlightAllUnder(document, async, callback);
			},

			highlightAllUnder: function(container, async, callback) {
				var env = {
						callback: callback,
						selector: 'code[class*="language-"], [class*="language-"] code, code[class*="lang-"], [class*="lang-"] code'
				};

				_.hooks.run("before-highlightall", env);

				var elements = env.elements || container.querySelectorAll(env.selector);

				for (var i=0, element; element = elements[i++];) {
					_.highlightElement(element, async === true, env.callback);
				}
			},

			highlightElement: function(element, async, callback) {
				// Find language
				var language, grammar, parent = element;

				while (parent && !lang.test(parent.className)) {
					parent = parent.parentNode;
				}

				if (parent) {
					language = (parent.className.match(lang) || [,''])[1].toLowerCase();
					grammar = _.languages[language];
				}

				// Set language on the element, if not present
				element.className = element.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;

				if (element.parentNode) {
					// Set language on the parent, for styling
					parent = element.parentNode;

					if (/pre/i.test(parent.nodeName)) {
						parent.className = parent.className.replace(lang, '').replace(/\s+/g, ' ') + ' language-' + language;
					}
				}

				var code = element.textContent;

				var env = {
						element: element,
						language: language,
						grammar: grammar,
						code: code
				};

				var insertHighlightedCode = function (highlightedCode) {
					env.highlightedCode = highlightedCode;

					_.hooks.run('before-insert', env);

					env.element.innerHTML = env.highlightedCode;

					_.hooks.run('after-highlight', env);
					_.hooks.run('complete', env);
					callback && callback.call(env.element);
				}

				_.hooks.run('before-sanity-check', env);

				if (!env.code) {
					_.hooks.run('complete', env);
					return;
				}

				_.hooks.run('before-highlight', env);

				if (!env.grammar) {
					insertHighlightedCode(_.util.encode(env.code));
					return;
				}

				if (async && window.Worker) {
					var worker = new Worker(_.filename);

					worker.onmessage = function(evt) {
						insertHighlightedCode(evt.data);
					};

					worker.postMessage(JSON.stringify({
						language: env.language,
						code: env.code,
						immediateClose: true
					}));
				}
				else {
					insertHighlightedCode(_.highlight(env.code, env.grammar, env.language));
				}
			},

			highlight: function (text, grammar, language) {
				var env = {
						code: text,
						grammar: grammar,
						language: language
				};
				_.hooks.run('before-tokenize', env);
				env.tokens = _.tokenize(env.code, env.grammar);
				_.hooks.run('after-tokenize', env);
				return Token.stringify(_.util.encode(env.tokens), env.language);
			},

			matchGrammar: function (text, strarr, grammar, index, startPos, oneshot, target) {
				var Token = _.Token;

				for (var token in grammar) {
					if(!grammar.hasOwnProperty(token) || !grammar[token]) {
						continue;
					}

					if (token == target) {
						return;
					}

					var patterns = grammar[token];
					patterns = (_.util.type(patterns) === "Array") ? patterns : [patterns];

					for (var j = 0; j < patterns.length; ++j) {
						var pattern = patterns[j],
						inside = pattern.inside,
						lookbehind = !!pattern.lookbehind,
						greedy = !!pattern.greedy,
						lookbehindLength = 0,
						alias = pattern.alias;

						if (greedy && !pattern.pattern.global) {
							// Without the global flag, lastIndex won't work
							var flags = pattern.pattern.toString().match(/[imuy]*$/)[0];
							pattern.pattern = RegExp(pattern.pattern.source, flags + "g");
						}

						pattern = pattern.pattern || pattern;

						// Don’t cache length as it changes during the loop
						for (var i = index, pos = startPos; i < strarr.length; pos += strarr[i].length, ++i) {

							var str = strarr[i];

							if (strarr.length > text.length) {
								// Something went terribly wrong, ABORT, ABORT!
								return;
							}

							if (str instanceof Token) {
								continue;
							}

							if (greedy && i != strarr.length - 1) {
								pattern.lastIndex = pos;
								var match = pattern.exec(text);
								if (!match) {
									break;
								}

								var from = match.index + (lookbehind ? match[1].length : 0),
								to = match.index + match[0].length,
								k = i,
								p = pos;

								for (var len = strarr.length; k < len && (p < to || (!strarr[k].type && !strarr[k - 1].greedy)); ++k) {
									p += strarr[k].length;
									// Move the index i to the element in strarr that is closest to from
									if (from >= p) {
										++i;
										pos = p;
									}
								}

								// If strarr[i] is a Token, then the match starts inside another Token, which is invalid
								if (strarr[i] instanceof Token) {
									continue;
								}

								// Number of tokens to delete and replace with the new match
								delNum = k - i;
								str = text.slice(pos, p);
								match.index -= pos;
							} else {
								pattern.lastIndex = 0;

								var match = pattern.exec(str),
								delNum = 1;
							}

							if (!match) {
								if (oneshot) {
									break;
								}

								continue;
							}

							if(lookbehind) {
								lookbehindLength = match[1] ? match[1].length : 0;
							}

							var from = match.index + lookbehindLength,
							match = match[0].slice(lookbehindLength),
							to = from + match.length,
							before = str.slice(0, from),
							after = str.slice(to);

							var args = [i, delNum];

							if (before) {
								++i;
								pos += before.length;
								args.push(before);
							}

							var wrapped = new Token(token, inside? _.tokenize(match, inside) : match, alias, match, greedy);

							args.push(wrapped);

							if (after) {
								args.push(after);
							}

							Array.prototype.splice.apply(strarr, args);

							if (delNum != 1)
								_.matchGrammar(text, strarr, grammar, i, pos, true, token);

							if (oneshot)
								break;
						}
					}
				}
			},

			tokenize: function(text, grammar) {
				var strarr = [text];

				var rest = grammar.rest;

				if (rest) {
					for (var token in rest) {
						grammar[token] = rest[token];
					}

					delete grammar.rest;
				}

				_.matchGrammar(text, strarr, grammar, 0, 0, false);

				return strarr;
			},

			hooks: {
				all: {},

				add: function (name, callback) {
					var hooks = _.hooks.all;

					hooks[name] = hooks[name] || [];

					hooks[name].push(callback);
				},

				run: function (name, env) {
					var callbacks = _.hooks.all[name];

					if (!callbacks || !callbacks.length) {
						return;
					}

					for (var i=0, callback; callback = callbacks[i++];) {
						callback(env);
					}
				}
			}
	};

	var Token = _.Token = function(type, content, alias, matchedStr, greedy) {
		this.type = type;
		this.content = content;
		this.alias = alias;
		// Copy of the full string this token was created from
		this.length = (matchedStr || "").length|0;
		this.greedy = !!greedy;
	};

	Token.stringify = function(o, language, parent) {
		if (typeof o == 'string') {
			return o;
		}

		if (_.util.type(o) === 'Array') {
			return o.map(function(element) {
				return Token.stringify(element, language, o);
			}).join('');
		}

		var env = {
				type: o.type,
				content: Token.stringify(o.content, language, parent),
				tag: 'span',
				classes: ['token', o.type],
				attributes: {},
				language: language,
				parent: parent
		};

		if (o.alias) {
			var aliases = _.util.type(o.alias) === 'Array' ? o.alias : [o.alias];
			Array.prototype.push.apply(env.classes, aliases);
		}

		_.hooks.run('wrap', env);

		var attributes = Object.keys(env.attributes).map(function(name) {
			return name + '="' + (env.attributes[name] || '').replace(/"/g, '&quot;') + '"';
		}).join(' ');

		return '<' + env.tag + ' class="' + env.classes.join(' ') + '"' + (attributes ? ' ' + attributes : '') + '>' + env.content + '</' + env.tag + '>';

	};

	if (!window.document) {
		if (!window.addEventListener) {
			// in Node.js
			return window.Prism;
		}

		if (!_.disableWorkerMessageHandler) {
			// In worker
			window.addEventListener('message', function (evt) {
				var message = JSON.parse(evt.data),
				lang = message.language,
				code = message.code,
				immediateClose = message.immediateClose;

				window.postMessage(_.highlight(code, _.languages[lang], lang));
				if (immediateClose) {
					window.close();
				}
			}, false);
		}

		return window.Prism;
	}

//	Get current script and highlight
	var script = document.currentScript || [].slice.call(document.getElementsByTagName("script")).pop();

	if (script) {
		_.filename = script.src;

		if (!_.manual && !script.hasAttribute('data-manual')) {
			if(document.readyState !== "loading") {
				if (window.requestAnimationFrame) {
					window.requestAnimationFrame(_.highlightAll);
				} else {
					window.setTimeout(_.highlightAll, 16);
				}
			}
			else {
				document.addEventListener('DOMContentLoaded', _.highlightAll);
			}
		}
	}

	return window.Prism;

})();

if (typeof module !== 'undefined' && module.exports) {
	module.exports = Prism;
}

//hack for components to work correctly in node.js
if (typeof global !== 'undefined') {
	global.Prism = Prism;
}
;
Prism.languages.markup = {
		'comment': /<!--[\s\S]*?-->/,
		'prolog': /<\?[\s\S]+?\?>/,
		'doctype': /<!DOCTYPE[\s\S]+?>/i,
		'cdata': /<!\[CDATA\[[\s\S]*?]]>/i,
		'tag': {
			pattern: /<\/?(?!\d)[^\s>\/=$<%]+(?:\s+[^\s>\/=]+(?:=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+))?)*\s*\/?>/i,
			greedy: true,
			inside: {
				'tag': {
					pattern: /^<\/?[^\s>\/]+/i,
					inside: {
						'punctuation': /^<\/?/,
						'namespace': /^[^\s>\/:]+:/
					}
				},
				'attr-value': {
					pattern: /=(?:("|')(?:\\[\s\S]|(?!\1)[^\\])*\1|[^\s'">=]+)/i,
					inside: {
						'punctuation': [
							/^=/,
							{
								pattern: /(^|[^\\])["']/,
								lookbehind: true
							}
							]
					}
				},
				'punctuation': /\/?>/,
				'attr-name': {
					pattern: /[^\s>\/]+/,
					inside: {
						'namespace': /^[^\s>\/:]+:/
					}
				}

			}
		},
		'entity': /&#?[\da-z]{1,8};/i
};

Prism.languages.markup['tag'].inside['attr-value'].inside['entity'] =
	Prism.languages.markup['entity'];

//Plugin to make entity title show the real entity, idea by Roman Komarov
Prism.hooks.add('wrap', function(env) {
	'use strict';
	if (env.type === 'entity') {
		env.attributes['title'] = env.content.replace(/&amp;/, '&');
	}
});

Prism.languages.xml = Prism.languages.extend('markup', {});
Prism.languages.html = Prism.languages.markup;
Prism.languages.mathml = Prism.languages.markup;
Prism.languages.svg = Prism.languages.markup;

Prism.languages.css = {
		'comment': /\/\*[\s\S]*?\*\//,
		'atrule': {
			pattern: /@[\w-]+?[\s\S]*?(?:;|(?=\s*\{))/i,
			inside: {
				'rule': /@[\w-]+/
					// See rest below
			}
		},
		'url': /url\((?:(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1|.*?)\)/i,
		'selector': /[^{}\s][^{};]*?(?=\s*\{)/,
		'string': {
			pattern: /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
			greedy: true
		},
		'property': /[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*(?=\s*:)/i,
		'important': /!important\b/i,
		'function': /[-a-z0-9]+(?=\()/i,
		'punctuation': /[(){};:,]/
};

Prism.languages.css['atrule'].inside.rest = Prism.languages.css;

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'style': {
			pattern: /(<style[\s\S]*?>)[\s\S]*?(?=<\/style>)/i,
			lookbehind: true,
			inside: Prism.languages.css,
			alias: 'language-css',
			greedy: true
		}
	});

	Prism.languages.insertBefore('inside', 'attr-value', {
		'style-attr': {
			pattern: /\s*style=("|')(?:\\[\s\S]|(?!\1)[^\\])*\1/i,
			inside: {
				'attr-name': {
					pattern: /^\s*style/i,
					inside: Prism.languages.markup.tag.inside
				},
				'punctuation': /^\s*=\s*['"]|['"]\s*$/,
				'attr-value': {
					pattern: /.+/i,
					inside: Prism.languages.css
				}
			},
			alias: 'language-css'
		}
	}, Prism.languages.markup.tag);
}
;
Prism.languages.clike = {
		'comment': [
			{
				pattern: /(^|[^\\])\/\*[\s\S]*?(?:\*\/|$)/,
				lookbehind: true
			},
			{
				pattern: /(^|[^\\:])\/\/.*/,
				lookbehind: true,
				greedy: true
			}
			],
			'string': {
				pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
				greedy: true
			},
			'class-name': {
				pattern: /((?:\b(?:class|interface|extends|implements|trait|instanceof|new)\s+)|(?:catch\s+\())[\w.\\]+/i,
				lookbehind: true,
				inside: {
					punctuation: /[.\\]/
				}
			},
			'keyword': /\b(?:if|else|while|do|for|return|in|instanceof|function|new|try|throw|catch|finally|null|break|continue)\b/,
			'boolean': /\b(?:true|false)\b/,
			'function': /\w+(?=\()/,
			'number': /\b0x[\da-f]+\b|(?:\b\d+\.?\d*|\B\.\d+)(?:e[+-]?\d+)?/i,
			'operator': /--?|\+\+?|!=?=?|<=?|>=?|==?=?|&&?|\|\|?|\?|\*|\/|~|\^|%/,
			'punctuation': /[{}[\];(),.:]/
};

Prism.languages.javascript = Prism.languages.extend('clike', {
	'class-name': [
		Prism.languages.clike['class-name'],
		{
			pattern: /(^|[^$\w\xA0-\uFFFF])[_$A-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\.(?:prototype|constructor))/,
			lookbehind: true
		}
		],
		'keyword': [
			{
				pattern: /((?:^|})\s*)(?:catch|finally)\b/,
				lookbehind: true
			},
			/\b(?:as|async|await|break|case|class|const|continue|debugger|default|delete|do|else|enum|export|extends|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)\b/
			],
			'number': /\b(?:(?:0[xX][\dA-Fa-f]+|0[bB][01]+|0[oO][0-7]+)n?|\d+n|NaN|Infinity)\b|(?:\b\d+\.?\d*|\B\.\d+)(?:[Ee][+-]?\d+)?/,
			// Allow for all non-ASCII characters (See http://stackoverflow.com/a/2008444)
			'function': /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*\(|\.(?:apply|bind|call)\()/,
			'operator': /-[-=]?|\+[+=]?|!=?=?|<<?=?|>>?>?=?|=(?:==?|>)?|&[&=]?|\|[|=]?|\*\*?=?|\/=?|~|\^=?|%=?|\?|\.{3}/
});

Prism.languages.javascript['class-name'][0].pattern = /(\b(?:class|interface|extends|implements|instanceof|new)\s+)[\w.\\]+/

	Prism.languages.insertBefore('javascript', 'keyword', {
		'regex': {
			pattern: /((?:^|[^$\w\xA0-\uFFFF."'\])\s])\s*)\/(\[(?:[^\]\\\r\n]|\\.)*]|\\.|[^/\\\[\r\n])+\/[gimyu]{0,5}(?=\s*($|[\r\n,.;})\]]))/,
			lookbehind: true,
			greedy: true
		},
		// This must be declared before keyword because we use "function" inside the look-forward
		'function-variable': {
			pattern: /[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*[=:]\s*(?:async\s*)?(?:\bfunction\b|(?:\((?:[^()]|\([^()]*\))*\)|[_$a-zA-Z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)\s*=>))/,
			alias: 'function'
		},
		'parameter': [
			{
				pattern: /(function(?:\s+[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\))/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/i,
				inside: Prism.languages.javascript
			},
			{
				pattern: /(\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*=>)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			},
			{
				pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|set|static|super|switch|this|throw|try|typeof|undefined|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$A-Za-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)(?!\s)(?:[^()]|\([^()]*\))+?(?=\s*\)\s*\{)/,
				lookbehind: true,
				inside: Prism.languages.javascript
			}
			],
			'constant': /\b[A-Z][A-Z\d_]*\b/
	});

Prism.languages.insertBefore('javascript', 'string', {
	'template-string': {
		pattern: /`(?:\\[\s\S]|\${[^}]+}|[^\\`])*`/,
		greedy: true,
		inside: {
			'interpolation': {
				pattern: /\${[^}]+}/,
				inside: {
					'interpolation-punctuation': {
						pattern: /^\${|}$/,
						alias: 'punctuation'
					},
					rest: Prism.languages.javascript
				}
			},
			'string': /[\s\S]+/
		}
	}
});

if (Prism.languages.markup) {
	Prism.languages.insertBefore('markup', 'tag', {
		'script': {
			pattern: /(<script[\s\S]*?>)[\s\S]*?(?=<\/script>)/i,
			lookbehind: true,
			inside: Prism.languages.javascript,
			alias: 'language-javascript',
			greedy: true
		}
	});
}

Prism.languages.js = Prism.languages.javascript;

(function () {

	if (typeof self === 'undefined' || !self.Prism || !self.document) {
		return;
	}

	/**
	 * Plugin name which is used as a class name for <pre> which is activating the plugin
	 * @type {String}
	 */
	var PLUGIN_NAME = 'line-numbers';

	/**
	 * Regular expression used for determining line breaks
	 * @type {RegExp}
	 */
	var NEW_LINE_EXP = /\n(?!$)/g;

	/**
	 * Resizes line numbers spans according to height of line of code
	 * @param {Element} element <pre> element
	 */
	var _resizeElement = function (element) {
		var codeStyles = getStyles(element);
		var whiteSpace = codeStyles['white-space'];

		if (whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line') {
			var codeElement = element.querySelector('code');
			var lineNumbersWrapper = element.querySelector('.line-numbers-rows');
			var lineNumberSizer = element.querySelector('.line-numbers-sizer');
			var codeLines = codeElement.textContent.split(NEW_LINE_EXP);

			if (!lineNumberSizer) {
				lineNumberSizer = document.createElement('span');
				lineNumberSizer.className = 'line-numbers-sizer';

				codeElement.appendChild(lineNumberSizer);
			}

			lineNumberSizer.style.display = 'block';

			codeLines.forEach(function (line, lineNumber) {
				lineNumberSizer.textContent = line || '\n';
				var lineSize = lineNumberSizer.getBoundingClientRect().height;
				lineNumbersWrapper.children[lineNumber].style.height = lineSize + 'px';
			});

			lineNumberSizer.textContent = '';
			lineNumberSizer.style.display = 'none';
		}
	};

	/**
	 * Returns style declarations for the element
	 * @param {Element} element
	 */
	var getStyles = function (element) {
		if (!element) {
			return null;
		}

		return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
	};

	window.addEventListener('resize', function () {
		Array.prototype.forEach.call(document.querySelectorAll('pre.' + PLUGIN_NAME), _resizeElement);
	});

	Prism.hooks.add('complete', function (env) {
		if (!env.code) {
			return;
		}

		// works only for <code> wrapped inside <pre> (not inline)
		var pre = env.element.parentNode;
		var clsReg = /\s*\bline-numbers\b\s*/;
		if (
				!pre || !/pre/i.test(pre.nodeName) ||
				// Abort only if nor the <pre> nor the <code> have the class
				(!clsReg.test(pre.className) && !clsReg.test(env.element.className))
		) {
			return;
		}

		if (env.element.querySelector('.line-numbers-rows')) {
			// Abort if line numbers already exists
			return;
		}

		if (clsReg.test(env.element.className)) {
			// Remove the class 'line-numbers' from the <code>
			env.element.className = env.element.className.replace(clsReg, ' ');
		}
		if (!clsReg.test(pre.className)) {
			// Add the class 'line-numbers' to the <pre>
			pre.className += ' line-numbers';
		}

		var match = env.code.match(NEW_LINE_EXP);
		var linesNum = match ? match.length + 1 : 1;
		var lineNumbersWrapper;

		var lines = new Array(linesNum + 1);
		lines = lines.join('<span></span>');

		lineNumbersWrapper = document.createElement('span');
		lineNumbersWrapper.setAttribute('aria-hidden', 'true');
		lineNumbersWrapper.className = 'line-numbers-rows';
		lineNumbersWrapper.innerHTML = lines;

		if (pre.hasAttribute('data-start')) {
			pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
		}

		env.element.appendChild(lineNumbersWrapper);

		_resizeElement(pre);

		Prism.hooks.run('line-numbers', env);
	});

	Prism.hooks.add('line-numbers', function (env) {
		env.plugins = env.plugins || {};
		env.plugins.lineNumbers = true;
	});

	/**
	 * Global exports
	 */
	Prism.plugins.lineNumbers = {
			/**
			 * Get node for provided line number
			 * @param {Element} element pre element
			 * @param {Number} number line number
			 * @return {Element|undefined}
			 */
			getLine: function (element, number) {
				if (element.tagName !== 'PRE' || !element.classList.contains(PLUGIN_NAME)) {
					return;
				}

				var lineNumberRows = element.querySelector('.line-numbers-rows');
				var lineNumberStart = parseInt(element.getAttribute('data-start'), 10) || 1;
				var lineNumberEnd = lineNumberStart + (lineNumberRows.children.length - 1);

				if (number < lineNumberStart) {
					number = lineNumberStart;
				}
				if (number > lineNumberEnd) {
					number = lineNumberEnd;
				}

				var lineIndex = number - lineNumberStart;

				return lineNumberRows.children[lineIndex];
			}
	};

}());

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
 * Binds a TinyMCE widget to <textarea> elements.
 */
angular.module('ui.tinymce', [])
.value('uiTinymceConfig', {})
.directive('uiTinymce', function($rootScope, $compile, $timeout, $window, $sce, uiTinymceConfig, uiTinymceService) {
	uiTinymceConfig = uiTinymceConfig || {};

	if (uiTinymceConfig.baseUrl) {
		tinymce.baseURL = uiTinymceConfig.baseUrl;
	}

	return {
		require: ['ngModel', '^?form'],
		priority: 599,
		link: function(scope, element, attrs, ctrls) {
			if (!$window.tinymce) {
				return;
			}

			var ngModel = ctrls[0],
			form = ctrls[1] || null;

			var expression, options = {
					debounce: true
			}, tinyInstance,
			updateView = function(editor) {
				var content = editor.getContent({format: options.format}).trim();
				content = $sce.trustAsHtml(content);

				ngModel.$setViewValue(content);
				if (!$rootScope.$$phase) {
					scope.$digest();
				}
			};

			function toggleDisable(disabled) {
				if (disabled) {
					ensureInstance();

					if (tinyInstance) {
						tinyInstance.getBody().setAttribute('contenteditable', false);
					}
				} else {
					ensureInstance();

					if (tinyInstance && !tinyInstance.settings.readonly && tinyInstance.getDoc()) {
						tinyInstance.getBody().setAttribute('contenteditable', true);
					}
				}
			}

			// fetch a unique ID from the service
			var uniqueId = uiTinymceService.getUniqueId();
			attrs.$set('id', uniqueId);

			expression = {};

			angular.extend(expression, scope.$eval(attrs.uiTinymce));

			//Debounce update and save action
			var debouncedUpdate = (function(debouncedUpdateDelay) {
				var debouncedUpdateTimer;
				return function(ed) {
					$timeout.cancel(debouncedUpdateTimer);
					debouncedUpdateTimer = $timeout(function() {
						return (function(ed) {
							if (ed.isDirty()) {
								ed.save();
								updateView(ed);
							}
						})(ed);
					}, debouncedUpdateDelay);
				};
			})(400);

			var setupOptions = {
					// Update model when calling setContent
					// (such as from the source editor popup)
					setup: function(ed) {
						ed.on('init', function() {
							ngModel.$render();
							ngModel.$setPristine();
							ngModel.$setUntouched();
							if (form) {
								form.$setPristine();
							}
						});

						// Update model when:
						// - a button has been clicked [ExecCommand]
						// - the editor content has been modified [change]
						// - the node has changed [NodeChange]
						// - an object has been resized (table, image) [ObjectResized]
						ed.on('ExecCommand change NodeChange ObjectResized', function() {
							if (!options.debounce) {
								ed.save();
								updateView(ed);
								return;
							}
							debouncedUpdate(ed);
						});

						ed.on('blur', function() {
							element[0].blur();
							ngModel.$setTouched();
							if (!$rootScope.$$phase) {
								scope.$digest();
							}
						});

						ed.on('remove', function() {
							element.remove();
						});

						if (uiTinymceConfig.setup) {
							uiTinymceConfig.setup(ed, {
								updateView: updateView
							});
						}

						if (expression.setup) {
							expression.setup(ed, {
								updateView: updateView
							});
						}
					},
					format: expression.format || 'html',
					selector: '#' + attrs.id
			};
			// extend options with initial uiTinymceConfig and
			// options from directive attribute value
			angular.extend(options, uiTinymceConfig, expression, setupOptions);
			// Wrapped in $timeout due to $tinymce:refresh implementation, requires
			// element to be present in DOM before instantiating editor when
			// re-rendering directive
			$timeout(function() {
				if (options.baseURL){
					tinymce.baseURL = options.baseURL;
				}
				var maybeInitPromise = tinymce.init(options);
				if(maybeInitPromise && typeof maybeInitPromise.then === 'function') {
					maybeInitPromise.then(function() {
						toggleDisable(scope.$eval(attrs.ngDisabled));
					});
				} else {
					toggleDisable(scope.$eval(attrs.ngDisabled));
				}
			});

			ngModel.$formatters.unshift(function(modelValue) {
				return modelValue ? $sce.trustAsHtml(modelValue) : '';
			});

			ngModel.$parsers.unshift(function(viewValue) {
				return viewValue ? $sce.getTrustedHtml(viewValue) : '';
			});

			ngModel.$render = function() {
				ensureInstance();

				var viewValue = ngModel.$viewValue ?
						$sce.getTrustedHtml(ngModel.$viewValue) : '';

						// instance.getDoc() check is a guard against null value
						// when destruction & recreation of instances happen
						if (tinyInstance &&
								tinyInstance.getDoc()
						) {
							tinyInstance.setContent(viewValue);
							// Triggering change event due to TinyMCE not firing event &
							// becoming out of sync for change callbacks
							tinyInstance.fire('change');
						}
			};

			attrs.$observe('disabled', toggleDisable);

			// This block is because of TinyMCE not playing well with removal and
			// recreation of instances, requiring instances to have different
			// selectors in order to render new instances properly
			var unbindEventListener = scope.$on('$tinymce:refresh', function(e, id) {
				var eid = attrs.id;
				if (angular.isUndefined(id) || id === eid) {
					var parentElement = element.parent();
					var clonedElement = element.clone();
					clonedElement.removeAttr('id');
					clonedElement.removeAttr('style');
					clonedElement.removeAttr('aria-hidden');
					tinymce.execCommand('mceRemoveEditor', false, eid);
					parentElement.append($compile(clonedElement)(scope));
					unbindEventListener();
				}
			});

			scope.$on('$destroy', function() {
				ensureInstance();

				if (tinyInstance) {
					tinyInstance.remove();
					tinyInstance = null;
				}
			});

			function ensureInstance() {
				if (!tinyInstance) {
					tinyInstance = tinymce.get(attrs.id);
				}
			}
		}
	};
})

/**
 * A service is used to create unique ID's, this prevents duplicate ID's if there are multiple editors on screen.
 */
.service('uiTinymceService', function() {
	var UITinymceService = function() {
		var ID_ATTR = 'ui-tinymce';
		// uniqueId keeps track of the latest assigned ID
		var uniqueId = 0;
		// getUniqueId returns a unique ID
		var getUniqueId = function() {
			uniqueId ++;
			return ID_ATTR + '-' + uniqueId;
		};
		// return the function as a public method of the service
		return {
			getUniqueId: getUniqueId
		};
	};
	// return a new instance of the service
	return new UITinymceService();
});
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

angular.module('am-wb-core', [
	'ngMessages',
	'ngAnimate',
	'ngAria',
	'ngMaterial',
	'ngSanitize',

	'pascalprecht.translate',
	'mdColorPicker',
	'ui.tinymce',
	'dndLists',
	'material.components.expansionPanels',
	'ngMdIcons',
	'ngHandsontable'
]);

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
 * @ngdoc module
 * @name ngDonate
 * @description Defines icons to use every where.
 *
 */
angular.module('am-wb-core')
.config(function(wbIconServiceProvider) {
	wbIconServiceProvider


	/*
	 * Material Design Icons
	 * (http://materialdesignicons.com)
	 */
	.addShapes({
		'amazon': '<path d="M13.23 10.56V10c-1.94 0-3.99.39-3.99 2.67 0 1.16.61 1.95 1.63 1.95.76 0 1.43-.47 1.86-1.22.52-.93.5-1.8.5-2.84m2.7 6.53c-.18.16-.43.17-.63.06-.89-.74-1.05-1.08-1.54-1.79-1.47 1.5-2.51 1.95-4.42 1.95-2.25 0-4.01-1.39-4.01-4.17 0-2.18 1.17-3.64 2.86-4.38 1.46-.64 3.49-.76 5.04-.93V7.5c0-.66.05-1.41-.33-1.96-.32-.49-.95-.7-1.5-.7-1.02 0-1.93.53-2.15 1.61-.05.24-.25.48-.47.49l-2.6-.28c-.22-.05-.46-.22-.4-.56.6-3.15 3.45-4.1 6-4.1 1.3 0 3 .35 4.03 1.33C17.11 4.55 17 6.18 17 7.95v4.17c0 1.25.5 1.81 1 2.48.17.25.21.54 0 .71l-2.06 1.78h-.01"/><path d="M20.16 19.54C18 21.14 14.82 22 12.1 22c-3.81 0-7.25-1.41-9.85-3.76-.2-.18-.02-.43.25-.29 2.78 1.63 6.25 2.61 9.83 2.61 2.41 0 5.07-.5 7.51-1.53.37-.16.66.24.32.51"/><path d="M21.07 18.5c-.28-.36-1.85-.17-2.57-.08-.19.02-.22-.16-.03-.3 1.24-.88 3.29-.62 3.53-.33.24.3-.07 2.35-1.24 3.32-.18.16-.35.07-.26-.11.26-.67.85-2.14.57-2.5z"/>',
		'apple': '<path d="M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83"/>',
		'facebook-box': '<path d="M19 4v3h-2a1 1 0 0 0-1 1v2h3v3h-3v7h-3v-7h-2v-3h2V7.5C13 5.56 14.57 4 16.5 4M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2z"/>',
		'facebook-messenger': '<path d="M12 2C6.5 2 2 6.14 2 11.25c0 2.88 1.42 5.45 3.65 7.15l.06 3.6 3.45-1.88-.03-.01c.91.25 1.87.39 2.87.39 5.5 0 10-4.14 10-9.25S17.5 2 12 2m1.03 12.41l-2.49-2.63-5.04 2.63 5.38-5.63 2.58 2.47 4.85-2.47-5.28 5.63z"/>',
		'facebook': '<path d="M17 2v4h-2c-.69 0-1 .81-1 1.5V10h3v4h-3v8h-4v-8H7v-4h3V6a4 4 0 0 1 4-4h3z"/>',
		'github-box': '<path d="M4 2h16a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-5.15c-.35-.08-.35-.76-.35-1v-2.74c0-.93-.33-1.54-.69-1.85 2.23-.25 4.57-1.09 4.57-4.91 0-1.11-.38-2-1.03-2.71.1-.25.45-1.29-.1-2.64 0 0-.84-.27-2.75 1.02-.79-.22-1.65-.33-2.5-.33-.85 0-1.71.11-2.5.33-1.91-1.29-2.75-1.02-2.75-1.02-.55 1.35-.2 2.39-.1 2.64-.65.71-1.03 1.6-1.03 2.71 0 3.81 2.33 4.67 4.55 4.92-.28.25-.54.69-.63 1.34-.57.24-2.04.69-2.91-.83 0 0-.53-.96-1.53-1.03 0 0-.98-.02-.1.6 0 0 .68.31 1.14 1.47 0 0 .59 1.94 3.36 1.34V21c0 .24 0 .92-.36 1H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/>',
		'github-circle': '<path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>',
		'google-plus-box': '<path d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2M9.07 19.2C6.27 19.2 5 17.64 5 16.18c0-.45.14-1.59 1.5-2.38.75-.47 1.83-.8 3.12-.91-.19-.25-.34-.55-.34-.99 0-.15.02-.31.06-.46h-.39C7 11.44 5.8 9.89 5.8 8.39c0-1.73 1.29-3.59 4.11-3.59h4.22l-.34.34-.71.71-.08.06h-.7c.41.42.9 1.09.9 2.16 0 1.4-.74 2.09-1.56 2.73-.14.12-.42.38-.42.7 0 .32.24.5.39.64.13.11.29.22.47.36.81.55 1.92 1.33 1.92 2.86 0 1.77-1.29 3.84-4.93 3.84M19 12h-2v2h-1v-2h-2v-1h2V9h1v2h2"/><path d="M10.57 13.81c-.11-.01-.19-.01-.32-.01h-.02c-.26 0-1.15.05-1.82.27-.64.24-1.41.72-1.41 1.7C7 16.85 8.04 18 9.96 18c1.54 0 2.44-1 2.44-2 0-.75-.46-1.21-1.83-2.19"/><path d="M11.2 8.87c0-1.02-.63-3.02-2.08-3.02-.62 0-1.32.44-1.32 1.65 0 1.2.62 2.95 1.97 2.95.06 0 1.43-.01 1.43-1.58z"/>',
		'google-plus': '<path d="M13.3 13.45l-1.08-.85c-.36-.3-.82-.69-.82-1.42s.55-1.29.97-1.62c1.31-1.02 2.57-2.1 2.57-4.34 0-2.07-1.27-3.26-2.04-3.92h1.75L15.9.05H9.67c-4.36 0-6.6 2.71-6.6 5.72 0 2.33 1.79 4.83 4.98 4.83h.8c-.13.35-.35.84-.35 1.3 0 1.01.42 1.43.92 2-1.42.1-4.01.43-5.92 1.6-1.86 1.1-2.3 2.63-2.3 3.75 0 2.3 2.06 4.5 6.57 4.5 5.35 0 8.03-2.96 8.03-5.88 0-2.16-1.13-3.27-2.5-4.42M5.65 4.31c0-2.21 1.31-3.21 2.69-3.21 2.66 0 4.01 3.45 4.01 5.53 0 2.57-2.07 3.07-2.89 3.07C7 9.7 5.65 6.64 5.65 4.31M9.3 22.3c-3.33 0-5.45-1.49-5.45-3.7 0-2.2 1.96-2.91 2.65-3.16 1.3-.44 3-.49 3.27-.49.3 0 .46 0 .73.02 2.34 1.69 3.35 2.44 3.35 4.03 0 1.77-1.82 3.3-4.55 3.3"/><path d="M21 10V7h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/>',
		'hangouts': '<path d="M15 11l-1 2h-1.5l1-2H12V8h3m-4 3l-1 2H8.5l1-2H8V8h3m.5-6A8.5 8.5 0 0 0 3 10.5a8.5 8.5 0 0 0 8.5 8.5h.5v3.5c4.86-2.35 8-7.5 8-12C20 5.8 16.19 2 11.5 2z"/>',
		'linkedin-box': '<path d="M19 19h-3v-5.3a1.5 1.5 0 0 0-1.5-1.5 1.5 1.5 0 0 0-1.5 1.5V19h-3v-9h3v1.2c.5-.84 1.59-1.4 2.5-1.4a3.5 3.5 0 0 1 3.5 3.5M6.5 8.31c-1 0-1.81-.81-1.81-1.81A1.81 1.81 0 0 1 6.5 4.69c1 0 1.81.81 1.81 1.81A1.81 1.81 0 0 1 6.5 8.31M8 19H5v-9h3m12-8H4c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4c0-1.11-.9-2-2-2z"/>',
		'linkedin': '<path d="M21 21h-4v-6.75c0-1.06-1.19-1.94-2.25-1.94S13 13.19 13 14.25V21H9V9h4v2c.66-1.07 2.36-1.76 3.5-1.76 2.5 0 4.5 2.04 4.5 4.51V21"/><path d="M7 21H3V9h4v12"/><path d="M5 3a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/>',
		'login': '<path d="M10 17.25V14H3v-4h7V6.75L15.25 12 10 17.25"/><path d="M8 2h9a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-4h2v4h9V4H8v4H6V4a2 2 0 0 1 2-2z"/>',
		'logout': '<path d="M17 17.25V14h-7v-4h7V6.75L22.25 12 17 17.25"/><path d="M13 2a2 2 0 0 1 2 2v4h-2V4H4v16h9v-4h2v4a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9z"/>',
		'office': '<path d="M3 18l4-1.25V7l7-2v14.5L3.5 18.25 14 22l6-1.25V3.5L13.95 2 3 5.75V18z"/>',
		'twitter': '<path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.95 4 2.98-1.46 1.16-3.31 1.84-5.33 1.84-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>',
		'whatsapp': '<path d="M16.75 13.96c.25.13.41.2.46.3.06.11.04.61-.21 1.18-.2.56-1.24 1.1-1.7 1.12-.46.02-.47.36-2.96-.73-2.49-1.09-3.99-3.75-4.11-3.92-.12-.17-.96-1.38-.92-2.61.05-1.22.69-1.8.95-2.04.24-.26.51-.29.68-.26h.47c.15 0 .36-.06.55.45l.69 1.87c.06.13.1.28.01.44l-.27.41-.39.42c-.12.12-.26.25-.12.5.12.26.62 1.09 1.32 1.78.91.88 1.71 1.17 1.95 1.3.24.14.39.12.54-.04l.81-.94c.19-.25.35-.19.58-.11l1.67.88"/><path d="M12 4a8 8 0 0 0-8 8c0 1.72.54 3.31 1.46 4.61L4.5 19.5l2.89-.96C8.69 19.46 10.28 20 12 20a8 8 0 0 0 8-8 8 8 0 0 0-8-8zm0-2a10 10 0 0 1 10 10 10 10 0 0 1-10 10c-1.97 0-3.8-.57-5.35-1.55L2 22l1.55-4.65C2.57 15.8 2 13.97 2 12A10 10 0 0 1 12 2"/>',
		'windows': '<path d="M3 12V6.75l6-1.32v6.48L3 12"/><path d="M20 3v8.75l-10 .15V5.21L20 3"/><path d="M3 13l6 .09v6.81l-6-1.15V13"/><path d="M20 13.25V22l-10-1.91V13.1l10 .15z"/>',
	})

	/*
	 * Google Material Design Icons
	 * (https://www.google.com/design/icons)
	 */
	.addShapes({
		//
		// action
		//
		'3d_rotation': '<path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/><path d="M16.57 12.2c0 .42-.05.79-.14 1.13-.1.33-.24.62-.43.85-.19.23-.43.41-.71.53-.29.12-.62.18-.99.18h-.91V9.12h.97c.72 0 1.27.23 1.64.69.38.46.57 1.12.57 1.99v.4zm.39-3.16c-.32-.33-.7-.59-1.14-.77-.43-.18-.92-.27-1.46-.27H12v8h2.3c.55 0 1.06-.09 1.51-.27.45-.18.84-.43 1.16-.76.32-.33.57-.73.74-1.19.17-.47.26-.99.26-1.57v-.4c0-.58-.09-1.1-.26-1.57-.18-.47-.43-.87-.75-1.2zm-8.55 5.92c-.19 0-.37-.03-.52-.08-.16-.06-.29-.13-.4-.24-.11-.1-.2-.22-.26-.37-.06-.14-.09-.3-.09-.47h-1.3c0 .36.07.68.21.95.14.27.33.5.56.69.24.18.51.32.82.41.3.1.62.15.96.15.37 0 .72-.05 1.03-.15.32-.1.6-.25.83-.44.23-.19.42-.43.55-.72.13-.29.2-.61.2-.97 0-.19-.02-.38-.07-.56-.05-.18-.12-.35-.23-.51-.1-.16-.24-.3-.4-.43-.17-.13-.37-.23-.61-.31.2-.09.37-.2.52-.33.15-.13.27-.27.37-.42.1-.15.17-.3.22-.46.05-.16.07-.32.07-.48 0-.36-.06-.68-.18-.96-.12-.28-.29-.51-.51-.69-.2-.19-.47-.33-.77-.43C9.1 8.05 8.76 8 8.39 8c-.36 0-.69.05-1 .16-.3.11-.57.26-.79.45-.21.19-.38.41-.51.67-.12.26-.18.54-.18.85h1.3c0-.17.03-.32.09-.45s.14-.25.25-.34c.11-.09.23-.17.38-.22.15-.05.3-.08.48-.08.4 0 .7.1.89.31.19.2.29.49.29.86 0 .18-.03.34-.08.49-.05.15-.14.27-.25.37-.11.1-.25.18-.41.24-.16.06-.36.09-.58.09H7.5v1.03h.77c.22 0 .42.02.6.07s.33.13.45.23c.12.11.22.24.29.4.07.16.1.35.1.57 0 .41-.12.72-.35.93-.23.23-.55.33-.95.33z"/><path d="M12 0l-.66.03 3.81 3.81 1.33-1.33c3.27 1.55 5.61 4.72 5.96 8.48h1.5C23.44 4.84 18.29 0 12 0z"/>',
		'accessibility': '<path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/><path d="M21 9h-6v13h-2v-6h-2v6H9V9H3V7h18v2z"/>',
		'accessible': '<circle cx="12" cy="4" r="2"/><path d="M19 13v-2c-1.54.02-3.09-.75-4.07-1.83l-1.29-1.43c-.17-.19-.38-.34-.61-.45-.01 0-.01-.01-.02-.01H13c-.35-.2-.75-.3-1.19-.26C10.76 7.11 10 8.04 10 9.09V15c0 1.1.9 2 2 2h5v5h2v-5.5c0-1.1-.9-2-2-2h-3v-3.45c1.29 1.07 3.25 1.94 5 1.95zm-6.17 5c-.41 1.16-1.52 2-2.83 2-1.66 0-3-1.34-3-3 0-1.31.84-2.41 2-2.83V12.1c-2.28.46-4 2.48-4 4.9 0 2.76 2.24 5 5 5 2.42 0 4.44-1.72 4.9-4h-2.07z"/>',
		'account_balance': '<path d="M4 10v7h3v-7H4z"/><path d="M10 10v7h3v-7h-3z"/><path d="M2 22h19v-3H2v3z"/><path d="M16 10v7h3v-7h-3z"/><path d="M11.5 1L2 6v2h19V6l-9.5-5z"/>',
		'account_balance_wallet': '<path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9z"/><path d="M16 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 16h10V8H12v8z"/>',
		'account_box': '<path d="M3 5v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H5c-1.11 0-2 .9-2 2zm12 4c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3zm-9 8c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1H6v-1z"/>',
		'account_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>',
		'add_shopping_cart': '<path d="M11 9h2V6h3V4h-3V1h-2v3H8v2h3v3z"/><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/><path d="M7.17 14.75l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.86-7.01L19.42 4h-.01l-1.1 2-2.76 5H8.53l-.13-.27L6.16 6l-.95-2-.94-2H1v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.13 0-.25-.11-.25-.25z"/>',
		'alarm': '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
		'alarm_add': '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"/>',
		'alarm_off': '<path d="M12 6c3.87 0 7 3.13 7 7 0 .84-.16 1.65-.43 2.4l1.52 1.52c.58-1.19.91-2.51.91-3.92a9 9 0 0 0-9-9c-1.41 0-2.73.33-3.92.91L9.6 6.43C10.35 6.16 11.16 6 12 6z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M16.47 18.39C15.26 19.39 13.7 20 12 20c-3.87 0-7-3.13-7-7 0-1.7.61-3.26 1.61-4.47l9.86 9.86zM2.92 2.29L1.65 3.57 2.98 4.9l-1.11.93 1.42 1.42 1.11-.94.8.8A8.964 8.964 0 0 0 3 13c0 4.97 4.02 9 9 9 2.25 0 4.31-.83 5.89-2.2l2.2 2.2 1.27-1.27L3.89 3.27l-.97-.98z"/><path d="M8.02 3.28L6.6 1.86l-.86.71 1.42 1.42.86-.71z"/>',
		'alarm_on': '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M10.54 14.53L8.41 12.4l-1.06 1.06 3.18 3.18 6-6-1.06-1.06-4.93 4.95z"/>',
		'all_out': '<path d="M16.21 4.16l4 4v-4z"/><path d="M20.21 16.16l-4 4h4z"/><path d="M8.21 20.16l-4-4v4z"/><path d="M4.21 8.16l4-4h-4z"/><path d="M16.06 16.01a5.438 5.438 0 0 1-7.7 0 5.438 5.438 0 0 1 0-7.7 5.438 5.438 0 0 1 7.7 0 5.438 5.438 0 0 1 0 7.7zm1.1-8.8a7.007 7.007 0 0 0-9.9 0 7.007 7.007 0 0 0 0 9.9 7.007 7.007 0 0 0 9.9 0c2.73-2.73 2.73-7.16 0-9.9z"/>',
		'android': '<path d="M6 18c0 .55.45 1 1 1h1v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h2v3.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5V19h1c.55 0 1-.45 1-1V8H6v10z"/><path d="M3.5 8C2.67 8 2 8.67 2 9.5v7c0 .83.67 1.5 1.5 1.5S5 17.33 5 16.5v-7C5 8.67 4.33 8 3.5 8z"/><path d="M20.5 8c-.83 0-1.5.67-1.5 1.5v7c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-7c0-.83-.67-1.5-1.5-1.5z"/><path d="M15 5h-1V4h1v1zm-5 0H9V4h1v1zm5.53-2.84l1.3-1.3c.2-.2.2-.51 0-.71-.2-.2-.51-.2-.71 0l-1.48 1.48C13.85 1.23 12.95 1 12 1c-.96 0-1.86.23-2.66.63L7.85.15c-.2-.2-.51-.2-.71 0-.2.2-.2.51 0 .71l1.31 1.31C6.97 3.26 6 5.01 6 7h12c0-1.99-.97-3.75-2.47-4.84z"/>',
		'announcement': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>',
		'aspect_ratio': '<path d="M19 12h-2v3h-3v2h5v-5z"/><path d="M7 9h3V7H5v5h2V9z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'assessment': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
		'assignment': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>',
		'assignment_ind': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 4c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V19z"/>',
		'assignment_late': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-6 15h-2v-2h2v2zm0-4h-2V8h2v6zm-1-9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
		'assignment_return': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm4 12h-4v3l-5-5 5-5v3h4v4z"/>',
		'assignment_returned': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm0 15l-5-5h3V9h4v4h3l-5 5z"/>',
		'assignment_turned_in': '<path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
		'autorenew': '<path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6z"/><path d="M18.76 7.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>',
		'backup': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>',
		'book': '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
		'bookmark': '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>',
		'bookmark_outline': '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>',
		'bug_report': '<path d="M20 8h-2.81c-.45-.78-1.07-1.45-1.82-1.96L17 4.41 15.59 3l-2.17 2.17C12.96 5.06 12.49 5 12 5c-.49 0-.96.06-1.41.17L8.41 3 7 4.41l1.62 1.63C7.88 6.55 7.26 7.22 6.81 8H4v2h2.09c-.05.33-.09.66-.09 1v1H4v2h2v1c0 .34.04.67.09 1H4v2h2.81c1.04 1.79 2.97 3 5.19 3s4.15-1.21 5.19-3H20v-2h-2.09c.05-.33.09-.66.09-1v-1h2v-2h-2v-1c0-.34-.04-.67-.09-1H20V8zm-6 8h-4v-2h4v2zm0-4h-4v-2h4v2z"/>',
		'build': '<path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>',
		'cached': '<path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4z"/><path d="M6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/>',
		'camera_enhanced': '<path d="M9 3L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2h-3.17L15 3H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/> <path d="M12 17l1.25-2.75L16 13l-2.75-1.25L12 9l-1.25 2.75L8 13l2.75 1.25z"/>',
		'card_giftcard': '<path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>',
		'card_membership': '<path d="M20 2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h4v5l4-2 4 2v-5h4c1.11 0 2-.89 2-2V4c0-1.11-.89-2-2-2zm0 13H4v-2h16v2zm0-5H4V4h16v6z"/>',
		'card_travel': '<path d="M20 6h-3V4c0-1.11-.89-2-2-2H9c-1.11 0-2 .89-2 2v2H4c-1.11 0-2 .89-2 2v11c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zM9 4h6v2H9V4zm11 15H4v-2h16v2zm0-5H4V8h3v2h2V8h6v2h2V8h3v6z"/>',
		'change_history': '<path d="M12 7.77L18.39 18H5.61L12 7.77M12 4L2 20h20L12 4z"/>',
		'check_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
		'chrome_reader_mode': '<path d="M13 12h7v1.5h-7z"/><path d="M13 9.5h7V11h-7z"/><path d="M13 14.5h7V16h-7z"/><path d="M21 19h-9V6h9v13zm0-15H3c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
		'class': '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/>',
		'code': '<path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4z"/><path d="M14.6 16.6l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>',
		'compare_arrows': '<path d="M9.01 14H2v2h7.01v3L13 15l-3.99-4v3z"/><path d="M14.99 13v-3H22V8h-7.01V5L11 9l3.99 4z"/>',
		'copyright': '<path d="M10.08 10.86c.05-.33.16-.62.3-.87.14-.25.34-.46.59-.62.24-.15.54-.22.91-.23.23.01.44.05.63.13.2.09.38.21.52.36s.25.33.34.53c.09.2.13.42.14.64h1.79c-.02-.47-.11-.9-.28-1.29-.17-.39-.4-.73-.7-1.01-.3-.28-.66-.5-1.08-.66-.42-.16-.88-.23-1.39-.23-.65 0-1.22.11-1.7.34-.48.23-.88.53-1.2.92-.32.39-.56.84-.71 1.36-.15.52-.24 1.06-.24 1.64v.27c0 .58.08 1.12.23 1.64.15.52.39.97.71 1.35.32.38.72.69 1.2.91.48.22 1.05.34 1.7.34.47 0 .91-.08 1.32-.23.41-.15.77-.36 1.08-.63.31-.27.56-.58.74-.94.18-.36.29-.74.3-1.15h-1.79c-.01.21-.06.4-.15.58-.09.18-.21.33-.36.46s-.32.23-.52.3c-.19.07-.39.09-.6.1-.36-.01-.66-.08-.89-.23a1.75 1.75 0 0 1-.59-.62c-.14-.25-.25-.55-.3-.88a6.74 6.74 0 0 1-.08-1v-.27c0-.35.03-.68.08-1.01z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'credit_card': '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
		'dashboard': '<path d="M3 13h8V3H3v10z"/><path d="M3 21h8v-6H3v6z"/><path d="M13 21h8V11h-8v10z"/><path d="M13 3v6h8V3h-8z"/>',
		'date_range': '<path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>',
		'delete': '<path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/><path d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>',
		'delete_forever': '<path d="M8.46 11.88l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12z"/><path d="M15.5 4l-1-1h-5l-1 1H5v2h14V4z"/>',
		'description': '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>',
		'dns': '<path d="M7 19c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm13-6H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/><path d="M7 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm13-6H4c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h16c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"/>',
		'done': '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
		'done_all': '<path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7z"/><path d="M22.24 5.59L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41z"/><path d="M.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z"/>',
		'donut_large': '<path d="M11 5.08V2c-5 .5-9 4.81-9 10s4 9.5 9 10v-3.08c-3-.48-6-3.4-6-6.92s3-6.44 6-6.92z"/><path d="M18.97 11H22c-.47-5-4-8.53-9-9v3.08C16 5.51 18.54 8 18.97 11z"/><path d="M13 18.92V22c5-.47 8.53-4 9-9h-3.03c-.43 3-2.97 5.49-5.97 5.92z"/>',
		'donut_small': '<path d="M11 9.16V2c-5 .5-9 4.79-9 10s4 9.5 9 10v-7.16c-1-.41-2-1.52-2-2.84 0-1.32 1-2.43 2-2.84z"/><path d="M14.86 11H22c-.48-4.75-4-8.53-9-9v7.16c1 .3 1.52.98 1.86 1.84z"/><path d="M13 14.84V22c5-.47 8.52-4.25 9-9h-7.14c-.34.86-.86 1.54-1.86 1.84z"/>',
		'eject': '<path d="M5 17h14v2H5z"/><path d="M12 5L5.33 15h13.34z"/>',
		'euro_symbol': '<path d="M15 18.5c-2.51 0-4.68-1.42-5.76-3.5H15v-2H8.58c-.05-.33-.08-.66-.08-1s.03-.67.08-1H15V9H9.24C10.32 6.92 12.5 5.5 15 5.5c1.61 0 3.09.59 4.23 1.57L21 5.3C19.41 3.87 17.3 3 15 3c-3.92 0-7.24 2.51-8.48 6H3v2h3.06c-.04.33-.06.66-.06 1 0 .34.02.67.06 1H3v2h3.52c1.24 3.49 4.56 6 8.48 6 2.31 0 4.41-.87 6-2.3l-1.78-1.77c-1.13.98-2.6 1.57-4.22 1.57z"/>',
		'event': '<path d="M17 12h-5v5h5v-5z"/><path d="M19 19H5V8h14v11zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z"/>',
		'event_seat': '<path d="M4 18v3h3v-3h10v3h3v-6H4z"/><path d="M19 10h3v3h-3z"/><path d="M2 10h3v3H2z"/><path d="M17 13H7V5c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2v8z"/>',
		'exit_to_app': '<path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59z"/><path d="M19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'explore': '<path d="M12 10.9c-.61 0-1.1.49-1.1 1.1 0 .61.49 1.1 1.1 1.1.61 0 1.1-.49 1.1-1.1 0-.61-.49-1.1-1.1-1.1z"/><path d="M14.19 14.19L6 18l3.81-8.19L18 6l-3.81 8.19zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'extension': '<path d="M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z"/>',
		'face': '<path d="M14.69 17.1c-.74.58-1.7.9-2.69.9s-1.95-.32-2.69-.9c-.22-.17-.53-.13-.7.09-.17.22-.13.53.09.7.91.72 2.09 1.11 3.3 1.11s2.39-.39 3.31-1.1c.22-.17.26-.48.09-.7-.17-.23-.49-.26-.71-.1z"/><path d="M19.96 14.82c-1.09 3.74-4.27 6.46-8.04 6.46-3.78 0-6.96-2.72-8.04-6.47-1.19-.11-2.13-1.18-2.13-2.52 0-1.27.85-2.31 1.97-2.5 2.09-1.46 3.8-3.49 4.09-5.05v-.01c1.35 2.63 6.3 5.19 11.83 5.06l.3-.03c1.28 0 2.31 1.14 2.31 2.54 0 1.38-1.02 2.51-2.29 2.52zM12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12S18.63 0 12 0z"/><path d="M16.5 12.5c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1zm-7 0c0 .552-.448 1-1 1s-1-.448-1-1 .448-1 1-1 1 .448 1 1z"/>',
		'favorite': '<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>',
		'favorite_border': '<path d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"/>',
		'feedback': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
		'find_in_page': '<path d="M20 19.59V8l-6-6H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c.45 0 .85-.15 1.19-.4l-4.43-4.43c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L20 19.59z"/><path d="M9 13c0 1.66 1.34 3 3 3s3-1.34 3-3-1.34-3-3-3-3 1.34-3 3z"/>',
		'find_replace': '<path d="M11 6c1.38 0 2.63.56 3.54 1.46L12 10h6V4l-2.05 2.05C14.68 4.78 12.93 4 11 4c-3.53 0-6.43 2.61-6.92 6H6.1c.46-2.28 2.48-4 4.9-4z"/><path d="M16.64 15.14c.66-.9 1.12-1.97 1.28-3.14H15.9c-.46 2.28-2.48 4-4.9 4-1.38 0-2.63-.56-3.54-1.46L10 12H4v6l2.05-2.05C7.32 17.22 9.07 18 11 18c1.55 0 2.98-.51 4.14-1.36L20 21.49 21.49 20l-4.85-4.86z"/>',
		'fingerprint': '<path d="M17.81 4.47c-.08 0-.16-.02-.23-.06C15.66 3.42 14 3 12.01 3c-1.98 0-3.86.47-5.57 1.41-.24.13-.54.04-.68-.2a.506.506 0 0 1 .2-.68C7.82 2.52 9.86 2 12.01 2c2.13 0 3.99.47 6.03 1.52.25.13.34.43.21.67a.49.49 0 0 1-.44.28z"/><path d="M3.5 9.72a.499.499 0 0 1-.41-.79c.99-1.4 2.25-2.5 3.75-3.27C9.98 4.04 14 4.03 17.15 5.65c1.5.77 2.76 1.86 3.75 3.25a.5.5 0 0 1-.12.7c-.23.16-.54.11-.7-.12a9.388 9.388 0 0 0-3.39-2.94c-2.87-1.47-6.54-1.47-9.4.01-1.36.7-2.5 1.7-3.4 2.96-.08.14-.23.21-.39.21z"/><path d="M9.75 21.79a.47.47 0 0 1-.35-.15c-.87-.87-1.34-1.43-2.01-2.64-.69-1.23-1.05-2.73-1.05-4.34 0-2.97 2.54-5.39 5.66-5.39s5.66 2.42 5.66 5.39c0 .28-.22.5-.5.5s-.5-.22-.5-.5c0-2.42-2.09-4.39-4.66-4.39-2.57 0-4.66 1.97-4.66 4.39 0 1.44.32 2.77.93 3.85.64 1.15 1.08 1.64 1.85 2.42.19.2.19.51 0 .71-.11.1-.24.15-.37.15z"/><path d="M16.92 19.94c-1.19 0-2.24-.3-3.1-.89-1.49-1.01-2.38-2.65-2.38-4.39 0-.28.22-.5.5-.5s.5.22.5.5c0 1.41.72 2.74 1.94 3.56.71.48 1.54.71 2.54.71.24 0 .64-.03 1.04-.1.27-.05.53.13.58.41.05.27-.13.53-.41.58-.57.11-1.07.12-1.21.12z"/><path d="M14.91 22c-.04 0-.09-.01-.13-.02-1.59-.44-2.63-1.03-3.72-2.1a7.297 7.297 0 0 1-2.17-5.22c0-1.62 1.38-2.94 3.08-2.94 1.7 0 3.08 1.32 3.08 2.94 0 1.07.93 1.94 2.08 1.94s2.08-.87 2.08-1.94c0-3.77-3.25-6.83-7.25-6.83-2.84 0-5.44 1.58-6.61 4.03-.39.81-.59 1.76-.59 2.8 0 .78.07 2.01.67 3.61.1.26-.03.55-.29.64-.26.1-.55-.04-.64-.29a11.14 11.14 0 0 1-.73-3.96c0-1.2.23-2.29.68-3.24 1.33-2.79 4.28-4.6 7.51-4.6 4.55 0 8.25 3.51 8.25 7.83 0 1.62-1.38 2.94-3.08 2.94-1.7 0-3.08-1.32-3.08-2.94 0-1.07-.93-1.94-2.08-1.94s-2.08.87-2.08 1.94c0 1.71.66 3.31 1.87 4.51.95.94 1.86 1.46 3.27 1.85.27.07.42.35.35.61-.05.23-.26.38-.47.38z"/>',
		'flight_land': '<path d="M2.5 19h19v2h-19z"/><path d="M9.68 13.27l4.35 1.16 5.31 1.42c.8.21 1.62-.26 1.84-1.06.21-.8-.26-1.62-1.06-1.84l-5.31-1.42-2.76-9.02L10.12 2v8.28L5.15 8.95l-.93-2.32-1.45-.39v5.17l1.6.43 5.31 1.43z"/>',
		'flight_takeoff': '<path d="M2.5 19h19v2h-19z"/><path d="M22.07 9.64c-.21-.8-1.04-1.28-1.84-1.06L14.92 10l-6.9-6.43-1.93.51 4.14 7.17-4.97 1.33-1.97-1.54-1.45.39 1.82 3.16.77 1.33 1.6-.43 5.31-1.42 4.35-1.16L21 11.49c.81-.23 1.28-1.05 1.07-1.85z"/>',
		'flip_to_back': '<path d="M9 7H7v2h2V7z"/><path d="M9 11H7v2h2v-2z"/><path d="M9 3a2 2 0 0 0-2 2h2V3z"/><path d="M13 15h-2v2h2v-2z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M13 3h-2v2h2V3z"/><path d="M9 17v-2H7a2 2 0 0 0 2 2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 17c1.1 0 2-.9 2-2h-2v2z"/><path d="M5 7H3v12a2 2 0 0 0 2 2h12v-2H5V7z"/><path d="M15 5h2V3h-2v2z"/><path d="M15 17h2v-2h-2v2z"/>',
		'flip_to_front': '<path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M5 21v-2H3a2 2 0 0 0 2 2z"/><path d="M3 9h2V7H3v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 15H9V5h10v10zm0-12H9a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/>',
		'g_translate': '<path d="M20 5h-9.12L10 2H4c-1.1 0-2 .9-2 2v13c0 1.1.9 2 2 2h7l1 3h8c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zM7.17 14.59c-2.25 0-4.09-1.83-4.09-4.09s1.83-4.09 4.09-4.09c1.04 0 1.99.37 2.74 1.07l.07.06-1.23 1.18-.06-.05c-.29-.27-.78-.59-1.52-.59-1.31 0-2.38 1.09-2.38 2.42s1.07 2.42 2.38 2.42c1.37 0 1.96-.87 2.12-1.46H7.08V9.91h3.95l.01.07c.04.21.05.4.05.61 0 2.35-1.61 4-3.92 4zm6.03-1.71c.33.6.74 1.18 1.19 1.7l-.54.53-.65-2.23zm.77-.76h-.99l-.31-1.04h3.99s-.34 1.31-1.56 2.74c-.52-.62-.89-1.23-1.13-1.7zM21 20c0 .55-.45 1-1 1h-7l2-2-.81-2.77.92-.92L17.79 18l.73-.73-2.71-2.68c.9-1.03 1.6-2.25 1.92-3.51H19v-1.04h-3.64V9h-1.04v1.04h-1.96L11.18 6H20c.55 0 1 .45 1 1v13z"/>',
		'gavel': '<path d="M1 21h12v2H1z"/><path d="M5.245 8.07l2.83-2.827 14.14 14.142-2.828 2.828z"/><path d="M12.317 1l5.657 5.656-2.83 2.83-5.654-5.66z"/><path d="M3.825 9.485l5.657 5.657-2.828 2.828-5.657-5.657z"/>',
		'get_app': '<path d="M19 9h-4V3H9v6H5l7 7 7-7z"/><path d="M5 18v2h14v-2H5z"/>',
		'gif': '<path d="M11.5 9H13v6h-1.5z"/><path d="M9 9H6c-.6 0-1 .5-1 1v4c0 .5.4 1 1 1h3c.6 0 1-.5 1-1v-2H8.5v1.5h-2v-3H10V10c0-.5-.4-1-1-1z"/><path d="M19 10.5V9h-4.5v6H16v-2h2v-1.5h-2v-1z"/>',
		'grade': '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
		'group_work': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8 17.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM9.5 8c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8zm6.5 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
		'help': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>',
		'help_outline': '<path d="M11 18h2v-2h-2v2z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 6c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"/>',
		'highlight_off': '<path d="M14.59 8L12 10.59 9.41 8 8 9.41 10.59 12 8 14.59 9.41 16 12 13.41 14.59 16 16 14.59 13.41 12 16 9.41 14.59 8z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z"/>',
		'history': '<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
		'home': '<path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
		'hourglass_empty': '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6zm10 14.5V20H8v-3.5l4-4 4 4zm-4-5l-4-4V4h8v3.5l-4 4z"/>',
		'hourglass_full': '<path d="M6 2v6h.01L6 8.01 10 12l-4 4 .01.01H6V22h12v-5.99h-.01L18 16l-4-4 4-3.99-.01-.01H18V2H6z"/>',
		'http': '<path d="M4.5 11h-2V9H1v6h1.5v-2.5h2V15H6V9H4.5v2z"/><path d="M7 10.5h1.5V15H10v-4.5h1.5V9H7v1.5z"/><path d="M12.5 10.5H14V15h1.5v-4.5H17V9h-4.5v1.5z"/><path d="M21.5 11.5h-2v-1h2v1zm0-2.5H18v6h1.5v-2h2c.8 0 1.5-.7 1.5-1.5v-1c0-.8-.7-1.5-1.5-1.5z"/>',
		'https': '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
		'important_devices': '<path d="M23 20h-5v-7h5v7zm0-8.99L18 11c-.55 0-1 .45-1 1v9c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-9c0-.55-.45-.99-1-.99z"/><path d="M20 2H2C.89 2 0 2.89 0 4v12a2 2 0 0 0 2 2h7v2H7v2h8v-2h-2v-2h2v-2H2V4h18v5h2V4a2 2 0 0 0-2-2z"/><path d="M11.97 9L11 6l-.97 3H7l2.47 1.76-.94 2.91 2.47-1.8 2.47 1.8-.94-2.91L15 9h-3.03z"/>',
		'info': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
		'info_outline': '<path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M11 9h2V7h-2v2zm0 8h2v-6h-2v6z"/>',
		'input': '<path d="M21 3.01H3c-1.1 0-2 .9-2 2V9h2V4.99h18v14.03H3V15H1v4.01c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98v-14c0-1.11-.9-2-2-2z"/><path d="M11 16l4-4-4-4v3H1v2h10v3z"/>',
		'invert_colors': '<path d="M17.66 7.93L12 2.27 6.34 7.93c-3.12 3.12-3.12 8.19 0 11.31C7.9 20.8 9.95 21.58 12 21.58c2.05 0 4.1-.78 5.66-2.34 3.12-3.12 3.12-8.19 0-11.31zM12 19.59c-1.6 0-3.11-.62-4.24-1.76C6.62 16.69 6 15.19 6 13.59s.62-3.11 1.76-4.24L12 5.1v14.49z"/>',
		'label': '<path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z"/>',
		'label_outline': '<path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16zM16 17H5V7h11l3.55 5L16 17z"/>',
		'language': '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95c-.32-1.25-.78-2.45-1.38-3.56 1.84.63 3.37 1.91 4.33 3.56zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2 0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56-1.84-.63-3.37-1.9-4.33-3.56zm2.95-8H5.08c.96-1.66 2.49-2.93 4.33-3.56C8.81 5.55 8.35 6.75 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2 0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2 0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95c-.96 1.65-2.49 2.93-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2 0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"/>',
		'launch': '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>',
		'lightbulb_outline': '<path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1z"/><path d="M14.85 13.1l-.85.6V16h-4v-2.3l-.85-.6A4.997 4.997 0 0 1 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1zM12 2C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"/>',
		'line_style': '<path d="M3 16h5v-2H3v2z"/><path d="M9.5 16h5v-2h-5v2z"/><path d="M16 16h5v-2h-5v2z"/><path d="M3 20h2v-2H3v2z"/><path d="M7 20h2v-2H7v2z"/><path d="M11 20h2v-2h-2v2z"/><path d="M15 20h2v-2h-2v2z"/><path d="M19 20h2v-2h-2v2z"/><path d="M3 12h8v-2H3v2z"/><path d="M13 12h8v-2h-8v2z"/><path d="M3 4v4h18V4H3z"/>',
		'line_weight': '<path d="M3 17h18v-2H3v2z"/><path d="M3 20h18v-1H3v1z"/><path d="M3 13h18v-3H3v3z"/><path d="M3 4v4h18V4H3z"/>',
		'list': '<path d="M3 9h2V7H3v2zm0 8h2v-2H3v2zm0-4h2v-2H3v2z"/><path d="M7 13h14v-2H7v2z"/><path d="M7 17h14v-2H7v2z"/><path d="M7 7v2h14V7H7z"/>',
		'lock': '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>',
		'lock_open': '<path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M18 20H6V10h12v10zm0-12h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6h1.9c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>',
		'lock_outline': '<path d="M18 20H6V10h12zM12 2.9c1.71 0 3.1 1.39 3.1 3.1v2H9V6l-.002-.008C8.998 4.282 10.29 2.9 12 2.9zM18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/><path d="M12 17c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>',
		'loyalty': '<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7zm11.77 8.27L13 19.54l-4.27-4.27C8.28 14.81 8 14.19 8 13.5c0-1.38 1.12-2.5 2.5-2.5.69 0 1.32.28 1.77.74l.73.72.73-.73c.45-.45 1.08-.73 1.77-.73 1.38 0 2.5 1.12 2.5 2.5 0 .69-.28 1.32-.73 1.77z"/>',
		'markunread_mailbox': '<path d="M20 6H10v6H8V4h6V0H6v6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"/>',
		'motorcycle': '<path d="M19.44 9.03L15.41 5H11v2h3.59l2 2H5c-2.8 0-5 2.2-5 5s2.2 5 5 5c2.46 0 4.45-1.69 4.9-4h1.65l2.77-2.77c-.21.54-.32 1.14-.32 1.77 0 2.8 2.2 5 5 5s5-2.2 5-5c0-2.65-1.97-4.77-4.56-4.97zM7.82 15C7.4 16.15 6.28 17 5 17c-1.63 0-3-1.37-3-3s1.37-3 3-3c1.28 0 2.4.85 2.82 2H5v2h2.82zM19 17c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>',
		'note_add': '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z"/>',
		'offline_pin': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm5 16H7v-2h10v2zm-6.7-4L7 10.7l1.4-1.4 1.9 1.9 5.3-5.3L17 7.3 10.3 14z"/>',
		'opacity': '<path d="M17.66 8L12 2.35 6.34 8C4.78 9.56 4 11.64 4 13.64s.78 4.11 2.34 5.67 3.61 2.35 5.66 2.35 4.1-.79 5.66-2.35S20 15.64 20 13.64 19.22 9.56 17.66 8zM6 14c.01-2 .62-3.27 1.76-4.4L12 5.27l4.24 4.38C17.38 10.77 17.99 12 18 14H6z"/>',
		'open_in_browser': '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h4v-2H5V8h14v10h-4v2h4c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2z"/><path d="M12 10l-4 4h3v6h2v-6h3l-4-4z"/>',
		'open_in_new': '<path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>',
		'open_with': '<path d="M10 9h4V6h3l-5-5-5 5h3v3z"/><path d="M9 10H6V7l-5 5 5 5v-3h3v-4z"/><path d="M23 12l-5-5v3h-3v4h3v3l5-5z"/><path d="M14 15h-4v3H7l5 5 5-5h-3v-3z"/>',
		'pageview': '<path d="M11 8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/><path d="M17.59 19l-3.83-3.83c-.8.52-1.74.83-2.76.83-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5c0 1.02-.31 1.96-.83 2.75L19 17.59 17.59 19zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'pan_tool': '<path d="M23 5.5V20c0 2.2-1.8 4-4 4h-7.3c-1.08 0-2.1-.43-2.85-1.19L1 14.83s1.26-1.23 1.3-1.25c.22-.19.49-.29.79-.29.22 0 .42.06.6.16.04.01 4.31 2.46 4.31 2.46V4c0-.83.67-1.5 1.5-1.5S11 3.17 11 4v7h1V1.5c0-.83.67-1.5 1.5-1.5S15 .67 15 1.5V11h1V2.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V11h1V5.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5z"/>',
		'payment': '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>',
		'perm_camera_mic': '<path d="M20 5h-3.17L15 3H9L7.17 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v-2.09c-2.83-.48-5-2.94-5-5.91h2c0 2.21 1.79 4 4 4s4-1.79 4-4h2c0 2.97-2.17 5.43-5 5.91V21h7c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-6 8c0 1.1-.9 2-2 2s-2-.9-2-2V9c0-1.1.9-2 2-2s2 .9 2 2v4z"/>',
		'perm_contact_calendar': '<path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1z"/>',
		'perm_data_setting': '<path d="M18.99 11.5c.34 0 .67.03 1 .07L20 0 0 20h11.56c-.04-.33-.07-.66-.07-1 0-4.14 3.36-7.5 7.5-7.5z"/><path d="M18.99 20.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm3.71-1.01c.02-.16.04-.32.04-.49 0-.17-.01-.33-.04-.49l1.06-.83c.09-.08.12-.21.06-.32l-1-1.73c-.06-.11-.19-.15-.31-.11l-1.24.5c-.26-.2-.54-.37-.85-.49l-.19-1.32c-.01-.12-.12-.21-.24-.21h-2c-.12 0-.23.09-.25.21l-.19 1.32c-.3.13-.59.29-.85.49l-1.24-.5c-.11-.04-.24 0-.31.11l-1 1.73c-.06.11-.04.24.06.32l1.06.83c-.02.16-.03.32-.03.49 0 .17.01.33.03.49l-1.06.83c-.09.08-.12.21-.06.32l1 1.73c.06.11.19.15.31.11l1.24-.5c.26.2.54.37.85.49l.19 1.32c.02.12.12.21.25.21h2c.12 0 .23-.09.25-.21l.19-1.32c.3-.13.59-.29.84-.49l1.25.5c.11.04.24 0 .31-.11l1-1.73c.06-.11.03-.24-.06-.32l-1.07-.83z"/>',
		'perm_device_information': '<path d="M13 11h-2v6h2v-6zm0-4h-2v2h2V7z"/><path d="M17 19H7V5h10v14zm0-17.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
		'perm_identity': '<path d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.9c1.16 0 2.1.94 2.1 2.1 0 1.16-.94 2.1-2.1 2.1-1.16 0-2.1-.94-2.1-2.1 0-1.16.94-2.1 2.1-2.1"/><path d="M12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1"/>',
		'perm_media': '<path d="M2 6H0v5h.01L0 20c0 1.1.9 2 2 2h18v-2H2V6z"/><path d="M7 15l4.5-6 3.5 4.51 2.5-3.01L21 15H7zM22 4h-8l-2-2H6c-1.1 0-1.99.9-1.99 2L4 16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
		'perm_phone_msg': '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M12 3v10l3-3h6V3h-9z"/>',
		'perm_scan_wifi': '<path d="M12 3C6.95 3 3.15 4.85 0 7.23L12 22 24 7.25C20.85 4.87 17.05 3 12 3zm1 13h-2v-6h2v6zm-2-8V6h2v2h-2z"/>',
		'pets': '<circle cx="4.5" cy="9.5" r="2.5"/> <circle cx="9" cy="5.5" r="2.5"/> <circle cx="15" cy="5.5" r="2.5"/> <circle cx="19.5" cy="9.5" r="2.5"/> <path d="M17.34 14.86c-.87-1.02-1.6-1.89-2.48-2.91-.46-.54-1.05-1.08-1.75-1.32-.11-.04-.22-.07-.33-.09-.25-.04-.52-.04-.78-.04s-.53 0-.79.05c-.11.02-.22.05-.33.09-.7.24-1.28.78-1.75 1.32-.87 1.02-1.6 1.89-2.48 2.91-1.31 1.31-2.92 2.76-2.62 4.79.29 1.02 1.02 2.03 2.33 2.32.73.15 3.06-.44 5.54-.44h.18c2.48 0 4.81.58 5.54.44 1.31-.29 2.04-1.31 2.33-2.32.31-2.04-1.3-3.49-2.61-4.8z"/>',
		'picture_in_picture': '<path d="M19 7h-8v6h8V7z"/><path d="M21 19.01H3V4.98h18v14.03zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 1.98 2 1.98h18c1.1 0 2-.88 2-1.98V5c0-1.1-.9-2-2-2z"/>',
		'picture_in_picture_alt': '<path d="M19 11h-8v6h8v-6z"/><path d="M21 19.02H3V4.97h18v14.05zm2-.02V4.98C23 3.88 22.1 3 21 3H3c-1.1 0-2 .88-2 1.98V19c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2z"/>',
		'play_for_work': '<path d="M11 5v5.59H7.5l4.5 4.5 4.5-4.5H13V5h-2z"/><path d="M6 14c0 3.31 2.69 6 6 6s6-2.69 6-6h-2c0 2.21-1.79 4-4 4s-4-1.79-4-4H6z"/>',
		'polymer': '<path d="M19 4h-4L7.11 16.63 4.5 12 9 4H5L.5 12 5 20h4l7.89-12.63L19.5 12 15 20h4l4.5-8z"/>',
		'power_settings_new': '<path d="M13 3h-2v10h2V3z"/><path d="M17.83 5.17l-1.42 1.42A6.92 6.92 0 0 1 19 12c0 3.87-3.13 7-7 7A6.995 6.995 0 0 1 7.58 6.58L6.17 5.17A8.932 8.932 0 0 0 3 12a9 9 0 0 0 18 0c0-2.74-1.23-5.18-3.17-6.83z"/>',
		'pregnant_woman': '<path d="M9 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm7 9c-.01-1.34-.83-2.51-2-3 0-1.66-1.34-3-3-3s-3 1.34-3 3v7h2v5h3v-5h3v-4z"/>',
		'print': '<path d="M19 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3 7H8v-5h8v5zm3-11H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3z"/><path d="M18 3H6v4h12V3z"/>',
		'query_builder': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
		'question_answer': '<path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/><path d="M17 12V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>',
		'receipt': '<path d="M18 17H6v-2h12v2zm0-4H6v-2h12v2zm0-4H6V7h12v2zM3 22l1.5-1.5L6 22l1.5-1.5L9 22l1.5-1.5L12 22l1.5-1.5L15 22l1.5-1.5L18 22l1.5-1.5L21 22V2l-1.5 1.5L18 2l-1.5 1.5L15 2l-1.5 1.5L12 2l-1.5 1.5L9 2 7.5 3.5 6 2 4.5 3.5 3 2v20z"/>',
		'record_voice_over': '<circle cx="9" cy="9" r="4"/><path d="M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm7.76-9.64l-1.68 1.69c.84 1.18.84 2.71 0 3.89l1.68 1.69c2.02-2.02 2.02-5.07 0-7.27zM20.07 2l-1.63 1.63c2.77 3.02 2.77 7.56 0 10.74L20.07 16c3.9-3.89 3.91-9.95 0-14z"/>',
		'redeem': '<path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z"/>',
		'remove_shopping_cart': '<path d="M7.42 15c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h2.36l2 2H7.42zm15.31 7.73L2.77 2.77 2 2l-.73-.73L0 2.54l4.39 4.39 2.21 4.66-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h7.46l1.38 1.38A1.997 1.997 0 0 0 17 22c.67 0 1.26-.33 1.62-.84L21.46 24l1.27-1.27z"/><path d="M15.55 13c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H6.54l9.01 9z"/><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/>',
		'reorder': '<path d="M3 15h18v-2H3v2z"/><path d="M3 19h18v-2H3v2z"/><path d="M3 11h18V9H3v2z"/><path d="M3 5v2h18V5H3z"/>',
		'report_problem': '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
		'restore': '<path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M12 8v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"/>',
		'restore_page': '<path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm-2 16c-2.05 0-3.81-1.24-4.58-3h1.71c.63.9 1.68 1.5 2.87 1.5 1.93 0 3.5-1.57 3.5-3.5S13.93 9.5 12 9.5c-1.35 0-2.52.78-3.1 1.9l1.6 1.6h-4V9l1.3 1.3C8.69 8.92 10.23 8 12 8c2.76 0 5 2.24 5 5s-2.24 5-5 5z"/>',
		'room': '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
		'rounded_corner': '<path d="M19 19h2v2h-2v-2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M21 8c0-2.76-2.24-5-5-5h-5v2h5c1.65 0 3 1.35 3 3v5h2V8z"/>',
		'rowing': '<path d="M8.5 14.5L4 19l1.5 1.5L9 17h2l-2.5-2.5z"/><path d="M15 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M21 21.01L18 24l-2.99-3.01V19.5l-7.1-7.09c-.31.05-.61.07-.91.07v-2.16c1.66.03 3.61-.87 4.67-2.04l1.4-1.55c.19-.21.43-.38.69-.5.29-.14.62-.23.96-.23h.03C15.99 6.01 17 7.02 17 8.26v5.75c0 .84-.35 1.61-.92 2.16l-3.58-3.58v-2.27c-.63.52-1.43 1.02-2.29 1.39L16.5 18H18l3 3.01z"/>',
		'schedule': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
		'search': '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>',
		'settings': '<path d="M19.43 12.98c.04-.32.07-.64.07-.98s-.03-.66-.07-.98l2.11-1.65c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.4-1.08-.73-1.69-.98l-.38-2.65C14.46 2.18 14.25 2 14 2h-4c-.25 0-.46.18-.49.42l-.38 2.65c-.61.25-1.17.59-1.69.98l-2.49-1c-.23-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64l2.11 1.65c-.04.32-.07.65-.07.98s.03.66.07.98l-2.11 1.65c-.19.15-.24.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1c.52.4 1.08.73 1.69.98l.38 2.65c.03.24.24.42.49.42h4c.25 0 .46-.18.49-.42l.38-2.65c.61-.25 1.17-.59 1.69-.98l2.49 1c.23.09.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.65zM12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5z"/>',
		'settings_applications': '<path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M17.25 12c0 .23-.02.46-.05.68l1.48 1.16c.13.11.17.3.08.45l-1.4 2.42c-.09.15-.27.21-.43.15l-1.74-.7c-.36.28-.76.51-1.18.69l-.26 1.85c-.03.17-.18.3-.35.3h-2.8c-.17 0-.32-.13-.35-.29l-.26-1.85c-.43-.18-.82-.41-1.18-.69l-1.74.7c-.16.06-.34 0-.43-.15l-1.4-2.42c-.09-.15-.05-.34.08-.45l1.48-1.16c-.03-.23-.05-.46-.05-.69 0-.23.02-.46.05-.68l-1.48-1.16c-.13-.11-.17-.3-.08-.45l1.4-2.42c.09-.15.27-.21.43-.15l1.74.7c.36-.28.76-.51 1.18-.69l.26-1.85c.03-.17.18-.3.35-.3h2.8c.17 0 .32.13.35.29l.26 1.85c.43.18.82.41 1.18.69l1.74-.7c.16-.06.34 0 .43.15l1.4 2.42c.09.15.05.34-.08.45l-1.48 1.16c.03.23.05.46.05.69zM19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2z"/>',
		'settings_backup_restore': '<path d="M14 12c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2z"/><path d="M12 3c-4.97 0-9 4.03-9 9H0l4 4 4-4H5c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.51 0-2.91-.49-4.06-1.3l-1.42 1.44C8.04 20.3 9.94 21 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
		'settings_bluetooth': '<path d="M15 24h2v-2h-2v2zm-8 0h2v-2H7v2zm4 0h2v-2h-2v2z"/><path d="M14.88 14.29L13 16.17v-3.76l1.88 1.88zM13 3.83l1.88 1.88L13 7.59V3.83zm4.71 1.88L12 0h-1v7.59L6.41 3 5 4.41 10.59 10 5 15.59 6.41 17 11 12.41V20h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
		'settings_brightness': '<path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M12 9c1.66 0 3 1.34 3 3s-1.34 3-3 3V9zm-4 7h2.5l1.5 1.5 1.5-1.5H16v-2.5l1.5-1.5-1.5-1.5V8h-2.5L12 6.5 10.5 8H8v2.5L6.5 12 8 13.5V16z"/>',
		'settings_cell': '<path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/><path d="M16 16H8V4h8v12zM16 .01L8 0C6.9 0 6 .9 6 2v16c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V2c0-1.1-.9-1.99-2-1.99z"/>',
		'settings_ethernet': '<path d="M7.77 6.76L6.23 5.48.82 12l5.41 6.52 1.54-1.28L3.42 12l4.35-5.24z"/><path d="M11 13h2v-2h-2v2zm6-2h-2v2h2v-2zM7 13h2v-2H7v2z"/><path d="M17.77 5.48l-1.54 1.28L20.58 12l-4.35 5.24 1.54 1.28L23.18 12l-5.41-6.52z"/>',
		'settings_input_antenna': '<path d="M12 5c-3.87 0-7 3.13-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M13 14.29c.88-.39 1.5-1.26 1.5-2.29 0-1.38-1.12-2.5-2.5-2.5S9.5 10.62 9.5 12c0 1.02.62 1.9 1.5 2.29v3.3L7.59 21 9 22.41l3-3 3 3L16.41 21 13 17.59v-3.3z"/><path d="M12 1C5.93 1 1 5.93 1 12h2c0-4.97 4.03-9 9-9s9 4.03 9 9h2c0-6.07-4.93-11-11-11z"/>',
		'settings_input_component': '<path d="M1 16c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2z"/><path d="M13 2c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zM9 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2z"/><path d="M17 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2zm4-10V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2z"/>',
		'settings_input_composite': '<path d="M1 16c0 1.3.84 2.4 2 2.82V23h2v-4.18C6.16 18.4 7 17.3 7 16v-2H1v2zM5 2c0-.55-.45-1-1-1s-1 .45-1 1v4H1v6h6V6H5V2z"/><path d="M13 2c0-.55-.45-1-1-1s-1 .45-1 1v4H9v6h6V6h-2V2zM9 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2H9v2z"/><path d="M17 16c0 1.3.84 2.4 2 2.82V23h2v-4.18c1.16-.41 2-1.51 2-2.82v-2h-6v2zm4-10V2c0-.55-.45-1-1-1s-1 .45-1 1v4h-2v6h6V6h-2z"/>',
		'settings_input_hdmi': '<path d="M18 7V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v3H5v6l3 6v3h8v-3l3-6V7h-1zM8 4h8v3h-2V5h-1v2h-2V5h-1v2H8V4z"/>',
		'settings_input_svideo': '<path d="M15 6.5c0-.83-.67-1.5-1.5-1.5h-3C9.67 5 9 5.67 9 6.5S9.67 8 10.5 8h3c.83 0 1.5-.67 1.5-1.5z"/><path d="M8.5 15c-.83 0-1.5.67-1.5 1.5S7.67 18 8.5 18s1.5-.67 1.5-1.5S9.33 15 8.5 15zM8 11.5c0-.83-.67-1.5-1.5-1.5S5 10.67 5 11.5 5.67 13 6.5 13 8 12.33 8 11.5z"/><path d="M12 21c-4.96 0-9-4.04-9-9s4.04-9 9-9 9 4.04 9 9-4.04 9-9 9zm0-20C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1z"/><path d="M15.5 15c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm2-5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>',
		'settings_overscan': '<path d="M14 16h-4l2.01 2.5L14 16zm-8-6l-2.5 2.01L6 14v-4zm12 0v4l2.5-1.99L18 10zm-5.99-4.5L10 8h4l-1.99-2.5z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'settings_phone': '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.58l2.2-2.21c.28-.27.36-.66.25-1.01C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 9v2h2V9h-2zm-2 0h-2v2h2V9zm-4 0h-2v2h2V9z"/>',
		'settings_power': '<path d="M13 2h-2v10h2V2z"/><path d="M16.56 4.44l-1.45 1.45C16.84 6.94 18 8.83 18 11c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 4.44C5.36 5.88 4 8.28 4 11c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56z"/><path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/>',
		'settings_remote': '<path d="M12 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-6H9c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V10c0-.55-.45-1-1-1z"/><path d="M7.05 6.05l1.41 1.41C9.37 6.56 10.62 6 12 6s2.63.56 3.54 1.46l1.41-1.41C15.68 4.78 13.93 4 12 4c-1.93 0-3.68.78-4.95 2.05z"/><path d="M12 0C8.96 0 6.21 1.23 4.22 3.22l1.41 1.41C7.26 3.01 9.51 2 12 2s4.74 1.01 6.36 2.64l1.41-1.41C17.79 1.23 15.04 0 12 0z"/>',
		'settings_voice': '<path d="M12 13c1.66 0 2.99-1.34 2.99-3L15 4c0-1.66-1.34-3-3-3S9 2.34 9 4v6c0 1.66 1.34 3 3 3z"/><path d="M15 24h2v-2h-2v2zm-4 0h2v-2h-2v2zm-4 0h2v-2H7v2z"/><path d="M19 10h-1.7c0 3-2.54 5.1-5.3 5.1S6.7 13 6.7 10H5c0 3.41 2.72 6.23 6 6.72V20h2v-3.28c3.28-.49 6-3.31 6-6.72z"/>',
		'shop': '<path d="M16 6V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H2v13c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6h-6zm-6-2h4v2h-4V4zM9 18V9l7.5 4L9 18z"/>',
		'shop_two': '<path d="M3 9H1v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2H3V9z"/><path d="M12 15V8l5.5 3-5.5 4zm0-12h4v2h-4V3zm6 2V3c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H5v11c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2V5h-5z"/>',
		'shopping_basket': '<path d="M17.21 9l-4.38-6.56c-.19-.28-.51-.42-.83-.42-.32 0-.64.14-.83.43L6.79 9H2c-.55 0-1 .45-1 1 0 .09.01.18.04.27l2.54 9.27c.23.84 1 1.46 1.92 1.46h13c.92 0 1.69-.62 1.93-1.46l2.54-9.27L23 10c0-.55-.45-1-1-1h-4.79zM9 9l3-4.4L15 9H9zm3 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
		'shopping_cart': '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
		'speaker_notes': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 14H6v-2h2v2zm0-3H6V9h2v2zm0-3H6V6h2v2zm7 6h-5v-2h5v2zm3-3h-8V9h8v2zm0-3h-8V6h8v2z"/>',
		'speaker_notes_off': '<path d="M6 11V9l2 2H6zm2 3H6v-2h2v2zm2.54-3l-.54-.54L7.54 8 6 6.46 2.38 2.84 1.27 1.73 0 3l2.01 2.01L2 22l4-4h9l5.73 5.73L22 22.46 17.54 18l-7-7z"/><path d="M20 2H4.08L10 7.92V6h8v2h-7.92l1 1H18v2h-4.92l6.99 6.99C21.14 17.95 22 17.08 22 16V4c0-1.1-.9-2-2-2z"/>',
		'spellcheck': '<path d="M6.43 11L8.5 5.48 10.57 11H6.43zm6.02 5h2.09L9.43 3H7.57L2.46 16h2.09l1.12-3h5.64l1.14 3z"/><path d="M21.59 11.59l-8.09 8.09L9.83 16l-1.41 1.41 5.09 5.09L23 13l-1.41-1.41z"/>',
		'star_rate': '<path d="M12 14.3l3.71 2.7-1.42-4.36L18 10h-4.55L12 5.5 10.55 10H6l3.71 2.64L8.29 17z"/>',
		'stars': '<path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm4.24 16L12 15.45 7.77 18l1.12-4.81-3.73-3.23 4.92-.42L12 5l1.92 4.53 4.92.42-3.73 3.23L16.23 18z"/>',
		'store': '<path d="M20 4H4v2h16V4z"/><path d="M12 18H6v-4h6v4zm9-4v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1z"/>',
		'subject': '<path d="M14 17H4v2h10v-2z"/><path d="M20 9H4v2h16V9z"/><path d="M4 15h16v-2H4v2z"/><path d="M4 5v2h16V5H4z"/>',
		'supervisor_account': '<path d="M16.5 12c1.38 0 2.49-1.12 2.49-2.5S17.88 7 16.5 7C15.12 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5z"/><path d="M9 11c1.66 0 2.99-1.34 2.99-3S10.66 5 9 5C7.34 5 6 6.34 6 8s1.34 3 3 3z"/><path d="M16.5 14c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75z"/><path d="M9 13c-2.33 0-7 1.17-7 3.5V19h7v-2.25c0-.85.33-2.34 2.37-3.47C10.5 13.1 9.66 13 9 13z"/>',
		'swap_horiz': '<path d="M6.99 11L3 15l3.99 4v-3H14v-2H6.99v-3z"/><path d="M21 9l-3.99-4v3H10v2h7.01v3L21 9z"/>',
		'swap_vert': '<path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/><path d="M9 3L5 6.99h3V14h2V6.99h3L9 3z"/>',
		'swap_vertial_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM6.5 9L10 5.5 13.5 9H11v4H9V9H6.5zm11 6L14 18.5 10.5 15H13v-4h2v4h2.5z"/>',
		'system_update_alt': '<path d="M12 16.5l4-4h-3v-9h-2v9H8l4 4z"/><path d="M21 3.5h-6v1.99h6v14.03H3V5.49h6V3.5H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-14c0-1.1-.9-2-2-2z"/>',
		'tab': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h10v4h8v10z"/>',
		'tab_unselected': '<path d="M1 9h2V7H1v2z"/><path d="M1 13h2v-2H1v2z"/><path d="M1 5h2V3c-1.1 0-2 .9-2 2z"/><path d="M9 21h2v-2H9v2z"/><path d="M1 17h2v-2H1v2z"/><path d="M3 21v-2H1c0 1.1.9 2 2 2z"/><path d="M21 3h-8v6h10V5c0-1.1-.9-2-2-2z"/><path d="M21 17h2v-2h-2v2z"/><path d="M9 5h2V3H9v2z"/><path d="M5 21h2v-2H5v2z"/><path d="M5 5h2V3H5v2z"/><path d="M21 21c1.1 0 2-.9 2-2h-2v2z"/><path d="M21 13h2v-2h-2v2z"/><path d="M13 21h2v-2h-2v2z"/><path d="M17 21h2v-2h-2v2z"/>',
		'theaters': '<path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>',
		'thumb_down': '<path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2z"/><path d="M19 3v12h4V3h-4z"/>',
		'thumb_up': '<path d="M1 21h4V9H1v12z"/><path d="M23 10c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z"/>',
		'thumbs_up_down': '<path d="M12 6c0-.55-.45-1-1-1H5.82l.66-3.18.02-.23c0-.31-.13-.59-.33-.8L5.38 0 .44 4.94C.17 5.21 0 5.59 0 6v6.5c0 .83.67 1.5 1.5 1.5h6.75c.62 0 1.15-.38 1.38-.91l2.26-5.29c.07-.17.11-.36.11-.55V6z"/><path d="M22.5 10h-6.75c-.62 0-1.15.38-1.38.91l-2.26 5.29c-.07.17-.11.36-.11.55V18c0 .55.45 1 1 1h5.18l-.66 3.18-.02.24c0 .31.13.59.33.8l.79.78 4.94-4.94c.27-.27.44-.65.44-1.06v-6.5c0-.83-.67-1.5-1.5-1.5z"/>',
		'timeline': '<path d="M23 8c0 1.1-.9 2-2 2-.18 0-.35-.02-.51-.07l-3.56 3.55c.05.16.07.34.07.52 0 1.1-.9 2-2 2s-2-.9-2-2c0-.18.02-.36.07-.52l-2.55-2.55c-.16.05-.34.07-.52.07s-.36-.02-.52-.07l-4.55 4.56c.05.16.07.33.07.51 0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2c.18 0 .35.02.51.07l4.56-4.55C8.02 9.36 8 9.18 8 9c0-1.1.9-2 2-2s2 .9 2 2c0 .18-.02.36-.07.52l2.55 2.55c.16-.05.34-.07.52-.07s.36.02.52.07l3.55-3.56C19.02 8.35 19 8.18 19 8c0-1.1.9-2 2-2s2 .9 2 2z"/>',
		'toc': '<path d="M3 9h14V7H3v2z"/><path d="M3 13h14v-2H3v2z"/><path d="M3 17h14v-2H3v2z"/><path d="M19 13h2v-2h-2v2zm0-6v2h2V7h-2zm0 10h2v-2h-2v2z"/>',
		'today': '<path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M7 10h5v5H7z"/>',
		'toll': '<path d="M3 12c0-2.61 1.67-4.83 4-5.65V4.26C3.55 5.15 1 8.27 1 12s2.55 6.85 6 7.74v-2.09c-2.33-.82-4-3.04-4-5.65z"/>',
		'touch_app': '<path d="M9 11.24V7.5a2.5 2.5 0 0 1 5 0v3.74c1.21-.81 2-2.18 2-3.74C16 5.01 13.99 3 11.5 3S7 5.01 7 7.5c0 1.56.79 2.93 2 3.74z"/><path d="M18.84 15.87l-4.54-2.26c-.17-.07-.35-.11-.54-.11H13v-6c0-.83-.67-1.5-1.5-1.5S10 6.67 10 7.5v10.74l-3.43-.72c-.08-.01-.15-.03-.24-.03-.31 0-.59.13-.79.33l-.79.8 4.94 4.94c.27.27.65.44 1.06.44h6.79c.75 0 1.33-.55 1.44-1.28l.75-5.27c.01-.07.02-.14.02-.2 0-.62-.38-1.16-.91-1.38z"/>',
		'track_changes': '<path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-4.08 3.05-7.44 7-7.93v2.02C8.16 6.57 6 9.03 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-1.66-.67-3.16-1.76-4.24l-1.41 1.41C15.55 9.9 16 10.9 16 12c0 2.21-1.79 4-4 4s-4-1.79-4-4c0-1.86 1.28-3.41 3-3.86v2.14c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V2h-1C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07z"/>',
		'translate': '<path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04z"/><path d="M15.88 17l1.62-4.33L19.12 17h-3.24zm2.62-7h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12z"/>',
		'trending_down': '<path d="M16 18l2.29-2.29-4.88-4.88-4 4L2 7.41 3.41 6l6 6 4-4 6.3 6.29L22 12v6z"/>',
		'trending_flat': '<path d="M22 12l-4-4v3H3v2h15v3z"/>',
		'trending_up': '<path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>',
		'turned_in': '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2z"/>',
		'turned_in_not': '<path d="M17 3H7c-1.1 0-1.99.9-1.99 2L5 21l7-3 7 3V5c0-1.1-.9-2-2-2zm0 15l-5-2.18L7 18V5h10v13z"/>',
		'update': '<path d="M21 10.12h-6.78l2.74-2.82c-2.73-2.7-7.15-2.8-9.88-.1a6.875 6.875 0 0 0 0 9.79 7.02 7.02 0 0 0 9.88 0C18.32 15.65 19 14.08 19 12.1h2c0 1.98-.88 4.55-2.64 6.29-3.51 3.48-9.21 3.48-12.72 0-3.5-3.47-3.53-9.11-.02-12.58a8.987 8.987 0 0 1 12.65 0L21 3v7.12z"/><path d="M12.5 8v4.25l3.5 2.08-.72 1.21L11 13V8h1.5z"/>',
		'verified_user': '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>',
		'view_agenda': '<path d="M20 13H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1v-6c0-.55-.45-1-1-1z"/><path d="M20 3H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1z"/>',
		'view_array': '<path d="M4 18h3V5H4v13z"/><path d="M18 5v13h3V5h-3z"/><path d="M8 18h9V5H8v13z"/>',
		'view_carousel': '<path d="M7 19h10V4H7v15z"/><path d="M2 17h4V6H2v11z"/><path d="M18 6v11h4V6h-4z"/>',
		'view_column': '<path d="M10 18h5V5h-5v13z"/><path d="M4 18h5V5H4v13z"/><path d="M16 5v13h5V5h-5z"/>',
		'view_day': '<path d="M2 21h19v-3H2v3z"/><path d="M20 8H3c-.55 0-1 .45-1 1v6c0 .55.45 1 1 1h17c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/><path d="M2 3v3h19V3H2z"/>',
		'view_headline': '<path d="M4 15h17v-2H4v2z"/><path d="M4 19h17v-2H4v2z"/><path d="M4 11h17V9H4v2z"/><path d="M4 5v2h17V5H4z"/>',
		'view_list': '<path d="M4 14h4v-4H4v4z"/><path d="M4 19h4v-4H4v4z"/><path d="M4 9h4V5H4v4z"/><path d="M9 14h12v-4H9v4z"/><path d="M9 19h12v-4H9v4z"/><path d="M9 5v4h12V5H9z"/>',
		'view_module': '<path d="M4 11h5V5H4v6z"/><path d="M4 18h5v-6H4v6z"/><path d="M10 18h5v-6h-5v6z"/><path d="M16 18h5v-6h-5v6z"/><path d="M10 11h5V5h-5v6z"/><path d="M16 5v6h5V5h-5z"/>',
		'view_quilt': '<path d="M10 18h5v-6h-5v6z"/><path d="M4 18h5V5H4v13z"/><path d="M16 18h5v-6h-5v6z"/><path d="M10 5v6h11V5H10z"/>',
		'view_stream': '<path d="M4 18h17v-6H4v6z"/><path d="M4 5v6h17V5H4z"/>',
		'view_week': '<path d="M6 5H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/><path d="M20 5h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/><path d="M13 5h-3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h3c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
		'visibility': '<path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
		'visibility_off': '<path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7z"/><path d="M7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zM2 4.27l2.28 2.28.46.46A11.804 11.804 0 0 0 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27z"/><path d="M11.84 9.02l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>',
		'watch_later': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>',
		'work': '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
		'youtube_searched_for': '<path d="M17.01 14h-.8l-.27-.27c.98-1.14 1.57-2.61 1.57-4.23 0-3.59-2.91-6.5-6.5-6.5s-6.5 3-6.5 6.5H2l3.84 4 4.16-4H6.51C6.51 7 8.53 5 11.01 5s4.5 2.01 4.5 4.5c0 2.48-2.02 4.5-4.5 4.5-.65 0-1.26-.14-1.82-.38L7.71 15.1c.97.57 2.09.9 3.3.9 1.61 0 3.08-.59 4.22-1.57l.27.27v.79l5.01 4.99L22 19l-4.99-5z"/>',
		'zoom_in': '<path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M12 10h-2v2H9v-2H7V9h2V7h1v2h2v1z"/>',
		'zoom_out': '<path d="M9.5 14C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zm6 0h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5z"/><path d="M7 9h5v1H7z"/>',
		//
		// alert
		//
		'add_alert':'<path d="M10.01 21.01c0 1.1.89 1.99 1.99 1.99s1.99-.89 1.99-1.99h-3.98zm8.87-4.19V11c0-3.25-2.25-5.97-5.29-6.69v-.72C13.59 2.71 12.88 2 12 2s-1.59.71-1.59 1.59v.72C7.37 5.03 5.12 7.75 5.12 11v5.82L3 18.94V20h18v-1.06l-2.12-2.12zM16 13.01h-3v3h-2v-3H8V11h3V8h2v3h3v2.01z"/>',
		'error': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
		'error_outline':'<path d="M11 15h2v2h-2zm0-8h2v6h-2zm.99-5C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
		'warning': '<path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>',
		//
		// av
		//
		'add_to_queue': '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 10v2h-3v3h-2v-3H8v-2h3V7h2v3h3z"/>',
		'airplay': '<path d="M6 22h12l-6-6z"/><path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V5h18v12h-4v2h4c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'album': '<path d="M12 16.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M12 11c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
		'art_track': '<path d="M22 13h-8v-2h8v2z"/><path d="M22 7h-8v2h8V7z"/><path d="M14 17h8v-2h-8v2z"/><path d="M10.5 15l-2.25-3-1.75 2.26-1.25-1.51L3.5 15h7zM12 9v6c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2h6c1.1 0 2 .9 2 2z"/>',
		'av_timer': '<path d="M11 17c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/><path d="M11 3v4h2V5.08c3.39.49 6 3.39 6 6.92 0 3.87-3.13 7-7 7s-7-3.13-7-7c0-1.68.59-3.22 1.58-4.42L12 13l1.41-1.41-6.8-6.8v.02C4.42 6.45 3 9.05 3 12c0 4.97 4.02 9 9 9 4.97 0 9-4.03 9-9s-4.03-9-9-9h-1z"/><path d="M18 12c0-.55-.45-1-1-1s-1 .45-1 1 .45 1 1 1 1-.45 1-1z"/><path d="M6 12c0 .55.45 1 1 1s1-.45 1-1-.45-1-1-1-1 .45-1 1z"/>',
		'branding_watermark': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16h-9v-6h9v6z"/>',
		'call_to_action': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3v-3h18v3z"/>',
		'closed_caption': '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 7H9.5v-.5h-2v3h2V13H11v1c0 .55-.45 1-1 1H7c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1zm7 0h-1.5v-.5h-2v3h2V13H18v1c0 .55-.45 1-1 1h-3c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v1z"/>',
		'equalizer': '<path d="M10 20h4V4h-4v16z"/><path d="M4 20h4v-8H4v8z"/><path d="M16 9v11h4V9h-4z"/>',
		'explicit': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h4v2h-4v2h4v2H9V7h6v2z"/>',
		'fast_forward': '<path d="M4 18l8.5-6L4 6v12z"/><path d="M13 6v12l8.5-6L13 6z"/>',
		'fast_rewind': '<path d="M11 18V6l-8.5 6 8.5 6z"/><path d="M11.5 12l8.5 6V6l-8.5 6z"/>',
		'featured_play_list': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 8H3V9h9v2zm0-4H3V5h9v2z"/>',
		'featured_video': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 9H3V5h9v7z"/>',
		'fibre_dvr': '<path d="M17.5 10.5h2v1h-2zm-13 0h2v3h-2zM21 3H3c-1.11 0-2 .89-2 2v14c0 1.1.89 2 2 2h18c1.11 0 2-.9 2-2V5c0-1.11-.89-2-2-2zM8 13.5c0 .85-.65 1.5-1.5 1.5H3V9h3.5c.85 0 1.5.65 1.5 1.5v3zm4.62 1.5h-1.5L9.37 9h1.5l1 3.43 1-3.43h1.5l-1.75 6zM21 11.5c0 .6-.4 1.15-.9 1.4L21 15h-1.5l-.85-2H17.5v2H16V9h3.5c.85 0 1.5.65 1.5 1.5v1z"/>',
		'fiber_manual_record': '<circle cx="12" cy="12" r="8"/>',
		'fibre_new': '<path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM8.5 15H7.3l-2.55-3.5V15H3.5V9h1.25l2.5 3.5V9H8.5v6zm5-4.74H11v1.12h2.5v1.26H11v1.11h2.5V15h-4V9h4v1.26zm7 3.74c0 .55-.45 1-1 1h-4c-.55 0-1-.45-1-1V9h1.25v4.51h1.13V9.99h1.25v3.51h1.12V9h1.25v5z"/>',
		'fibre_pin': '<path d="M5.5 10.5h2v1h-2zM20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM9 11.5c0 .85-.65 1.5-1.5 1.5h-2v2H4V9h3.5c.85 0 1.5.65 1.5 1.5v1zm3.5 3.5H11V9h1.5v6zm7.5 0h-1.2l-2.55-3.5V15H15V9h1.25l2.5 3.5V9H20v6z"/>',
		'fibre_smart_record': '<path d="M17 4.26v2.09c2.33.82 4 3.04 4 5.65s-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74s-2.55-6.85-6-7.74z"/>',
		'forward_10': '<path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/><path d="M10.8 16H10v-3.3L9 13v-.7l1.8-.6h.1V16z"/><path d="M14.3 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.8.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
		'forward_30': '<path d="M9.6 13.5h.4c.2 0 .4-.1.5-.2.1-.1.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4c.1-.1.3-.2.4-.2.1 0 .4-.1.5-.1.2 0 .4 0 .6.1.2.1.3.1.5.2s.2.2.3.4c.1.2.1.3.1.5v.3s-.1.2-.1.3c0 .1-.1.2-.2.2s-.2.1-.3.2c.2.1.4.2.5.4.1.2.2.4.2.6 0 .2 0 .4-.1.5-.1.1-.2.3-.3.4-.1.1-.3.2-.5.2s-.4.1-.6.1c-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7z"/><path d="M14.4 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.9.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/><path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/>',
		'forward_5': '<path d="M4 13c0 4.4 3.6 8 8 8s8-3.6 8-8h-2c0 3.3-2.7 6-6 6s-6-2.7-6-6 2.7-6 6-6v4l5-5-5-5v4c-4.4 0-8 3.6-8 8z"/><path d="M10.7 13.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1.1.1.3.2.4.3.1.1.2.3.3.5.1.2.1.4.1.6 0 .2 0 .4-.1.5-.1.1-.1.3-.3.5-.2.2-.3.2-.5.3-.2.1-.4.1-.6.1-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.3-.1-.5h.8c0 .2.1.3.2.4.1.1.2.1.4.1.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.6z"/>',
		'games': '<path d="M15 7.5V2H9v5.5l3 3 3-3z"/><path d="M7.5 9H2v6h5.5l3-3-3-3z"/><path d="M9 16.5V22h6v-5.5l-3-3-3 3z"/><path d="M16.5 9l-3 3 3 3H22V9h-5.5z"/>',
		'hd': '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-8 12H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm2-6h4c.55 0 1 .45 1 1v4c0 .55-.45 1-1 1h-4V9zm1.5 4.5h2v-3h-2v3z"/>',
		'hearing': '<path d="M17 20c-.29 0-.56-.06-.76-.15-.71-.37-1.21-.88-1.71-2.38-.51-1.56-1.47-2.29-2.39-3-.79-.61-1.61-1.24-2.32-2.53C9.29 10.98 9 9.93 9 9c0-2.8 2.2-5 5-5s5 2.2 5 5h2c0-3.93-3.07-7-7-7S7 5.07 7 9c0 1.26.38 2.65 1.07 3.9.91 1.65 1.98 2.48 2.85 3.15.81.62 1.39 1.07 1.71 2.05.6 1.82 1.37 2.84 2.73 3.55.51.23 1.07.35 1.64.35 2.21 0 4-1.79 4-4h-2c0 1.1-.9 2-2 2z"/><path d="M7.64 2.64L6.22 1.22C4.23 3.21 3 5.96 3 9s1.23 5.79 3.22 7.78l1.41-1.41C6.01 13.74 5 11.49 5 9s1.01-4.74 2.64-6.36z"/><path d="M11.5 9c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5-2.5 1.12-2.5 2.5z"/>',
		'high_quality': '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 11H9.5v-2h-2v2H6V9h1.5v2.5h2V9H11v6zm7-1c0 .55-.45 1-1 1h-.75v1.5h-1.5V15H14c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1h3c.55 0 1 .45 1 1v4zm-3.5-.5h2v-3h-2v3z"/>',
		'my_library_add': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'my_library_books': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 7H9V5h10v2zm-4 8H9v-2h6v2zm4-4H9V9h10v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'my_library_music': '<path d="M18 7h-3v5.5a2.5 2.5 0 0 1-5 0 2.5 2.5 0 0 1 2.5-2.5c.57 0 1.08.19 1.5.51V5h4v2zm2-5H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/>',
		'loop': '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/><path d="M12 18c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>',
		'mic': '<path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
		'mic_none': '<path d="M10.8 4.9c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2l-.01 6.2c0 .66-.53 1.2-1.19 1.2-.66 0-1.2-.54-1.2-1.2V4.9zM12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 11c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
		'mic_off': '<path d="M19 11h-1.7c0 .74-.16 1.43-.43 2.05l1.23 1.23c.56-.98.9-2.09.9-3.28z"/><path d="M14.98 11.17c0-.06.02-.11.02-.17V5c0-1.66-1.34-3-3-3S9 3.34 9 5v.18l5.98 5.99z"/><path d="M4.27 3L3 4.27l6.01 6.01V11c0 1.66 1.33 3 2.99 3 .22 0 .44-.03.65-.08l1.66 1.66c-.71.33-1.5.52-2.31.52-2.76 0-5.3-2.1-5.3-5.1H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c.91-.13 1.77-.45 2.54-.9L19.73 21 21 19.73 4.27 3z"/>',
		'movie': '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>',
		'music_video': '<path d="M21 19H3V5h18v14zm0-16H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M8 15c0-1.66 1.34-3 3-3 .35 0 .69.07 1 .18V6h5v2h-3v7.03A3.003 3.003 0 0 1 11 18c-1.66 0-3-1.34-3-3z"/>',
		'new_releases': '<path d="M23 12l-2.44-2.78.34-3.68-3.61-.82-1.89-3.18L12 3 8.6 1.54 6.71 4.72l-3.61.81.34 3.68L1 12l2.44 2.78-.34 3.69 3.61.82 1.89 3.18L12 21l3.4 1.46 1.89-3.18 3.61-.82-.34-3.68L23 12zm-10 5h-2v-2h2v2zm0-4h-2V7h2v6z"/>',
		'not_interested': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>',
		'note': '<path d="M22 10l-6-6H4c-1.1 0-2 .9-2 2v12.01c0 1.1.9 1.99 2 1.99l16-.01c1.1 0 2-.89 2-1.99v-8zm-7-4.5l5.5 5.5H15V5.5z"/>',
		'pause': '<path d="M6 19h4V5H6v14z"/><path d="M14 5v14h4V5h-4z"/>',
		'pause_circle_filled': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>',
		'pause_circle_outline': '<path d="M9 16h2V8H9v8z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M13 16h2V8h-2v8z"/>',
		'play_arrow': '<path d="M8 5v14l11-7z"/>',
		'play_circle_fill': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>',
		'play_circle_outline': '<path d="M10 16.5l6-4.5-6-4.5v9z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'playlist_add': '<path d="M14 10H2v2h12v-2z"/><path d="M14 6H2v2h12V6z"/><path d="M18 14v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4z"/><path d="M2 16h8v-2H2v2z"/>',
		'playlist_add_check': '<path d="M14 10H2v2h12v-2z"/><path d="M14 6H2v2h12V6z"/><path d="M2 16h8v-2H2v2z"/><path d="M21.5 11.5L23 13l-6.99 7-4.51-4.5L13 14l3.01 3 5.49-5.5z"/>',
		'playlist_play': '<path d="M19 9H2v2h17V9z"/><path d="M19 5H2v2h17V5z"/><path d="M2 15h13v-2H2v2z"/><path d="M17 13v6l5-3-5-3z"/>',
		'queue': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'queue_music': '<path d="M15 6H3v2h12V6z"/><path d="M15 10H3v2h12v-2z"/><path d="M3 16h8v-2H3v2z"/><path d="M17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"/>',
		'queue_play_next': '<path d="M21 3H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h2v-2H3V5h18v8h2V5a2 2 0 0 0-2-2z"/><path d="M13 10V7h-2v3H8v2h3v3h2v-3h3v-2h-3z"/><path d="M24 18l-4.5 4.5L18 21l3-3-3-3 1.5-1.5L24 18z"/>',
		'radio': '<path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12c0 1.1.89 2 2 2h16c1.11 0 2-.9 2-2V8c0-1.11-.89-2-2-2H8.3l8.26-3.34L15.88 1 3.24 6.15zM7 20c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm13-8h-2v-2h-2v2H4V8h16v4z"/>',
		'recent_actors': '<path d="M17 19h2V5h-2v14zm4-14v14h2V5h-2z"/><path d="M12.5 17h-9v-.75c0-1.5 3-2.25 4.5-2.25s4.5.75 4.5 2.25V17zM8 7.75c1.24 0 2.25 1.01 2.25 2.25S9.24 12.25 8 12.25 5.75 11.24 5.75 10 6.76 7.75 8 7.75zM14 5H2c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
		'remove_from_queue': '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 10v2H8v-2h8z"/>',
		'repeat': '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>',
		'repeat_one': '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7z"/><path d="M17 17H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/><path d="M13 15V9h-1l-2 1v1h1.5v4H13z"/>',
		'replay': '<path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>',
		'replay_10': '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M10.9 16H10v-3.3L9 13v-.7l1.8-.6h.1V16z"/><path d="M14.3 13.4v-.5s-.1-.2-.1-.3c0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.9.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
		'replay_30': '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M9.6 13.5h.4c.2 0 .4-.1.5-.2.1-.1.2-.2.2-.4v-.2s-.1-.1-.1-.2-.1-.1-.2-.1h-.5s-.1.1-.2.1-.1.1-.1.2v.2h-1c0-.2 0-.3.1-.5s.2-.3.3-.4c.1-.1.3-.2.4-.2.1 0 .4-.1.5-.1.2 0 .4 0 .6.1.2.1.3.1.5.2s.2.2.3.4c.1.2.1.3.1.5v.3s-.1.2-.1.3c0 .1-.1.2-.2.2s-.2.1-.3.2c.2.1.4.2.5.4.1.2.2.4.2.6 0 .2 0 .4-.1.5-.1.1-.2.3-.3.4-.1.1-.3.2-.5.2s-.4.1-.6.1c-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.4-.1-.6h.8v.2s.1.1.1.2.1.1.2.1h.5s.1-.1.2-.1.1-.1.1-.2v-.5s-.1-.1-.1-.2-.1-.1-.2-.1h-.6v-.7z"/><path d="M14.5 13.4v-.5c0-.1-.1-.2-.1-.3 0-.1-.1-.1-.2-.2s-.2-.1-.3-.1c-.1 0-.2 0-.3.1l-.2.2s-.1.2-.1.3v2s.1.2.1.3c0 .1.1.1.2.2s.2.1.3.1c.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-1.5zm.8.8c0 .3 0 .6-.1.8l-.3.6s-.3.3-.5.3-.4.1-.6.1c-.2 0-.4 0-.6-.1-.2-.1-.3-.2-.5-.3-.2-.1-.2-.3-.3-.6-.1-.3-.1-.5-.1-.8v-.7c0-.3 0-.6.1-.8l.3-.6s.3-.3.5-.3.4-.1.6-.1c.2 0 .4 0 .6.1.2.1.3.2.5.3.2.1.2.3.3.6.1.3.1.5.1.8v.7z"/>',
		'replay_5': '<path d="M12 5V1L7 6l5 5V7c3.3 0 6 2.7 6 6s-2.7 6-6 6-6-2.7-6-6H4c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8z"/><path d="M10.7 13.9l.2-2.2h2.4v.7h-1.7l-.1.9s.1 0 .1-.1.1 0 .1-.1.1 0 .2 0h.2c.2 0 .4 0 .5.1.1.1.3.2.4.3.1.1.2.3.3.5.1.2.1.4.1.6 0 .2 0 .4-.1.5-.1.1-.1.3-.3.5-.2.2-.3.2-.4.3-.1.1-.4.1-.6.1-.2 0-.4 0-.5-.1-.1-.1-.3-.1-.5-.2s-.2-.2-.3-.4c-.1-.2-.1-.3-.1-.5h.8c0 .2.1.3.2.4.1.1.2.1.4.1.1 0 .2 0 .3-.1l.2-.2s.1-.2.1-.3v-.6l-.1-.2-.2-.2s-.2-.1-.3-.1h-.2s-.1 0-.2.1-.1 0-.1.1-.1.1-.1.1h-.7z"/>',
		'shuffle': '<path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41z"/><path d="M14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5z"/><path d="M14.83 13.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/>',
		'skip_next': '<path d="M6 18l8.5-6L6 6v12z"/><path d="M16 6v12h2V6h-2z"/>',
		'skip_previous': '<path d="M6 6h2v12H6z"/><path d="M9.5 12l8.5 6V6z"/>',
		'slow_motion_video': '<path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M13.05 9.79L10 7.5v9l3.05-2.29L16 12z"/><path d="M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69A7.941 7.941 0 0 1 11 4.07z"/><path d="M5.69 7.1L4.26 5.68A9.949 9.949 0 0 0 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9z"/><path d="M4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43A7.868 7.868 0 0 1 4.07 13z"/><path d="M5.68 19.74A9.981 9.981 0 0 0 11 21.95v-2.02a7.941 7.941 0 0 1-3.9-1.62l-1.42 1.43z"/><path d="M22 12c0 5.16-3.92 9.42-8.95 9.95v-2.02C16.97 19.41 20 16.05 20 12s-3.03-7.41-6.95-7.93V2.05C18.08 2.58 22 6.84 22 12z"/>',
		'snooze': '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M9 11h3.63L9 15.2V17h6v-2h-3.63L15 10.8V9H9v2z"/>',
		'sort_by_alpha': '<path d="M14.94 4.66h-4.72l2.36-2.36z"/><path d="M10.25 19.37h4.66l-2.33 2.33z"/><path d="M4.97 13.64l1.94-5.18 1.94 5.18H4.97zM6.1 6.27L1.6 17.73h1.84l.92-2.45h5.11l.92 2.45h1.84L7.74 6.27H6.1z"/><path d="M15.73 16.14h6.12v1.59h-8.53v-1.29l5.92-8.56h-5.88v-1.6h8.3v1.26l-5.93 8.6z"/>',
		'stop': '<path d="M6 6h12v12H6z"/>',
		'subscriptions': '<path d="M20 8H4V6h16v2z"/><path d="M18 2H6v2h12V2z"/><path d="M16 16l-6-3.27v6.53L16 16zm6-4v8c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2v-8c0-1.1.9-2 2-2h16c1.1 0 2 .9 2 2z"/>',
		'subtitles': '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM4 12h4v2H4v-2zm10 6H4v-2h10v2zm6 0h-4v-2h4v2zm0-4H10v-2h10v2z"/>',
		'surround_sound': '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zM7.76 16.24l-1.41 1.41C4.78 16.1 4 14.05 4 12c0-2.05.78-4.1 2.34-5.66l1.41 1.41C6.59 8.93 6 10.46 6 12s.59 3.07 1.76 4.24zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm5.66 1.66l-1.41-1.41C17.41 15.07 18 13.54 18 12s-.59-3.07-1.76-4.24l1.41-1.41C19.22 7.9 20 9.95 20 12c0 2.05-.78 4.1-2.34 5.66zM12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
		'video_call': ' <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM14 13h-3v3H9v-3H6v-2h3V8h2v3h3v2z"/>',
		'video_label': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 13H3V5h18v11z"/>',
		'video_library': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M12 14.5v-9l6 4.5-6 4.5zM20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'videocam': '<path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>',
		'videocam_off': '<path d="M21 6.5l-4 4V7c0-.55-.45-1-1-1H9.82L21 17.18V6.5z"/><path d="M3.27 2L2 3.27 4.73 6H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.21 0 .39-.08.54-.18L19.73 21 21 19.73 3.27 2z"/>',
		'volume_down': '<path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M5 9v6h4l5 5V4L9 9H5z"/>',
		'volume_mute': '<path d="M7 9v6h4l5 5V4l-5 5H7z"/>',
		'volume_off': '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63z"/><path d="M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z"/><path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3z"/><path d="M12 4L9.91 6.09 12 8.18V4z"/>',
		'volume_up': '<path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/><path d="M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z"/>',
		'web': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 14H4v-4h11v4zm0-5H4V9h11v4zm5 5h-4V9h4v9z"/>',
		'web_asset': '<path d="M19 4H5c-1.11 0-2 .9-2 2v12c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.89-2-2-2zm0 14H5V8h14v10z" />',
		//
		// communication
		//
		'business': '<path d="M20 19h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zM10 7H8V5h2v2zm0 4H8V9h2v2zm0 4H8v-2h2v2zm0 4H8v-2h2v2zM6 7H4V5h2v2zm0 4H4V9h2v2zm0 4H4v-2h2v2zm0 4H4v-2h2v2zm6-12V3H2v18h20V7H12z"/><path d="M18 11h-2v2h2v-2z"/><path d="M18 15h-2v2h2v-2z"/>',
		'call': '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
		'call_end': '<path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08c-.18-.17-.29-.42-.29-.7 0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28-.79-.74-1.69-1.36-2.67-1.85-.33-.16-.56-.5-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z"/>',
		'call_made': '<path d="M9 5v2h6.59L4 18.59 5.41 20 17 8.41V15h2V5z"/>',
		'call_merge': '<path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41z"/><path d="M7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>',
		'call_missed': '<path d="M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9z"/>',
		'call_missed_outgoing':'<path d="M3 8.41l9 9 7-7V15h2V7h-8v2h4.59L12 14.59 4.41 7 3 8.41z"/>',
		'call_received': '<path d="M20 5.41L18.59 4 7 15.59V9H5v10h10v-2H8.41z"/>',
		'call_split': '<path d="M14 4l2.29 2.29-2.88 2.88 1.42 1.42 2.88-2.88L20 10V4z"/><path d="M10 4H4v6l2.29-2.29 4.71 4.7V20h2v-8.41l-5.29-5.3z"/>',
		'chat': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 9h12v2H6V9zm8 5H6v-2h8v2zm4-6H6V6h12v2z"/>',
		'chat_bubble': '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'chat_bubble_outline': '<path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>',
		'clear_all': '<path d="M5 13h14v-2H5v2z"/><path d="M3 17h14v-2H3v2z"/><path d="M7 7v2h14V7H7z"/>',
		'comment': '<path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
		'contact_mail':'<path d="M21 8V7l-3 2-3-2v1l3 2 3-2zm1-5H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm8-6h-8V6h8v6z"/>',
		'contact_phone':'<path d="M22 3H2C.9 3 0 3.9 0 5v14c0 1.1.9 2 2 2h20c1.1 0 1.99-.9 1.99-2L24 5c0-1.1-.9-2-2-2zM8 6c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H2v-1c0-2 4-3.1 6-3.1s6 1.1 6 3.1v1zm3.85-4h1.64L21 16l-1.99 1.99c-1.31-.98-2.28-2.38-2.73-3.99-.18-.64-.28-1.31-.28-2s.1-1.36.28-2c.45-1.62 1.42-3.01 2.73-3.99L21 8l-1.51 2h-1.64c-.22.63-.35 1.3-.35 2s.13 1.37.35 2z"/>',
		'contacts': '<path d="M20 0H4v2h16V0z"/><path d="M4 24h16v-2H4v2z"/><path d="M17 17H7v-1.5c0-1.67 3.33-2.5 5-2.5s5 .83 5 2.5V17zM12 6.75c1.24 0 2.25 1.01 2.25 2.25s-1.01 2.25-2.25 2.25S9.75 10.24 9.75 9 10.76 6.75 12 6.75zM20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
		'dialer_sip': '<path d="M20 5h-1V4h1v1zm-2-2v5h1V6h2V3h-3zm-3 2h-2V4h2V3h-3v3h2v1h-2v1h3V5zm2-2h-1v5h1V3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.01.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.27-.26.35-.65.24-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
		'dialpad': '<path d="M12 19c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 13c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 7c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M12 1c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
		'email': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
		'forum': '<path d="M21 6h-2v9H6v2c0 .55.45 1 1 1h11l4 4V7c0-.55-.45-1-1-1z"/><path d="M17 12V3c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v14l4-4h10c.55 0 1-.45 1-1z"/>',
		'import_contacts': '<path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z"/>',
		'import_export': '<path d="M9 3L5 6.99h3V14h2V6.99h3L9 3z"/><path d="M16 17.01V10h-2v7.01h-3L15 21l4-3.99h-3z"/>',
		'invert_colors_off': '<path d="M12 19.59c-1.6 0-3.11-.62-4.24-1.76A5.945 5.945 0 0 1 6 13.59c0-1.32.43-2.57 1.21-3.6L12 14.77v4.82zm8.65 1.28l-2.35-2.35-6.3-6.29-3.56-3.57-1.42-1.41L4.27 4.5 3 5.77l2.78 2.78a8.005 8.005 0 0 0 .56 10.69A7.98 7.98 0 0 0 12 21.58c1.79 0 3.57-.59 5.03-1.78l2.7 2.7L21 21.23l-.35-.36z"/><path d="M12 5.1v4.58l7.25 7.26c1.37-2.96.84-6.57-1.6-9.01L12 2.27l-3.7 3.7 1.41 1.41L12 5.1z"/>',
		'live_help': '<path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 16h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 11.9 13 12.5 13 14h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>',
		'location_off': '<path d="M12 6.5A2.5 2.5 0 0 1 14.5 9c0 .74-.33 1.39-.83 1.85l3.63 3.63c.98-1.86 1.7-3.8 1.7-5.48 0-3.87-3.13-7-7-7a7 7 0 0 0-5.04 2.15l3.19 3.19c.46-.52 1.11-.84 1.85-.84z"/><path d="M16.37 16.1l-4.63-4.63-.11-.11L3.27 3 2 4.27l3.18 3.18C5.07 7.95 5 8.47 5 9c0 5.25 7 13 7 13s1.67-1.85 3.38-4.35L18.73 21 20 19.73l-3.63-3.63z"/>',
		'location_on': '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
		'mail_outline': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>',
		'message': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
		'no_sim': '<path d="M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5z"/><path d="M3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z"/>',
		'phone': '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
		'phonelink_erase':'<path d="M13 8.2l-1-1-4 4-4-4-1 1 4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'phonelink_lock':'<path d="M19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-8.2 10V9.5C10.8 8.1 9.4 7 8 7S5.2 8.1 5.2 9.5V11c-.6 0-1.2.6-1.2 1.2v3.5c0 .7.6 1.3 1.2 1.3h5.5c.7 0 1.3-.6 1.3-1.2v-3.5c0-.7-.6-1.3-1.2-1.3zm-1.3 0h-3V9.5c0-.8.7-1.3 1.5-1.3s1.5.5 1.5 1.3V11z"/>',
		'phonelink_ring':'<path d="M20.1 7.7l-1 1c1.8 1.8 1.8 4.6 0 6.5l1 1c2.5-2.3 2.5-6.1 0-8.5zM18 9.8l-1 1c.5.7.5 1.6 0 2.3l1 1c1.2-1.2 1.2-3 0-4.3zM14 1H4c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm0 19H4V4h10v16z"/>',
		'phonelink_setup':'<path d="M11.8 12.5v-1l1.1-.8c.1-.1.1-.2.1-.3l-1-1.7c-.1-.1-.2-.2-.3-.1l-1.3.4c-.3-.2-.6-.4-.9-.5l-.2-1.3c0-.1-.1-.2-.3-.2H7c-.1 0-.2.1-.3.2l-.2 1.3c-.3.1-.6.3-.9.5l-1.3-.5c-.1 0-.2 0-.3.1l-1 1.7c-.1.1 0 .2.1.3l1.1.8v1l-1.1.8c-.1.2-.1.3-.1.4l1 1.7c.1.1.2.2.3.1l1.4-.4c.3.2.6.4.9.5l.2 1.3c-.1.1.1.2.2.2h2c.1 0 .2-.1.3-.2l.2-1.3c.3-.1.6-.3.9-.5l1.3.5c.1 0 .2 0 .3-.1l1-1.7c.1-.1 0-.2-.1-.3l-1.1-.9zM8 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM19 1H9c-1.1 0-2 .9-2 2v3h2V4h10v16H9v-2H7v3c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'portable_wifi_off': '<path d="M17.56 14.24c.28-.69.44-1.45.44-2.24 0-3.31-2.69-6-6-6-.79 0-1.55.16-2.24.44l1.62 1.62c.2-.03.41-.06.62-.06a3.999 3.999 0 0 1 3.95 4.63l1.61 1.61z"/><path d="M12 4c4.42 0 8 3.58 8 8 0 1.35-.35 2.62-.95 3.74l1.47 1.47A9.86 9.86 0 0 0 22 12c0-5.52-4.48-10-10-10-1.91 0-3.69.55-5.21 1.47l1.46 1.46C9.37 4.34 10.65 4 12 4z"/><path d="M3.27 2.5L2 3.77l2.1 2.1C2.79 7.57 2 9.69 2 12c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 17.53 4 14.96 4 12c0-1.76.57-3.38 1.53-4.69l1.43 1.44C6.36 9.68 6 10.8 6 12c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-.65.17-1.25.44-1.79l1.58 1.58L10 12c0 1.1.9 2 2 2l.21-.02.01.01 7.51 7.51L21 20.23 4.27 3.5l-1-1z"/>',
		'present_to_all': '<path d="M21 19.02H3V4.98h18v14.04zM21 3H3c-1.11 0-2 .89-2 2v14c0 1.11.89 2 2 2h18c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/><path d="M10 12H8l4-4 4 4h-2v4h-4v-4z"/>',
		'ring_volume': '<path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73 1.6 0 3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.66 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.27-.11-.52-.29-.7z"/><path d="M21.16 6.26l-1.41-1.41-3.56 3.55 1.41 1.41s3.45-3.52 3.56-3.55z"/><path d="M13 2h-2v5h2V2z"/><path d="M6.4 9.81L7.81 8.4 4.26 4.84 2.84 6.26c.11.03 3.56 3.55 3.56 3.55z"/>',
		'rss_feed': '<path d="M4 4.44v2.83c7.03 0 12.73 5.7 12.73 12.73h2.83c0-8.59-6.97-15.56-15.56-15.56z"/><path d="M4 10.1v2.83c3.9 0 7.07 3.17 7.07 7.07h2.83c0-5.47-4.43-9.9-9.9-9.9z"/>',
		'screen_share': '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.11-.9-2-2-2H4c-1.11 0-2 .89-2 2v10c0 1.1.89 2 2 2H0v2h24v-2h-4zm-7-3.53v-2.19c-2.78 0-4.61.85-6 2.72.56-2.67 2.11-5.33 6-5.87V7l4 3.73-4 3.74z"/>',
		'stay_current_landscape': '<path d="M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z"/>',
		'stay_current_portrait': '<path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
		'stay_primary_landscape': '<path d="M1.01 7L1 17c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2H3c-1.1 0-1.99.9-1.99 2zM19 7v10H5V7h14z"/>',
		'stay_primary_portrait': '<path d="M17 1.01L7 1c-1.1 0-1.99.9-1.99 2v18c0 1.1.89 2 1.99 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
		'stop_screen_share': '<path d="M21.22 18.02l2 2H24v-2h-2.78z"/><path d="M21.99 16.02l.01-10a2 2 0 0 0-2-2H7.22l5.23 5.23c.18-.04.36-.07.55-.1V7.02l4 3.73-1.58 1.47 5.54 5.54c.61-.33 1.03-.99 1.03-1.74z"/><path d="M7 15.02c.31-1.48.92-2.95 2.07-4.06l1.59 1.59c-1.54.38-2.7 1.18-3.66 2.47zM2.39 1.73L1.11 3l1.54 1.54c-.4.36-.65.89-.65 1.48v10a2 2 0 0 0 2 2H0v2h18.13l2.71 2.71 1.27-1.27L2.39 1.73z"/>',
		'swap_calls': '<path d="M18 4l-4 4h3v7c0 1.1-.9 2-2 2s-2-.9-2-2V8c0-2.21-1.79-4-4-4S5 5.79 5 8v7H2l4 4 4-4H7V8c0-1.1.9-2 2-2s2 .9 2 2v7c0 2.21 1.79 4 4 4s4-1.79 4-4V8h3l-4-4z"/>',
		'textsms': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>',
		'voicemail': '<path d="M18.5 6C15.46 6 13 8.46 13 11.5c0 1.33.47 2.55 1.26 3.5H9.74c.79-.95 1.26-2.17 1.26-3.5C11 8.46 8.54 6 5.5 6S0 8.46 0 11.5 2.46 17 5.5 17h13c3.04 0 5.5-2.46 5.5-5.5S21.54 6 18.5 6zm-13 9C3.57 15 2 13.43 2 11.5S3.57 8 5.5 8 9 9.57 9 11.5 7.43 15 5.5 15zm13 0c-1.93 0-3.5-1.57-3.5-3.5S16.57 8 18.5 8 22 9.57 22 11.5 20.43 15 18.5 15z"/>',
		'vpn_key': '<path d="M12.65 10C11.83 7.67 9.61 6 7 6c-3.31 0-6 2.69-6 6s2.69 6 6 6c2.61 0 4.83-1.67 5.65-4H17v4h4v-4h2v-4H12.65zM7 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
		//
		// content
		//
		'add': '<path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>',
		'add_box': '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
		'add_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z"/>',
		'add_circle_outline': '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'archive': '<path d="M20.54 5.23l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.16.55L3.46 5.23C3.17 5.57 3 6.02 3 6.5V19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.48-.17-.93-.46-1.27zM12 17.5L6.5 12H10v-2h4v2h3.5L12 17.5zM5.12 5l.81-1h12l.94 1H5.12z"/>',
		'backspace': '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z"/>',
		'block': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>',
		'clear': '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
		'content_copy': '<path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1z"/><path d="M19 21H8V7h11v14zm0-16H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>',
		'content_cut': '<path d="M12 12.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM6 20a2 2 0 1 1-.001-3.999A2 2 0 0 1 6 20zM6 8a2 2 0 1 1-.001-3.999A2 2 0 0 1 6 8zm3.64-.36c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64z"/><path d="M19 3l-6 6 2 2 7-7V3z"/>',
		'content_paste': '<path d="M19 2h-4.18C14.4.84 13.3 0 12 0c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm7 18H5V4h2v3h10V4h2v16z"/>',
		'create': '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
		'delete_sweep': '<path d="M15 16h4v2h-4z"/><path d="M15 8h7v2h-7z"/><path d="M15 12h6v2h-6z"/><path d="M3 18c0 1.1.9 2 2 2h6c1.1 0 2-.9 2-2V8H3v10z"/><path d="M14 5h-3l-1-1H6L5 5H2v2h12z"/>',
		'drafts': '<path d="M21.99 8c0-.72-.37-1.35-.94-1.7L12 1 2.95 6.3C2.38 6.65 2 7.28 2 8v10c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2l-.01-10zM12 13L3.74 7.84 12 3l8.26 4.84L12 13z"/>',
		'filter_list': '<path d="M10 18h4v-2h-4v2z"/><path d="M3 6v2h18V6H3z"/><path d="M6 13h12v-2H6v2z"/>',
		'flag': '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>',
		'font_download': '<path d="M9.93 13.5h4.14L12 7.98z"/><path d="M15.95 18.5l-1.14-3H9.17l-1.12 3H5.96l5.11-13h1.86l5.11 13h-2.09zM20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'forward': '<path d="M12 8V4l8 8-8 8v-4H4V8z"/>',
		'gesture': '<path d="M4.59 6.89c.7-.71 1.4-1.35 1.71-1.22.5.2 0 1.03-.3 1.52-.25.42-2.86 3.89-2.86 6.31 0 1.28.48 2.34 1.34 2.98.75.56 1.74.73 2.64.46 1.07-.31 1.95-1.4 3.06-2.77 1.21-1.49 2.83-3.44 4.08-3.44 1.63 0 1.65 1.01 1.76 1.79-3.78.64-5.38 3.67-5.38 5.37 0 1.7 1.44 3.09 3.21 3.09 1.63 0 4.29-1.33 4.69-6.1H21v-2.5h-2.47c-.15-1.65-1.09-4.2-4.03-4.2-2.25 0-4.18 1.91-4.94 2.84-.58.73-2.06 2.48-2.29 2.72-.25.3-.68.84-1.11.84-.45 0-.72-.83-.36-1.92.35-1.09 1.4-2.86 1.85-3.52.78-1.14 1.3-1.92 1.3-3.28C8.95 3.69 7.31 3 6.44 3 5.12 3 3.97 4 3.72 4.25c-.36.36-.66.66-.88.93l1.75 1.71zm9.29 11.66c-.31 0-.74-.26-.74-.72 0-.6.73-2.2 2.87-2.76-.3 2.69-1.43 3.48-2.13 3.48z"/>',
		'inbox': '<path d="M19 15h-4c0 1.66-1.34 3-3 3s-3-1.34-3-3H4.99V5H19v10zm0-12H4.99c-1.1 0-1.98.9-1.98 2L3 19c0 1.1.89 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M16 10h-2V7h-4v3H8l4 4 4-4z"/>',
		'link': '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z"/><path d="M8 13h8v-2H8v2z"/><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
		'low_priority': '<path d="M14 5h8v2h-8z"/><path d="M14 10.5h8v2h-8z"/><path d="M14 16h8v2h-8z"/><path d="M2 11.5C2 15.08 4.92 18 8.5 18H9v2l3-3-3-3v2h-.5C6.02 16 4 13.98 4 11.5S6.02 7 8.5 7H12V5H8.5C4.92 5 2 7.92 2 11.5z"/>',
		'mail': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
		'markunread': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
		'move_to_inbox': '<path d="M19 15h-4c0 1.66-1.35 3-3 3s-3-1.34-3-3H4.99V5H19v10zm0-12H4.99c-1.11 0-1.98.9-1.98 2L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M16 10h-2V7h-4v3H8l4 4 4-4z"/>',
		'next_week': '<path d="M20 7h-4V5c0-.55-.22-1.05-.59-1.41C15.05 3.22 14.55 3 14 3h-4c-1.1 0-2 .9-2 2v2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zM10 5h4v2h-4V5zm1 13.5l-1-1 3-3-3-3 1-1 4 4-4 4z"/>',
		'redo': '<path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/>',
		'remove': '<path d="M19 13H5v-2h14v2z"/>',
		'remove_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>',
		'remove_circle_outline': '<path d="M7 11v2h10v-2H7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'reply': '<path d="M10 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>',
		'reply_all': '<path d="M7 8V5l-7 7 7 7v-3l-4-4 4-4z"/><path d="M13 9V5l-7 7 7 7v-4.1c5 0 8.5 1.6 11 5.1-1-5-4-10-11-11z"/>',
		'report': '<path d="M15.73 3H8.27L3 8.27v7.46L8.27 21h7.46L21 15.73V8.27L15.73 3zM12 17.3c-.72 0-1.3-.58-1.3-1.3 0-.72.58-1.3 1.3-1.3.72 0 1.3.58 1.3 1.3 0 .72-.58 1.3-1.3 1.3zm1-4.3h-2V7h2v6z"/>',
		'save': '<path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>',
		'select_all': '<path d="M3 5h2V3c-1.1 0-2 .9-2 2z"/><path d="M3 13h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M3 9h2V7H3v2z"/><path d="M13 3h-2v2h2V3z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M5 21v-2H3c0 1.1.9 2 2 2z"/><path d="M3 17h2v-2H3v2z"/><path d="M9 3H7v2h2V3z"/><path d="M11 21h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21c1.1 0 2-.9 2-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M9 9h6v6H9V9zm-2 8h10V7H7v10z"/>',
		'send': '<path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>',
		'sort': '<path d="M3 18h6v-2H3v2z"/><path d="M3 6v2h18V6H3z"/><path d="M3 13h12v-2H3v2z"/>',
		'text_format': '<path d="M5 17v2h14v-2H5z"/><path d="M12 5.98L13.87 11h-3.74L12 5.98zM9.5 12.8h5l.9 2.2h2.1L12.75 4h-1.5L6.5 15h2.1l.9-2.2z"/>',
		'unarchive': '<path d="M20.55 5.22l-1.39-1.68C18.88 3.21 18.47 3 18 3H6c-.47 0-.88.21-1.15.55L3.46 5.22C3.17 5.57 3 6.01 3 6.5V19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6.5c0-.49-.17-.93-.45-1.28zM12 9.5l5.5 5.5H14v2h-4v-2H6.5L12 9.5zM5.12 5l.82-1h12l.93 1H5.12z"/>',
		'undo': '<path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/>',
		'weekend': '<path d="M21 10c-1.1 0-2 .9-2 2v3H5v-3c0-1.1-.9-2-2-2s-2 .9-2 2v5c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2v-5c0-1.1-.9-2-2-2z"/><path d="M18 5H6c-1.1 0-2 .9-2 2v2.15c1.16.41 2 1.51 2 2.82V14h12v-2.03c0-1.3.84-2.4 2-2.82V7c0-1.1-.9-2-2-2z"/>',
		//
		// device
		//
		'access_alarms': '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
		'access_alarm': '<path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M12.5 8H11v6l4.75 2.85.75-1.23-4-2.37V8z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/>',
		'access_time': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>',
		'add_alarm': '<path d="M7.88 3.39L6.6 1.86 2 5.71l1.29 1.53 4.59-3.85z"/><path d="M22 5.72l-4.6-3.86-1.29 1.53 4.6 3.86L22 5.72z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-16c-4.97 0-9 4.03-9 9s4.02 9 9 9c4.97 0 9-4.03 9-9s-4.03-9-9-9z"/><path d="M13 9h-2v3H8v2h3v3h2v-3h3v-2h-3V9z"/>',
		'airplanemode_on': '<path d="M10.18 9"/><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
		'airplanemode_inactive': '<path d="M13 9V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v3.68l7.83 7.83L21 16v-2l-8-5z"/><path d="M3 5.27l4.99 4.99L2 14v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-3.73L18.73 21 20 19.73 4.27 4 3 5.27z"/>',
		'battery_charging_full': '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM11 20v-5.5H9L13 7v5.5h2L11 20z"/>',
		'battery_full': '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>',
		'battery_std': '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/>',
		'battery_unknown': '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zm-2.72 13.95h-1.9v-1.9h1.9v1.9zm1.35-5.26s-.38.42-.67.71c-.48.48-.83 1.15-.83 1.6h-1.6c0-.83.46-1.52.93-2l.93-.94c.27-.27.44-.65.44-1.06 0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5H9c0-1.66 1.34-3 3-3s3 1.34 3 3c0 .66-.27 1.26-.7 1.69z"/>',
		'bluetooth': '<path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>',
		'bluetooth_connected': '<path d="M14.88 16.29L13 18.17v-3.76l1.88 1.88zM13 5.83l1.88 1.88L13 9.59V5.83zm4.71 1.88L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/><path d="M19 10l-2 2 2 2 2-2-2-2z"/><path d="M7 12l-2-2-2 2 2 2 2-2z"/>',
		'bluetooth_disabled': '<path d="M13 5.83l1.88 1.88-1.6 1.6 1.41 1.41 3.02-3.02L12 2h-1v5.03l2 2v-3.2z"/><path d="M13 18.17v-3.76l1.88 1.88L13 18.17zM5.41 4L4 5.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l4.29-4.29 2.3 2.29L20 18.59 5.41 4z"/>',
		'bluetooth_searching': '<path d="M14.24 12.01l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32z"/><path d="M19.53 6.71l-1.26 1.26c.63 1.21.98 2.57.98 4.02 0 1.45-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19z"/><path d="M12.88 16.29L11 18.17v-3.76l1.88 1.88zM11 5.83l1.88 1.88L11 9.59V5.83zm4.71 1.88L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
		'brightness_auto': '<path d="M10.85 12.65h2.3L12 9l-1.15 3.65zM20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM14.3 16l-.7-2h-3.2l-.7 2H7.8L11 7h2l3.2 9h-1.9z"/>',
		'brightness_high': '<path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
		'brightness_low': '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
		'brightness_medium': '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
		'data_usage': '<path d="M13 2.05v3.03c3.39.49 6 3.39 6 6.92 0 .9-.18 1.75-.48 2.54l2.6 1.53c.56-1.24.88-2.62.88-4.07 0-5.18-3.95-9.45-9-9.95z"/><path d="M12 19c-3.87 0-7-3.13-7-7 0-3.53 2.61-6.43 6-6.92V2.05c-5.06.5-9 4.76-9 9.95 0 5.52 4.47 10 9.99 10 3.31 0 6.24-1.61 8.06-4.09l-2.6-1.53C16.17 17.98 14.21 19 12 19z"/>',
		'developer_mode': '<path d="M7 5h10v2h2V3c0-1.1-.9-1.99-2-1.99L7 1c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M15.41 16.59L20 12l-4.59-4.59L14 8.83 17.17 12 14 15.17l1.41 1.42z"/><path d="M10 15.17L6.83 12 10 8.83 8.59 7.41 4 12l4.59 4.59L10 15.17z"/><path d="M17 19H7v-2H5v4c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2v-4h-2v2z"/>',
		'devices': '<path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6z"/><path d="M22 17h-4v-7h4v7zm1-9h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
		'dvr': '<path d="M21 17H3V5h18v12zm0-14H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2z"/><path d="M7 8H5v2h2V8zm12 0H8v2h11V8z"/><path d="M7 12H5v2h2v-2zm12 0H8v2h11v-2z"/>',
		'gps_fixed': '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm8.94-8c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06z"/>',
		'gps_not_fixed': '<path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
		'gps_off': '<path d="M20.94 11A8.994 8.994 0 0 0 13 3.06V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5A6.995 6.995 0 0 1 19 12c0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06z"/><path d="M16.27 17.54a6.995 6.995 0 0 1-9.81-9.81l9.81 9.81zM3 4.27l2.04 2.04A8.914 8.914 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27z"/>',
		'graphic_eq': '<path d="M7 18h2V6H7v12z"/><path d="M11 22h2V2h-2v20z"/><path d="M3 14h2v-4H3v4z"/><path d="M15 18h2V6h-2v12z"/><path d="M19 10v4h2v-4h-2z"/>',
		'location_disabled': '<path d="M20.94 11A8.994 8.994 0 0 0 13 3.06V1h-2v2.06c-1.13.12-2.19.46-3.16.97l1.5 1.5A6.995 6.995 0 0 1 19 12c0 .94-.19 1.84-.52 2.65l1.5 1.5c.5-.96.84-2.02.97-3.15H23v-2h-2.06z"/><path d="M16.27 17.54a6.995 6.995 0 0 1-9.81-9.81l9.81 9.81zM3 4.27l2.04 2.04A8.914 8.914 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06c1.77-.2 3.38-.91 4.69-1.98L19.73 21 21 19.73 4.27 3 3 4.27z"/>',
		'location_searching': '<path d="M20.94 11c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>',
		'network_cell': '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M17 7L2 22h15z"/>',
		'network_wifi': '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z"/>',
		'nfc': '<path d="M20 20H4V4h16v16zm0-18H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M18 6h-5c-1.1 0-2 .9-2 2v2.28c-.6.35-1 .98-1 1.72 0 1.1.9 2 2 2s2-.9 2-2c0-.74-.4-1.38-1-1.72V8h3v8H8V8h2V6H6v12h12V6z"/>',
		'screen_lock_landscape': '<path d="M19 17H5V7h14v10zm2-12H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M10.8 10c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zm-.8 6h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1z"/>',
		'screen_lock_portrait': '<path d="M10.8 10c0-.66.54-1.2 1.2-1.2.66 0 1.2.54 1.2 1.2v1h-2.4v-1zm-.8 6h4c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1v-1c0-1.11-.9-2-2-2-1.11 0-2 .9-2 2v1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1z"/><path d="M17 19H7V5h10v14zm0-18H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'screen_lock_rotation': '<path d="M23.25 12.77l-2.57-2.57-1.41 1.41 2.22 2.22-5.66 5.66L4.51 8.17l5.66-5.66 2.1 2.1 1.41-1.41L11.23.75c-.59-.59-1.54-.59-2.12 0L2.75 7.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12z"/><path d="M8.47 20.48C5.2 18.94 2.86 15.76 2.5 12H1c.51 6.16 5.66 11 11.95 11l.66-.03-3.81-3.82-1.33 1.33z"/><path d="M16.8 2.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V3h-3.4v-.5zM16 9h5c.55 0 1-.45 1-1V4c0-.55-.45-1-1-1v-.5C21 1.12 19.88 0 18.5 0S16 1.12 16 2.5V3c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1z"/>',
		'screen_rotation': '<path d="M16.48 2.52c3.27 1.55 5.61 4.72 5.97 8.48h1.5C23.44 4.84 18.29 0 12 0l-.66.03 3.81 3.81 1.33-1.32z"/><path d="M14.83 21.19L2.81 9.17l6.36-6.36 12.02 12.02-6.36 6.36zm-4.6-19.44c-.59-.59-1.54-.59-2.12 0L1.75 8.11c-.59.59-.59 1.54 0 2.12l12.02 12.02c.59.59 1.54.59 2.12 0l6.36-6.36c.59-.59.59-1.54 0-2.12L10.23 1.75z"/><path d="M7.52 21.48C4.25 19.94 1.91 16.76 1.55 13H.05C.56 19.16 5.71 24 12 24l.66-.03-3.81-3.81-1.33 1.32z"/>',
		'sd_storage': '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z"/>',
		'settings_system_daydream': '<path d="M9 16h6.5c1.38 0 2.5-1.12 2.5-2.5S16.88 11 15.5 11h-.05c-.24-1.69-1.69-3-3.45-3-1.4 0-2.6.83-3.16 2.02h-.16C7.17 10.18 6 11.45 6 13c0 1.66 1.34 3 3 3z"/><path d="M21 19.01H3V4.99h18v14.02zM21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'signal_cellular_4_bar': '<path d="M2 22h20V2z"/>',
		'signal_cellular_connected_no_internet_4_bar': '<path d="M20 18h2v-8h-2v8z"/><path d="M20 22h2v-2h-2v2z"/><path d="M2 22h16V8h4V2L2 22z"/>',
		'signal_cellular_no_sim': '<path d="M18.99 5c0-1.1-.89-2-1.99-2h-7L7.66 5.34 19 16.68 18.99 5z"/><path d="M3.65 3.88L2.38 5.15 5 7.77V19c0 1.1.9 2 2 2h10.01c.35 0 .67-.1.96-.26l1.88 1.88 1.27-1.27L3.65 3.88z"/>',
		'signal_cellular_null': '<path d="M20 6.83V20H6.83L20 6.83M22 2L2 22h20V2z"/>',
		'signal_cellular_off': '<path d="M21 1l-8.59 8.59L21 18.18V1z"/><path d="M4.77 4.5L3.5 5.77l6.36 6.36L1 21h17.73l2 2L22 21.73 4.77 4.5z"/>',
		'signal_wifi_4_bar': '<path d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>',
		'signal_wifi_4_bar_lock': '<path d="M22 16h-3v-1.5c0-.8.7-1.5 1.5-1.5s1.5.7 1.5 1.5V16zm1 0v-1.5c0-1.4-1.1-2.5-2.5-2.5S18 13.1 18 14.5V16c-.5 0-1 .5-1 1v4c0 .5.5 1 1 1h5c.5 0 1-.5 1-1v-4c0-.5-.5-1-1-1z"/><path d="M15.5 14.5c0-2.8 2.2-5 5-5 .4 0 .7 0 1 .1L23.6 7c-.4-.3-4.9-4-11.6-4C5.3 3 .8 6.7.4 7L12 21.5l3.5-4.4v-2.6z"/>',
		'signal_wifi_off': '<path d="M23.64 7c-.45-.34-4.93-4-11.64-4-1.5 0-2.89.19-4.15.48L18.18 13.8 23.64 7z"/><path d="M17.04 15.22L3.27 1.44 2 2.72l2.05 2.06C1.91 5.76.59 6.82.36 7l11.63 14.49.01.01.01-.01 3.9-4.86 3.32 3.32 1.27-1.27-3.46-3.46z"/>',
		'storage': '<path d="M4 17h2v2H4v-2zm-2 3h20v-4H2v4z"/><path d="M6 7H4V5h2v2zM2 4v4h20V4H2z"/><path d="M4 11h2v2H4v-2zm-2 3h20v-4H2v4z"/>',
		'usb': '<path d="M15 7v4h1v2h-3V5h2l-3-4-3 4h2v8H8v-2.07c.7-.37 1.2-1.08 1.2-1.93 0-1.21-.99-2.2-2.2-2.2-1.21 0-2.2.99-2.2 2.2 0 .85.5 1.56 1.2 1.93V13c0 1.11.89 2 2 2h3v3.05c-.71.37-1.2 1.1-1.2 1.95 0 1.22.99 2.2 2.2 2.2 1.21 0 2.2-.98 2.2-2.2 0-.85-.49-1.58-1.2-1.95V15h3c1.11 0 2-.89 2-2v-2h1V7h-4z"/>',
		'wallpaper': '<path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4z"/><path d="M10 13l-4 5h12l-3-4-2.03 2.71L10 13z"/><path d="M17 8.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5z"/><path d="M20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2z"/><path d="M20 20h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>',
		'wifi_lock': '<path d="M20.5 9.5c.28 0 .55.04.81.08L24 6c-3.34-2.51-7.5-4-12-4S3.34 3.49 0 6l12 16 3.5-4.67V14.5c0-2.76 2.24-5 5-5z"/><path d="M22 16h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16zm1 0v-1.5c0-1.38-1.12-2.5-2.5-2.5S18 13.12 18 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"/>',
		'wifi_tethering': '<path d="M12 11c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 13c0-3.31-2.69-6-6-6s-6 2.69-6 6c0 2.22 1.21 4.15 3 5.19l1-1.74c-1.19-.7-2-1.97-2-3.45 0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.48-.81 2.75-2 3.45l1 1.74c1.79-1.04 3-2.97 3-5.19z"/><path d="M12 3C6.48 3 2 7.48 2 13c0 3.7 2.01 6.92 4.99 8.65l1-1.73C5.61 18.53 4 15.96 4 13c0-4.42 3.58-8 8-8s8 3.58 8 8c0 2.96-1.61 5.53-4 6.92l1 1.73c2.99-1.73 5-4.95 5-8.65 0-5.52-4.48-10-10-10z"/>',
		//
		// editor
		//
		'attach_file': '<path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>',
		'attach_money': '<path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>',
		'border_all': '<path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/>',
		'border_bottom': '<path d="M9 11H7v2h2v-2z"/><path d="M13 15h-2v2h2v-2z"/><path d="M9 3H7v2h2V3z"/><path d="M13 11h-2v2h2v-2z"/><path d="M5 3H3v2h2V3z"/><path d="M13 7h-2v2h2V7z"/><path d="M17 11h-2v2h2v-2z"/><path d="M13 3h-2v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M5 7H3v2h2V7z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M5 11H3v2h2v-2z"/><path d="M3 21h18v-2H3v2z"/><path d="M5 15H3v2h2v-2z"/>',
		'border_clear': '<path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M11 5h2V3h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/>',
		'border_color': '<path d="M17.75 7L14 3.25l-10 10V17h3.75l10-10zm2.96-2.96c.39-.39.39-1.02 0-1.41L18.37.29c-.39-.39-1.02-.39-1.41 0L15 2.25 18.75 6l1.96-1.96z"/><path fill-opacity=".36" d="M0 20h24v4H0z"/>',
		'border_horizontal': '<path d="M3 21h2v-2H3v2z"/><path d="M5 7H3v2h2V7z"/><path d="M3 17h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M5 3H3v2h2V3z"/><path d="M9 3H7v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M13 7h-2v2h2V7z"/><path d="M13 3h-2v2h2V3z"/><path d="M19 17h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/>',
		'border_inner': '<path d="M3 21h2v-2H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M5 7H3v2h2V7z"/><path d="M3 17h2v-2H3v2z"/><path d="M9 3H7v2h2V3z"/><path d="M5 3H3v2h2V3z"/><path d="M17 3h-2v2h2V3z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M13 3h-2v8H3v2h8v8h2v-8h8v-2h-8V3z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/>',
		'border_left': '<path d="M11 21h2v-2h-2v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M11 5h2V3h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 21h2V3H3v18z"/><path d="M19 9h2V7h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/>',
		'border_outer': '<path d="M13 7h-2v2h2V7z"/><path d="M13 11h-2v2h2v-2z"/><path d="M17 11h-2v2h2v-2z"/><path d="M19 19H5V5h14v14zM3 3v18h18V3H3z"/><path d="M13 15h-2v2h2v-2z"/><path d="M9 11H7v2h2v-2z"/>',
		'border_right': '<path d="M7 21h2v-2H7v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/><path d="M19 3v18h2V3h-2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M11 5h2V3h-2v2z"/><path d="M11 9h2V7h-2v2z"/>',
		'border_style': '<path d="M15 21h2v-2h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M3 3v18h2V5h16V3H3z"/><path d="M19 9h2V7h-2v2z"/>',
		'border_top': '<path d="M7 21h2v-2H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M11 13h2v-2h-2v2z"/><path d="M11 21h2v-2h-2v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 9h2V7H3v2z"/><path d="M11 17h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M3 3v2h18V3H3z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M11 9h2V7h-2v2z"/><path d="M19 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/>',
		'border_vertical': '<path d="M3 9h2V7H3v2z"/><path d="M3 5h2V3H3v2z"/><path d="M7 21h2v-2H7v2z"/><path d="M7 13h2v-2H7v2z"/><path d="M3 13h2v-2H3v2z"/><path d="M3 21h2v-2H3v2z"/><path d="M3 17h2v-2H3v2z"/><path d="M7 5h2V3H7v2z"/><path d="M19 17h2v-2h-2v2z"/><path d="M11 21h2V3h-2v18z"/><path d="M19 21h2v-2h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 3v2h2V3h-2z"/><path d="M19 9h2V7h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M15 21h2v-2h-2v2z"/><path d="M15 13h2v-2h-2v2z"/>',
		'bubble_chart': '<circle cx="7.2" cy="14.4" r="3.2"/><circle cx="14.8" cy="18" r="2"/><circle cx="15.2" cy="8.8" r="4.8"/>',
		'drag_handle': '<path d="M20 9H4v2h16V9z"/><path d="M4 15h16v-2H4v2z"/>',
		'format_align_center': '<path d="M7 15v2h10v-2H7z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M7 7v2h10V7H7z"/><path d="M3 3v2h18V3H3z"/>',
		'format_align_justify': '<path d="M3 21h18v-2H3v2z"/><path d="M3 17h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 9h18V7H3v2z"/><path d="M3 3v2h18V3H3z"/>',
		'format_align_left': '<path d="M15 15H3v2h12v-2z"/><path d="M15 7H3v2h12V7z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 3v2h18V3H3z"/>',
		'format_align_right': '<path d="M3 21h18v-2H3v2z"/><path d="M9 17h12v-2H9v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M9 9h12V7H9v2z"/><path d="M3 3v2h18V3H3z"/>',
		'format_bold': '<path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>',
		'format_clear': '<path d="M3.27 5L2 6.27l6.97 6.97L6.5 19h3l1.57-3.66L16.73 21 18 19.73 3.55 5.27 3.27 5z"/><path d="M6 5v.18L8.82 8h2.4l-.72 1.68 2.1 2.1L14.21 8H20V5H6z"/>',
		'format_color_fill': '<path d="M16.56 8.94L7.62 0 6.21 1.41l2.38 2.38-5.15 5.15c-.59.59-.59 1.54 0 2.12l5.5 5.5c.29.29.68.44 1.06.44s.77-.15 1.06-.44l5.5-5.5c.59-.58.59-1.53 0-2.12zM5.21 10L10 5.21 14.79 10H5.21zM19 11.5s-2 2.17-2 3.5c0 1.1.9 2 2 2s2-.9 2-2c0-1.33-2-3.5-2-3.5z"/><path fill-opacity=".36" d="M0 20h24v4H0z"/>',
		'format_color_reset': '<path d="M18 14c0-4-6-10.8-6-10.8s-1.33 1.51-2.73 3.52l8.59 8.59c.09-.42.14-.86.14-1.31z"/><path d="M17.12 17.12L12.5 12.5 5.27 5.27 4 6.55l3.32 3.32C6.55 11.32 6 12.79 6 14c0 3.31 2.69 6 6 6 1.52 0 2.9-.57 3.96-1.5l2.63 2.63 1.27-1.27-2.74-2.74z"/>',
		'format_color_text': '<path fill-opacity=".36" d="M0 20h24v4H0z"/><path d="M11 3L5.5 17h2.25l1.12-3h6.25l1.12 3h2.25L13 3h-2zm-1.38 9L12 5.67 14.38 12H9.62z"/>',
		'format_indent_decrease': '<path d="M11 17h10v-2H11v2z"/><path d="M3 12l4 4V8l-4 4z"/><path d="M3 21h18v-2H3v2z"/><path d="M3 3v2h18V3H3z"/><path d="M11 9h10V7H11v2z"/><path d="M11 13h10v-2H11v2z"/>',
		'format_indent_increase': '<path d="M3 21h18v-2H3v2z"/><path d="M3 8v8l4-4-4-4z"/><path d="M11 17h10v-2H11v2z"/><path d="M3 3v2h18V3H3z"/><path d="M11 9h10V7H11v2z"/><path d="M11 13h10v-2H11v2z"/>',
		'format_italic': '<path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4z"/>',
		'format_line_spacing': '<path d="M6 7h2.5L5 3.5 1.5 7H4v10H1.5L5 20.5 8.5 17H6V7z"/><path d="M10 5v2h12V5H10z"/><path d="M10 19h12v-2H10v2z"/><path d="M10 13h12v-2H10v2z"/>',
		'format_list_bulleted': '<path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M4 4.5c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5z"/><path d="M4 16.67c-.74 0-1.33.6-1.33 1.33 0 .73.6 1.33 1.33 1.33.73 0 1.33-.6 1.33-1.33 0-.73-.59-1.33-1.33-1.33z"/><path d="M7 19h14v-2H7v2z"/><path d="M7 13h14v-2H7v2z"/><path d="M7 5v2h14V5H7z"/>',
		'format_list_numbered': '<path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1z"/><path d="M3 8h1V4H2v1h1v3z"/><path d="M2 11h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1z"/><path d="M7 5v2h14V5H7z"/><path d="M7 19h14v-2H7v2z"/><path d="M7 13h14v-2H7v2z"/>',
		'format_paint': '<path d="M18 4V3c0-.55-.45-1-1-1H5c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6h1v4H9v11c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-9h8V4h-3z"/>',
		'format_quote': '<path d="M6 17h3l2-4V7H5v6h3z"/><path d="M14 17h3l2-4V7h-6v6h3z"/>',
		'format_shapes': '<path d="M19 5V3h2v2h-2zm2 16h-2v-2h2v2zm-4-2H7v-2H5V7h2V5h10v2h2v10h-2v2zM5 21H3v-2h2v2zM3 3h2v2H3V3zm20 4V1h-6v2H7V1H1v6h2v10H1v6h6v-2h10v2h6v-6h-2V7h2z"/><path d="M10.69 12.74h2.61L12 8.91l-1.31 3.83zM13.73 14h-3.49l-.73 2H7.89l3.4-9h1.4l3.41 9h-1.63l-.74-2z"/>',
		'format_size': '<path d="M9 4v3h5v12h3V7h5V4H9z"/><path d="M3 12h3v7h3v-7h3V9H3v3z"/>',
		'format_strikethrough': '<path d="M10 19h4v-3h-4v3z"/><path d="M5 4v3h5v3h4V7h5V4H5z"/><path d="M3 14h18v-2H3v2z"/>',
		'format_textdirection_l_to_r': '<path d="M9 10v5h2V4h2v11h2V4h2V2H9C6.79 2 5 3.79 5 6s1.79 4 4 4z"/><path d="M21 18l-4-4v3H5v2h12v3l4-4z"/>',
		'format_textdirection_r_to_l': '<path d="M10 10v5h2V4h2v11h2V4h2V2h-8C7.79 2 6 3.79 6 6s1.79 4 4 4z"/><path d="M8 17v-3l-4 4 4 4v-3h12v-2H8z"/>',
		'format_underline': '<path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6z"/><path d="M5 19v2h14v-2H5z"/>',
		'functions': '<path d="M18 4H6v2l6.5 6L6 18v2h12v-3h-7l5-5-5-5h7z"/>',
		'highlight': '<path d="M6 14l3 3v5h6v-5l3-3V9H6z"/><path d="M11 2h2v3h-2z"/><path d="M3.5 5.875L4.914 4.46l2.12 2.122L5.62 7.997z"/><path d="M16.96 6.585l2.123-2.12 1.414 1.414L18.375 8z"/>',
		'insert_chart': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
		'insert_comment': '<path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>',
		'insert_drive_file': '<path d="M6 2c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6H6zm7 7V3.5L18.5 9H13z"/>',
		'insert_emoticon': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
		'insert_invitation': '<path d="M17 12h-5v5h5v-5z"/><path d="M19 19H5V8h14v11zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2z"/>',
		'insert_link': '<path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1z"/><path d="M8 13h8v-2H8v2z"/><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>',
		'insert_photo': '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
		'linear_scale': '<path d="M19.5 9.5c-1.03 0-1.9.62-2.29 1.5h-2.92c-.39-.88-1.26-1.5-2.29-1.5s-1.9.62-2.29 1.5H6.79c-.39-.88-1.26-1.5-2.29-1.5C3.12 9.5 2 10.62 2 12s1.12 2.5 2.5 2.5c1.03 0 1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5s1.9-.62 2.29-1.5h2.92c.39.88 1.26 1.5 2.29 1.5 1.38 0 2.5-1.12 2.5-2.5s-1.12-2.5-2.5-2.5z"/>',
		'merge_type': '<path d="M17 20.41L18.41 19 15 15.59 13.59 17 17 20.41z"/><path d="M7.5 8H11v5.59L5.59 19 7 20.41l6-6V8h3.5L12 3.5 7.5 8z"/>',
		'mode_comment': '<path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z"/>',
		'mode_edit': '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
		'monetization_on': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>',
		'money_off': '<path d="M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-.53.12-1.03.3-1.48.54l1.47 1.47c.41-.17.91-.27 1.51-.27z"/><path d="M5.33 4.06L4.06 5.33 7.5 8.77c0 2.08 1.56 3.21 3.91 3.91l3.51 3.51c-.34.48-1.05.91-2.42.91-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c.96-.18 1.82-.55 2.45-1.12l2.22 2.22 1.27-1.27L5.33 4.06z"/>',
		'multiline_chart': '<path d="M22 6.92l-1.41-1.41-2.85 3.21C15.68 6.4 12.83 5 9.61 5 6.72 5 4.07 6.16 2 8l1.42 1.42C5.12 7.93 7.27 7 9.61 7c2.74 0 5.09 1.26 6.77 3.24l-2.88 3.24-4-4L2 16.99l1.5 1.5 6-6.01 4 4 4.05-4.55c.75 1.35 1.25 2.9 1.44 4.55H21c-.22-2.3-.95-4.39-2.04-6.14L22 6.92z"/>',
		'pie_chart': '<path d="M11 2v20c-5.07-.5-9-4.79-9-10s3.93-9.5 9-10z"/><path d="M13.03 2v8.99H22c-.47-4.74-4.24-8.52-8.97-8.99z"/><path d="M13.03 13.01V22c4.74-.47 8.5-4.25 8.97-8.99h-8.97z"/>',
		'pie_chart_outline': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 2.07c3.61.45 6.48 3.33 6.93 6.93H13V4.07zM4 12c0-4.06 3.07-7.44 7-7.93v15.87c-3.93-.5-7-3.88-7-7.94zm9 7.93V13h6.93c-.45 3.61-3.32 6.48-6.93 6.93z"/>',
		'publish': '<path d="M5 4v2h14V4H5z"/><path d="M5 14h4v6h6v-6h4l-7-7-7 7z"/>',
		'short_text': '<path d="M4 9h16v2H4z"/><path d="M4 13h10v2H4z"/>',
		'show_chart': '<path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>',
		'space_bar': '<path d="M18 9v4H6V9H4v6h16V9z"/>',
		'strikethrough_s': '<path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29a5.73 5.73 0 0 1 1.7-.83c.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25z"/><path d="M21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13s-.66-.23-.91-.42c-.25-.19-.45-.44-.59-.75-.14-.31-.25-.76-.25-1.21H6.4c0 .55.08 1.13.24 1.58.16.45.37.85.65 1.21.28.35.6.66.98.92.37.26.78.48 1.22.65.44.17.9.3 1.38.39.48.08.96.13 1.44.13.8 0 1.53-.09 2.18-.28.65-.19 1.21-.45 1.67-.79.46-.34.82-.77 1.07-1.27.25-.5.38-1.07.38-1.71 0-.6-.1-1.14-.31-1.61-.05-.11-.11-.23-.17-.33H21z"/>',
		'text_fields': '<path d="M2.5 4v3h5v12h3V7h5V4h-13z"/><path d="M21.5 9h-9v3h3v7h3v-7h3V9z"/>',
		'title': '<path d="M5 4v3h5.5v12h3V7H19V4z"/>',
		'vertical_align_bottom': '<path d="M16 13h-3V3h-2v10H8l4 4 4-4z"/><path d="M4 19v2h16v-2H4z"/>',
		'vertical_align_center': '<path d="M8 19h3v4h2v-4h3l-4-4-4 4z"/><path d="M16 5h-3V1h-2v4H8l4 4 4-4z"/><path d="M4 11v2h16v-2H4z"/>',
		'vertical_align_top': '<path d="M8 11h3v10h2V11h3l-4-4-4 4z"/><path d="M4 3v2h16V3H4z"/>',
		'wrap_text': '<path d="M4 19h6v-2H4v2z"/><path d="M20 5H4v2h16V5z"/><path d="M17 11H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3 3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"/>',
		//
		// file
		//
		'attachment': '<path d="M7.5 18C4.46 18 2 15.54 2 12.5S4.46 7 7.5 7H18c2.21 0 4 1.79 4 4s-1.79 4-4 4H9.5C8.12 15 7 13.88 7 12.5S8.12 10 9.5 10H17v1.5H9.5c-.55 0-1 .45-1 1s.45 1 1 1H18c1.38 0 2.5-1.12 2.5-2.5S19.38 8.5 18 8.5H7.5c-2.21 0-4 1.79-4 4s1.79 4 4 4H17V18H7.5z"/>',
		'cloud': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"/>',
		'cloud_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14H8c-1.66 0-3-1.34-3-3s1.34-3 3-3l.14.01C8.58 8.28 10.13 7 12 7c2.21 0 4 1.79 4 4h.5c1.38 0 2.5 1.12 2.5 2.5S17.88 16 16.5 16z"/>',
		'cloud_done': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM10 17l-3.5-3.5 1.41-1.41L10 14.17 15.18 9l1.41 1.41L10 17z"/>',
		'cloud_download': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM17 13l-5 5-5-5h3V9h4v4h3z"/>',
		'cloud_off': '<path d="M19.35 10.04A7.49 7.49 0 0 0 12 4c-1.48 0-2.85.43-4.01 1.17l1.46 1.46a5.497 5.497 0 0 1 8.05 4.87v.5H19c1.66 0 3 1.34 3 3 0 1.13-.64 2.11-1.56 2.62l1.45 1.45C23.16 18.16 24 16.68 24 15c0-2.64-2.05-4.78-4.65-4.96z"/><path d="M7.73 10l8 8H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h1.73zM3 5.27l2.75 2.74C2.56 8.15 0 10.77 0 14c0 3.31 2.69 6 6 6h11.73l2 2L21 20.73 4.27 4 3 5.27z"/>',
		'cloud_queue': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4h.71C7.37 7.69 9.48 6 12 6c3.04 0 5.5 2.46 5.5 5.5v.5H19c1.66 0 3 1.34 3 3s-1.34 3-3 3z"/>',
		'cloud_upload': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z"/>',
		'create_new_folder': '<path d="M20 6h-8l-2-2H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-1 8h-3v3h-2v-3h-3v-2h3V9h2v3h3v2z"/>',
		'file_download': '<path d="M19 9h-4V3H9v6H5l7 7 7-7z"/><path d="M5 18v2h14v-2H5z"/>',
		'file_upload': '<path d="M9 16h6v-6h4l-7-7-7 7h4z"/><path d="M5 18h14v2H5z"/>',
		'folder': '<path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>',
		'folder_open': '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"/>',
		'folder_shared': '<path d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-5 3c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm4 8h-8v-1c0-1.33 2.67-2 4-2s4 .67 4 2v1z"/>',
		//
		// hardware
		//
		'cast': '<path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M1 18v3h3c0-1.66-1.34-3-3-3z"/><path d="M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/>',
		'cast_connected': '<path d="M1 18v3h3c0-1.66-1.34-3-3-3z"/><path d="M1 14v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M19 7H5v1.63c3.96 1.28 7.09 4.41 8.37 8.37H19V7z"/><path d="M1 10v2c4.97 0 9 4.03 9 9h2c0-6.08-4.93-11-11-11z"/><path d="M21 3H3c-1.1 0-2 .9-2 2v3h2V5h18v14h-7v2h7c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'computer': '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>',
		'desktop_mac': '<path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 12H3V4h18v10z"/>',
		'desktop_windows': '<path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/>',
		'developer_dashboard': '<path d="M18 19H4V5h14v14zm4-10V7h-2V5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2v-2h-2V9h2z"/><path d="M6 13h5v4H6z"/><path d="M12 7h4v3h-4z"/><path d="M6 7h5v5H6z"/><path d="M12 11h4v6h-4z"/>',
		'device_hub': '<path d="M17 16l-4-4V8.82C14.16 8.4 15 7.3 15 6c0-1.66-1.34-3-3-3S9 4.34 9 6c0 1.3.84 2.4 2 2.82V12l-4 4H3v5h5v-3.05l4-4.2 4 4.2V21h5v-5h-4z"/>',
		'devices_other': '<path d="M3 6h18V4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h4v-2H3V6z"/><path d="M11 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm2-5.5H9v1.78c-.61.55-1 1.33-1 2.22 0 .89.39 1.67 1 2.22V20h4v-1.78c.61-.55 1-1.34 1-2.22 0-.88-.39-1.67-1-2.22V12z"/><path d="M21 18h-4v-8h4v8zm1-10h-6c-.5 0-1 .5-1 1v10c0 .5.5 1 1 1h6c.5 0 1-.5 1-1V9c0-.5-.5-1-1-1z"/>',
		'dock': '<path d="M8 23h8v-2H8v2z"/><path d="M16 15H8V5h8v10zm0-13.99L8 1c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
		'gamepad': '<path d="M15 7.5V2H9v5.5l3 3 3-3z"/><path d="M7.5 9H2v6h5.5l3-3-3-3z"/><path d="M9 16.5V22h6v-5.5l-3-3-3 3z"/><path d="M16.5 9l-3 3 3 3H22V9h-5.5z"/>',
		'headset': '<path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"/>',
		'headset_mic': '<path d="M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h4v1h-7v2h6c1.66 0 3-1.34 3-3V10c0-4.97-4.03-9-9-9z"/>',
		'keyboard': '<path d="M20 5H4c-1.1 0-1.99.9-1.99 2L2 17c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm-9 3h2v2h-2V8zm0 3h2v2h-2v-2zM8 8h2v2H8V8zm0 3h2v2H8v-2zm-1 2H5v-2h2v2zm0-3H5V8h2v2zm9 7H8v-2h8v2zm0-4h-2v-2h2v2zm0-3h-2V8h2v2zm3 3h-2v-2h2v2zm0-3h-2V8h2v2z"/>',
		'keyboard_arrow_down': '<path d="M7.41 7.84L12 12.42l4.59-4.58L18 9.25l-6 6-6-6z"/>',
		'keyboard_arrow_left': '<path d="M15.41 16.09l-4.58-4.59 4.58-4.59L14 5.5l-6 6 6 6z"/>',
		'keyboard_arrow_right': '<path d="M8.59 16.34l4.58-4.59-4.58-4.59L10 5.75l6 6-6 6z"/>',
		'keyboard_arrow_up': '<path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"/>',
		'keyboard_backspace': '<path d="M21 11H6.83l3.58-3.59L9 6l-6 6 6 6 1.41-1.41L6.83 13H21z"/>',
		'keyboard_capslock': '<path d="M12 8.41L16.59 13 18 11.59l-6-6-6 6L7.41 13 12 8.41z"/><path d="M6 18h12v-2H6v2z"/>',
		'keyboard_hide': '<path d="M19 8h-2V6h2v2zm0 3h-2V9h2v2zm-3-3h-2V6h2v2zm0 3h-2V9h2v2zm0 4H8v-2h8v2zM7 8H5V6h2v2zm0 3H5V9h2v2zm1-2h2v2H8V9zm0-3h2v2H8V6zm3 3h2v2h-2V9zm0-3h2v2h-2V6zm9-3H4c-1.1 0-1.99.9-1.99 2L2 15c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M12 23l4-4H8l4 4z"/>',
		'keyboard_return': '<path d="M19 7v4H5.83l3.58-3.59L8 6l-6 6 6 6 1.41-1.41L5.83 13H21V7z"/>',
		'keyboard_tab': '<path d="M11.59 7.41L15.17 11H1v2h14.17l-3.59 3.59L13 18l6-6-6-6-1.41 1.41z"/><path d="M20 6v12h2V6h-2z"/>',
		'keyboard_voice': '<path d="M12 15c1.66 0 2.99-1.34 2.99-3L15 6c0-1.66-1.34-3-3-3S9 4.34 9 6v6c0 1.66 1.34 3 3 3z"/><path d="M17.3 12c0 3-2.54 5.1-5.3 5.1S6.7 15 6.7 12H5c0 3.42 2.72 6.23 6 6.72V22h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"/>',
		'laptop': '<path d="M20 18c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2H0v2h24v-2h-4zM4 6h16v10H4V6z"/>',
		'laptop_chromebook': '<path d="M22 18V3H2v15H0v2h24v-2h-2zm-8 0h-4v-1h4v1zm6-3H4V5h16v10z"/>',
		'laptop_mac': '<path d="M20 18c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2H0c0 1.1.9 2 2 2h20c1.1 0 2-.9 2-2h-4zM4 5h16v11H4V5zm8 14c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
		'laptop_windows': '<path d="M20 18v-1c1.1 0 1.99-.9 1.99-2L22 5c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2v1H0v2h24v-2h-4zM4 5h16v10H4V5z"/>',
		'memory': '<path d="M13 13h-2v-2h2v2zm2-4H9v6h6V9z"/><path d="M17 17H7V7h10v10zm4-6V9h-2V7c0-1.1-.9-2-2-2h-2V3h-2v2h-2V3H9v2H7c-1.1 0-2 .9-2 2v2H3v2h2v2H3v2h2v2c0 1.1.9 2 2 2h2v2h2v-2h2v2h2v-2h2c1.1 0 2-.9 2-2v-2h2v-2h-2v-2h2z"/>',
		'mouse': '<path d="M13 1.07V9h7c0-4.08-3.05-7.44-7-7.93z"/><path d="M4 15c0 4.42 3.58 8 8 8s8-3.58 8-8v-4H4v4z"/><path d="M11 1.07C7.05 1.56 4 4.92 4 9h7V1.07z"/>',
		'phone_android': '<path d="M16 1H8C6.34 1 5 2.34 5 4v16c0 1.66 1.34 3 3 3h8c1.66 0 3-1.34 3-3V4c0-1.66-1.34-3-3-3zm-2 20h-4v-1h4v1zm3.25-3H6.75V4h10.5v14z"/>',
		'phone_iphone': '<path d="M15.5 1h-8C6.12 1 5 2.12 5 3.5v17C5 21.88 6.12 23 7.5 23h8c1.38 0 2.5-1.12 2.5-2.5v-17C18 2.12 16.88 1 15.5 1zm-4 21c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5-4H7V4h9v14z"/>',
		'phonelink': '<path d="M4 6h18V4H4c-1.1 0-2 .9-2 2v11H0v3h14v-3H4V6z"/><path d="M22 17h-4v-7h4v7zm1-9h-6c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h6c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
		'phonelink_off': '<path d="M22 6V4H6.82l2 2H22z"/><path d="M4 6.27L14.73 17H4V6.27zM1.92 1.65L.65 2.92l1.82 1.82C2.18 5.08 2 5.52 2 6v11H0v3h17.73l2.35 2.35 1.27-1.27L3.89 3.62 1.92 1.65z"/><path d="M23 8h-6c-.55 0-1 .45-1 1v4.18l2 2V10h4v7h-2.18l3 3H23c.55 0 1-.45 1-1V9c0-.55-.45-1-1-1z"/>',
		'power_input': '<path d="M2 9v2h19V9H2z"/><path d="M2 15h5v-2H2v2z"/><path d="M9 15h5v-2H9v2z"/><path d="M16 15h5v-2h-5v2z"/>',
		'router': '<path d="M20.2 5.9l.8-.8C19.6 3.7 17.8 3 16 3c-1.8 0-3.6.7-5 2.1l.8.8C13 4.8 14.5 4.2 16 4.2s3 .6 4.2 1.7z"/><path d="M19.3 6.7c-.9-.9-2.1-1.4-3.3-1.4-1.2 0-2.4.5-3.3 1.4l.8.8c.7-.7 1.6-1 2.5-1 .9 0 1.8.3 2.5 1l.8-.8z"/><path d="M15 18h-2v-2h2v2zm-3.5 0h-2v-2h2v2zM8 18H6v-2h2v2zm11-5h-2V9h-2v4H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-4c0-1.1-.9-2-2-2z"/>',
		'scanner': '<path d="M19.8 10.7L4.2 5l-.7 1.9L17.6 12H5c-1.1 0-2 .9-2 2v4c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-5.5c0-.8-.5-1.6-1.2-1.8zM7 17H5v-2h2v2zm12 0H9v-2h10v2z"/>',
		'security': '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>',
		'sim_card': '<path d="M19.99 4c0-1.1-.89-2-1.99-2h-8L4 8v12c0 1.1.9 2 2 2h12.01c1.1 0 1.99-.9 1.99-2l-.01-16zM9 19H7v-2h2v2zm8 0h-2v-2h2v2zm-8-4H7v-4h2v4zm4 4h-2v-4h2v4zm0-6h-2v-2h2v2zm4 2h-2v-4h2v4z"/>',
		'smartphone': '<path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>',
		'speaker': '<path d="M12 20c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-16c1.1 0 2 .9 2 2s-.9 2-2 2c-1.11 0-2-.9-2-2s.89-2 2-2zm5-2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 1.99 2 1.99L17 22c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><path d="M12 12c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
		'speaker_group': '<path d="M18.2 1H9.8C8.81 1 8 1.81 8 2.8v14.4c0 .99.81 1.79 1.8 1.79l8.4.01c.99 0 1.8-.81 1.8-1.8V2.8c0-.99-.81-1.8-1.8-1.8zM14 3c1.1 0 2 .89 2 2s-.9 2-2 2-2-.89-2-2 .9-2 2-2zm0 13.5c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/> <circle cx="14" cy="12.5" r="2.5"/> <path d="M6 5H4v16c0 1.1.89 2 2 2h10v-2H6V5z"/>',
		'tablet': '<path d="M21 4H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 1.99-.9 1.99-2L23 6c0-1.1-.9-2-2-2zm-2 14H5V6h14v12z"/>',
		'tablet_android': '<path d="M18 0H6C4.34 0 3 1.34 3 3v18c0 1.66 1.34 3 3 3h12c1.66 0 3-1.34 3-3V3c0-1.66-1.34-3-3-3zm-4 22h-4v-1h4v1zm5.25-3H4.75V3h14.5v16z"/>',
		'tablet_mac': '<path d="M18.5 0h-14C3.12 0 2 1.12 2 2.5v19C2 22.88 3.12 24 4.5 24h14c1.38 0 2.5-1.12 2.5-2.5v-19C21 1.12 19.88 0 18.5 0zm-7 23c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7.5-4H4V3h15v16z"/>',
		'toys': '<path d="M12 12c0-3 2.5-5.5 5.5-5.5S23 9 23 12H12z"/><path d="M12 12c0 3-2.5 5.5-5.5 5.5S1 15 1 12h11z"/><path d="M12 12c-3 0-5.5-2.5-5.5-5.5S9 1 12 1v11z"/><path d="M12 12c3 0 5.5 2.5 5.5 5.5S15 23 12 23V12z"/>',
		'tv': '<path d="M21 3H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.1-.9-2-2-2zm0 14H3V5h18v12z"/>',
		'vidiogame_asset': '<path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'watch': '<path d="M20 12c0-2.54-1.19-4.81-3.04-6.27L16 0H8l-.95 5.73C5.19 7.19 4 9.45 4 12s1.19 4.81 3.05 6.27L8 24h8l.96-5.73C18.81 16.81 20 14.54 20 12zM6 12c0-3.31 2.69-6 6-6s6 2.69 6 6-2.69 6-6 6-6-2.69-6-6z"/>',
		//
		// image
		//
		'add_a_photo': '<path d="M3 4V1h2v3h3v2H5v3H3V6H0V4h3z"/><path d="M13 19c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-7-9V7h3V4h7l1.83 2H21c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2V10h3z"/><path d="M9.8 14c0 1.77 1.43 3.2 3.2 3.2 1.77 0 3.2-1.43 3.2-3.2 0-1.77-1.43-3.2-3.2-3.2-1.77 0-3.2 1.43-3.2 3.2z"/>',
		'add_to_photos': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M19 11h-4v4h-2v-4H9V9h4V5h2v4h4v2zm1-9H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'adjust': '<path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2z"/><path d="M15 12c0 1.66-1.34 3-3 3s-3-1.34-3-3 1.34-3 3-3 3 1.34 3 3z"/>',
		'assistant_photo': '<path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/>',
		'audiotrack': '<path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>',
		'blur_circular': '<path d="M10 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M10 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M7 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 16.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M7 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 7.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M14 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 7.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M17 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M17 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M14 16.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M14 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/>',
		'blur_linear': '<path d="M5 17.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/><path d="M9 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M9 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M3 21h18v-2H3v2z"/><path d="M5 9.5c.83 0 1.5-.67 1.5-1.5S5.83 6.5 5 6.5 3.5 7.17 3.5 8 4.17 9.5 5 9.5z"/><path d="M5 13.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5.67 1.5 1.5 1.5z"/><path d="M9 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M17 16.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M3 3v2h18V3H3z"/><path d="M17 8.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M17 12.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M13 9c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13 13c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13 17c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/>',
		'blur_off': '<path d="M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M13.8 11.48l.2.02c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5-1.5.67-1.5 1.5l.02.2c.09.67.61 1.19 1.28 1.28z"/><path d="M14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M21 10.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 15c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 11c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M18 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M14 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M2.5 5.27l3.78 3.78L6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l2.81 2.81c-.71.11-1.25.73-1.25 1.47 0 .83.67 1.5 1.5 1.5.74 0 1.36-.54 1.47-1.25l2.81 2.81c-.09-.03-.18-.06-.28-.06-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1c0-.1-.03-.19-.06-.28l3.78 3.78L20 20.23 3.77 4 2.5 5.27z"/><path d="M10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/>',
		'blur_on': '<path d="M6 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M6 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M6 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M3 9.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M6 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 10.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M14 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M14 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M3 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 3.5c.28 0 .5-.22.5-.5s-.22-.5-.5-.5-.5.22-.5.5.22.5.5.5z"/><path d="M10 7c.55 0 1-.45 1-1s-.45-1-1-1-1 .45-1 1 .45 1 1 1z"/><path d="M10 12.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M18 13c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 9c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M18 5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M21 13.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M14 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 20.5c-.28 0-.5.22-.5.5s.22.5.5.5.5-.22.5-.5-.22-.5-.5-.5z"/><path d="M10 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M10 17c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/><path d="M14 12.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/><path d="M14 8.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5z"/>',
		'brightness_1': '<circle cx="12" cy="12" r="10"/>',
		'brightness_2': '<path d="M10 2c-1.82 0-3.53.5-5 1.35C7.99 5.08 10 8.3 10 12s-2.01 6.92-5 8.65C6.47 21.5 8.18 22 10 22c5.52 0 10-4.48 10-10S15.52 2 10 2z"/>',
		'brightness_3': '<path d="M9 2c-1.05 0-2.05.16-3 .46 4.06 1.27 7 5.06 7 9.54 0 4.48-2.94 8.27-7 9.54.95.3 1.95.46 3 .46 5.52 0 10-4.48 10-10S14.52 2 9 2z"/>',
		'brightness_4': '<path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
		'brightness_5': '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>',
		'brightness_6': '<path d="M20 15.31L23.31 12 20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69zM12 18V6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"/>',
		'brightness_7': '<path d="M12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm8-9.31V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69z"/><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
		'broken_image': '<path d="M21 5v6.59l-3-3.01-4 4.01-4-4-4 4-3-3.01V5c0-1.1.9-2 2-2h14c1.1 0 2 .9 2 2z"/><path d="M18 11.42l3 3.01V19c0 1.1-.9 2-2 2H5c-1.1 0-2-.9-2-2v-6.58l3 2.99 4-4 4 4 4-3.99z"/>',
		'brush': '<path d="M7 14c-1.66 0-3 1.34-3 3 0 1.31-1.16 2-2 2 .92 1.22 2.49 2 4 2 2.21 0 4-1.79 4-4 0-1.66-1.34-3-3-3z"/><path d="M20.71 4.63l-1.34-1.34c-.39-.39-1.02-.39-1.41 0L9 12.25 11.75 15l8.96-8.96c.39-.39.39-1.02 0-1.41z"/>',
		'burst_mode': '<path d="M1 5h2v14H1z"/><path d="M5 5h2v14H5z"/><path d="M11 17l2.5-3.15L15.29 16l2.5-3.22L21 17H11zM22 5H10c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h12c.55 0 1-.45 1-1V6c0-.55-.45-1-1-1z"/>',
		'camera': '<path d="M9.4 10.5l4.77-8.26C13.47 2.09 12.75 2 12 2c-2.4 0-4.6.85-6.32 2.25l3.66 6.35.06-.1z"/><path d="M21.54 9c-.92-2.92-3.15-5.26-6-6.34L11.88 9h9.66z"/><path d="M21.8 10h-7.49l.29.5 4.76 8.25C21 16.97 22 14.61 22 12c0-.69-.07-1.35-.2-2z"/><path d="M8.54 12l-3.9-6.75C3.01 7.03 2 9.39 2 12c0 .69.07 1.35.2 2h7.49l-1.15-2z"/><path d="M2.46 15c.92 2.92 3.15 5.26 6 6.34L12.12 15H2.46z"/><path d="M13.73 15l-3.9 6.76c.7.15 1.42.24 2.17.24 2.4 0 4.6-.85 6.32-2.25l-3.66-6.35-.93 1.6z"/>',
		'camera_alt': '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
		'camera_front': '<path d="M10 20H5v2h5v2l3-3-3-3v2z"/><path d="M14 20v2h5v-2h-5z"/><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-1.99.9-1.99 2S10.9 8 12 8z"/><path d="M7 2h10v10.5c0-1.67-3.33-2.5-5-2.5s-5 .83-5 2.5V2zm10-2H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z"/>',
		'camera_rear': '<path d="M10 20H5v2h5v2l3-3-3-3v2z"/><path d="M14 20v2h5v-2h-5z"/><path d="M12 6c-1.11 0-2-.9-2-2s.89-2 1.99-2 2 .9 2 2C14 5.1 13.1 6 12 6zm5-6H7C5.9 0 5 .9 5 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V2c0-1.1-.9-2-2-2z"/>',
		'camera_roll': '<path d="M14 5c0-1.1-.9-2-2-2h-1V2c0-.55-.45-1-1-1H6c-.55 0-1 .45-1 1v1H4c-1.1 0-2 .9-2 2v15c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2h8V5h-8zm-2 13h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2zm4 9h-2v-2h2v2zm0-9h-2V7h2v2z"/>',
		'center_focus_strong': '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/>',
		'center_focus_weak': '<path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M12 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
		'collections': '<path d="M11 12l2.03 2.71L16 11l4 5H8l3-4zm11 4V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/><path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>',
		'collections_bookmark': '<path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 10l-2.5-1.5L15 12V4h5v8z"/>',
		'color_lens': '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'colorize': '<path d="M20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-3.12 3.12-1.93-1.91-1.41 1.41 1.42 1.42L3 16.25V21h4.75l8.92-8.92 1.42 1.42 1.41-1.41-1.92-1.92 3.12-3.12c.4-.4.4-1.03.01-1.42zM6.92 19L5 17.08l8.06-8.06 1.92 1.92L6.92 19z"/>',
		'compare': '<path d="M10 18H5l5-6v6zm0-15H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v2h2V1h-2v2z"/><path d="M19 3h-5v2h5v13l-5-6v9h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'control_point': '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10 10-4.49 10-10S17.51 2 12 2z"/>',
		'control_point_duplicate': '<path d="M16 8h-2v3h-3v2h3v3h2v-3h3v-2h-3z"/><path d="M2 12c0-2.79 1.64-5.2 4.01-6.32V3.52C2.52 4.76 0 8.09 0 12s2.52 7.24 6.01 8.48v-2.16C3.64 17.2 2 14.79 2 12z"/><path d="M15 19c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7zm0-16c-4.96 0-9 4.04-9 9s4.04 9 9 9 9-4.04 9-9-4.04-9-9-9z"/>',
		'crop': '<path d="M17 15h2V7c0-1.1-.9-2-2-2H9v2h8v8z"/><path d="M7 17V1H5v4H1v2h4v10c0 1.1.9 2 2 2h10v4h2v-4h4v-2H7z"/>',
		'crop_16_9': '<path d="M19 6H5c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H5V8h14v8z"/>',
		'crop_3_2': '<path d="M19 4H5c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v12z"/>',
		'crop_5_4': '<path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z"/>',
		'crop_7_5': '<path d="M19 7H5c-1.1 0-2 .9-2 2v6c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2zm0 8H5V9h14v6z"/>',
		'crop_din': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/>',
		'crop_free': '<path d="M3 5v4h2V5h4V3H5c-1.1 0-2 .9-2 2z"/><path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/>',
		'crop_landscape': '<path d="M19 5H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 12H5V7h14v10z"/>',
		'crop_original': '<path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M13.96 12.29l-2.75 3.54-1.96-2.36L6.5 17h11l-3.54-4.71z"/>',
		'crop_portrait': '<path d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14z"/>',
		'crop_rotate': '<path d="M7.47 21.49C4.2 19.93 1.86 16.76 1.5 13H0c.51 6.16 5.66 11 11.95 11 .23 0 .44-.02.66-.03L8.8 20.15l-1.33 1.34z"/><path d="M12.05 0c-.23 0-.44.02-.66.04l3.81 3.81 1.33-1.33C19.8 4.07 22.14 7.24 22.5 11H24c-.51-6.16-5.66-11-11.95-11z"/><path d="M16 14h2V8a2 2 0 0 0-2-2h-6v2h6v6z"/><path d="M8 16V4H6v2H4v2h2v8a2 2 0 0 0 2 2h8v2h2v-2h2v-2H8z"/>',
		'crop_square': '<path d="M18 4H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H6V6h12v12z"/>',
		'dehaze': '<path d="M2 15.5v2h20v-2H2z"/><path d="M2 10.5v2h20v-2H2z"/><path d="M2 5.5v2h20v-2H2z"/>',
		'details': '<path d="M3 4l9 16 9-16H3zm3.38 2h11.25L12 16 6.38 6z"/>',
		'edit': '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25z"/><path d="M20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
		'exposure': '<path d="M15 17v2h2v-2h2v-2h-2v-2h-2v2h-2v2h2z"/><path d="M20 20H4L20 4v16zM5 5h6v2H5V5zm15-3H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'exposure_neg_1': '<path d="M4 11v2h8v-2H4z"/><path d="M19 18h-2V7.38L14 8.4V6.7L18.7 5h.3v13z"/>',
		'exposure_neg_2': '<path d="M15.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71A5.72 5.72 0 0 0 16.47 5c-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H21v-1.71h-5.95z"/><path d="M2 11v2h8v-2H2z"/>',
		'exposure_plus_1': '<path d="M10 7H8v4H4v2h4v4h2v-4h4v-2h-4V7z"/><path d="M20 18h-2V7.38L15 8.4V6.7L19.7 5h.3v13z"/>',
		'exposure_plus_2': '<path d="M16.05 16.29l2.86-3.07c.38-.39.72-.79 1.04-1.18.32-.39.59-.78.82-1.17.23-.39.41-.78.54-1.17.13-.39.19-.79.19-1.18 0-.53-.09-1.02-.27-1.46-.18-.44-.44-.81-.78-1.11-.34-.31-.77-.54-1.26-.71A5.72 5.72 0 0 0 17.47 5c-.69 0-1.31.11-1.85.32-.54.21-1 .51-1.36.88-.37.37-.65.8-.84 1.3-.18.47-.27.97-.28 1.5h2.14c.01-.31.05-.6.13-.87.09-.29.23-.54.4-.75.18-.21.41-.37.68-.49.27-.12.6-.18.96-.18.31 0 .58.05.81.15.23.1.43.25.59.43.16.18.28.4.37.65.08.25.13.52.13.81 0 .22-.03.43-.08.65-.06.22-.15.45-.29.7-.14.25-.32.53-.56.83-.23.3-.52.65-.88 1.03l-4.17 4.55V18H22v-1.71h-5.95z"/><path d="M8 7H6v4H2v2h4v4h2v-4h4v-2H8V7z"/>',
		'exposure_zero': '<path d="M16.14 12.5c0 1-.1 1.85-.3 2.55-.2.7-.48 1.27-.83 1.7-.36.44-.79.75-1.3.95-.51.2-1.07.3-1.7.3-.62 0-1.18-.1-1.69-.3-.51-.2-.95-.51-1.31-.95-.36-.44-.65-1.01-.85-1.7-.2-.7-.3-1.55-.3-2.55v-2.04c0-1 .1-1.85.3-2.55.2-.7.48-1.26.84-1.69.36-.43.8-.74 1.31-.93C10.81 5.1 11.38 5 12 5c.63 0 1.19.1 1.7.29.51.19.95.5 1.31.93.36.43.64.99.84 1.69.2.7.3 1.54.3 2.55v2.04zm-2.11-2.36c0-.64-.05-1.18-.13-1.62-.09-.44-.22-.79-.4-1.06-.17-.27-.39-.46-.64-.58-.25-.13-.54-.19-.86-.19-.32 0-.61.06-.86.18s-.47.31-.64.58c-.17.27-.31.62-.4 1.06s-.13.98-.13 1.62v2.67c0 .64.05 1.18.14 1.62.09.45.23.81.4 1.09s.39.48.64.61.54.19.87.19c.33 0 .62-.06.87-.19s.46-.33.63-.61c.17-.28.3-.64.39-1.09.09-.45.13-.99.13-1.62v-2.66z"/>',
		'filter': '<path d="M15.96 10.29l-2.75 3.54-1.96-2.36L8.5 15h11l-3.54-4.71z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'filter_1': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M14 15h2V5h-4v2h2v8z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'filter_2': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M17 13h-4v-2h2a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4v2h4v2h-2a2 2 0 0 0-2 2v4h6v-2z"/>',
		'filter_3': '<path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M17 13v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7a2 2 0 0 0-2-2h-4v2h4v2h-2v2h2v2h-4v2h4a2 2 0 0 0 2-2z"/>',
		'filter_4': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M15 15h2V5h-2v4h-2V5h-2v6h4v4z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'filter_5': '<path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M17 13v-2a2 2 0 0 0-2-2h-2V7h4V5h-6v6h4v2h-4v2h4a2 2 0 0 0 2-2z"/>',
		'filter_6': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 11h2v2h-2v-2zm0 4h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-2-2h-2V7h4V5h-4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z"/>',
		'filter_7': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 15l4-8V5h-6v2h4l-4 8h2z"/>',
		'filter_8': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M13 11h2v2h-2v-2zm0-4h2v2h-2V7zm0 8h2a2 2 0 0 0 2-2v-1.5c0-.83-.67-1.5-1.5-1.5.83 0 1.5-.67 1.5-1.5V7a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v1.5c0 .83.67 1.5 1.5 1.5-.83 0-1.5.67-1.5 1.5V13a2 2 0 0 0 2 2z"/>',
		'filter_9': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/><path d="M15 9h-2V7h2v2zm0-4h-2a2 2 0 0 0-2 2v2a2 2 0 0 0 2 2h2v2h-4v2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z"/>',
		'filter_9_plus': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M11 9V8h1v1h-1zm3 3V8a2 2 0 0 0-2-2h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1v1H9v2h3a2 2 0 0 0 2-2z"/><path d="M21 9h-2V7h-2v2h-2v2h2v2h2v-2h2v6H7V3h14v6zm0-8H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'filter_b_and_w': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16l-7-8v8H5l7-8V5h7v14z"/>',
		'filter_center_focus': '<path d="M5 15H3v4c0 1.1.9 2 2 2h4v-2H5v-4z"/><path d="M5 5h4V3H5c-1.1 0-2 .9-2 2v4h2V5z"/><path d="M19 3h-4v2h4v4h2V5c0-1.1-.9-2-2-2z"/><path d="M19 19h-4v2h4c1.1 0 2-.9 2-2v-4h-2v4z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
		'filter_drama': '<path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.61 5.64 5.36 8.04 2.35 8.36 0 10.9 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM19 18H6c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4h2c0-2.76-1.86-5.08-4.4-5.78C8.61 6.88 10.2 6 12 6c3.03 0 5.5 2.47 5.5 5.5v.5H19c1.65 0 3 1.35 3 3s-1.35 3-3 3z"/>',
		'filter_frames': '<path d="M20 20H4V6h4.52l3.52-3.5L15.52 6H20v14zm0-16h-4l-4-4-4 4H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/><path d="M18 8H6v10h12"/>',
		'filter_hdr': '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
		'filter_none': '<path d="M3 5H1v16c0 1.1.9 2 2 2h16v-2H3V5z"/><path d="M21 17H7V3h14v14zm0-16H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2z"/>',
		'filter_tilt_shift': '<path d="M11 4.07V2.05c-2.01.2-3.84 1-5.32 2.21L7.1 5.69A7.941 7.941 0 0 1 11 4.07z"/><path d="M18.32 4.26A9.949 9.949 0 0 0 13 2.05v2.02c1.46.18 2.79.76 3.9 1.62l1.42-1.43z"/><path d="M19.93 11h2.02c-.2-2.01-1-3.84-2.21-5.32L18.31 7.1a7.941 7.941 0 0 1 1.62 3.9z"/><path d="M5.69 7.1L4.26 5.68A9.949 9.949 0 0 0 2.05 11h2.02c.18-1.46.76-2.79 1.62-3.9z"/><path d="M4.07 13H2.05c.2 2.01 1 3.84 2.21 5.32l1.43-1.43A7.868 7.868 0 0 1 4.07 13z"/><path d="M15 12c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z"/><path d="M18.31 16.9l1.43 1.43a9.981 9.981 0 0 0 2.21-5.32h-2.02a7.945 7.945 0 0 1-1.62 3.89z"/><path d="M13 19.93v2.02c2.01-.2 3.84-1 5.32-2.21l-1.43-1.43c-1.1.86-2.43 1.44-3.89 1.62z"/><path d="M5.68 19.74A9.981 9.981 0 0 0 11 21.95v-2.02a7.941 7.941 0 0 1-3.9-1.62l-1.42 1.43z"/>',
		'filter_vintage': '<path d="M18.7 12.4c-.28-.16-.57-.29-.86-.4.29-.11.58-.24.86-.4 1.92-1.11 2.99-3.12 3-5.19-1.79-1.03-4.07-1.11-6 0-.28.16-.54.35-.78.54.05-.31.08-.63.08-.95 0-2.22-1.21-4.15-3-5.19C10.21 1.85 9 3.78 9 6c0 .32.03.64.08.95-.24-.2-.5-.39-.78-.55-1.92-1.11-4.2-1.03-6 0 0 2.07 1.07 4.08 3 5.19.28.16.57.29.86.4-.29.11-.58.24-.86.4-1.92 1.11-2.99 3.12-3 5.19 1.79 1.03 4.07 1.11 6 0 .28-.16.54-.35.78-.54-.05.32-.08.64-.08.96 0 2.22 1.21 4.15 3 5.19 1.79-1.04 3-2.97 3-5.19 0-.32-.03-.64-.08-.95.24.2.5.38.78.54 1.92 1.11 4.2 1.03 6 0-.01-2.07-1.08-4.08-3-5.19zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>',
		'flare': '<path d="M7 11H1v2h6v-2z"/><path d="M9.17 7.76L7.05 5.64 5.64 7.05l2.12 2.12 1.41-1.41z"/><path d="M13 1h-2v6h2V1z"/><path d="M18.36 7.05l-1.41-1.41-2.12 2.12 1.41 1.41 2.12-2.12z"/><path d="M17 11v2h6v-2h-6z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/><path d="M14.83 16.24l2.12 2.12 1.41-1.41-2.12-2.12-1.41 1.41z"/><path d="M5.64 16.95l1.41 1.41 2.12-2.12-1.41-1.41-2.12 2.12z"/><path d="M11 23h2v-6h-2v6z"/>',
		'flash_auto': '<path d="M3 2v12h3v9l7-12H9l4-9H3z"/><path d="M16.85 7.65L18 4l1.15 3.65h-2.3zM19 2h-2l-3.2 9h1.9l.7-2h3.2l.7 2h1.9L19 2z"/>',
		'flash_off': '<path d="M3.27 3L2 4.27l5 5V13h3v9l3.58-6.14L17.73 20 19 18.73 3.27 3z"/><path d="M17 10h-4l4-8H7v2.18l8.46 8.46L17 10z"/>',
		'flash_on': '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
		'flip': '<path d="M15 21h2v-2h-2v2z"/><path d="M19 9h2V7h-2v2z"/><path d="M3 5v14c0 1.1.9 2 2 2h4v-2H5V5h4V3H5c-1.1 0-2 .9-2 2z"/><path d="M19 3v2h2c0-1.1-.9-2-2-2z"/><path d="M11 23h2V1h-2v22z"/><path d="M19 17h2v-2h-2v2z"/><path d="M15 5h2V3h-2v2z"/><path d="M19 13h2v-2h-2v2z"/><path d="M19 21c1.1 0 2-.9 2-2h-2v2z"/>',
		'gradient': '<path d="M11 9h2v2h-2zm-2 2h2v2H9zm4 0h2v2h-2zm2-2h2v2h-2zM7 9h2v2H7zm12-6H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 18H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2zm2-7h-2v2h2v2h-2v-2h-2v2h-2v-2h-2v2H9v-2H7v2H5v-2h2v-2H5V5h14v6z"/>',
		'grain': '<path d="M10 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M6 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M14 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M14 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M10 4c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
		'grid_off': '<path d="M16 4h4v4h-4V4zM8 4v1.45l2 2V4h4v4h-3.45l2 2H14v1.45l2 2V10h4v4h-3.45l2 2H20v1.45l2 2V4c0-1.1-.9-2-2-2H4.55l2 2H8z"/><path d="M16 20v-1.46L17.46 20H16zm-2 0h-4v-4h3.45l.55.54V20zm-6-6H4v-4h3.45l.55.55V14zm0 6H4v-4h4v4zM4 6.55L5.45 8H4V6.55zm6 6L11.45 14H10v-1.45zM1.27 1.27L0 2.55l2 2V20c0 1.1.9 2 2 2h15.46l2 2 1.27-1.27L1.27 1.27z"/>',
		'grid_on': '<path d="M20 2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM8 20H4v-4h4v4zm0-6H4v-4h4v4zm0-6H4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4zm6 12h-4v-4h4v4zm0-6h-4v-4h4v4zm0-6h-4V4h4v4z"/>',
		'hdr_off': '<path d="M13 15h-2v-2.45l2 2V15zm5 2L3.27 2.27 2 3.55l4 4V11H4V7H2v10h2v-4h2v4h2V9.55l1 1V17h4c.67 0 1.26-.33 1.62-.84l6.34 6.34 1.27-1.27L18 17z"/><path d="M18 9h2v2h-2V9zm0 4h1l.82 3.27.73.73H22l-1.19-4.17c.7-.31 1.19-1.01 1.19-1.83V9c0-1.1-.9-2-2-2h-4v5.45l2 2V13z"/><path d="M15 11.45V9c0-1.1-.9-2-2-2h-2.45L15 11.45z"/>',
		'hdr_on': '<path d="M6 11H4V7H2v10h2v-4h2v4h2V7H6v4z"/><path d="M13 15h-2V9h2v6zm0-8H9v10h4c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/><path d="M20 11h-2V9h2v2zm2 0V9c0-1.1-.9-2-2-2h-4v10h2v-4h1l1 4h2l-1.19-4.17c.7-.31 1.19-1.01 1.19-1.83z"/>',
		'hdr_strong': '<path d="M17 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/><path d="M5 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-6c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/>',
		'hdr_weak': '<path d="M5 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M17 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm0-10c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/>',
		'healing': '<path d="M17.73 12.02l3.98-3.98c.39-.39.39-1.02 0-1.41l-4.34-4.34c-.39-.39-1.02-.39-1.41 0l-3.98 3.98L8 2.29C7.8 2.1 7.55 2 7.29 2c-.25 0-.51.1-.7.29L2.25 6.63c-.39.39-.39 1.02 0 1.41l3.98 3.98L2.25 16c-.39.39-.39 1.02 0 1.41l4.34 4.34c.39.39 1.02.39 1.41 0l3.98-3.98 3.98 3.98c.2.2.45.29.71.29.26 0 .51-.1.71-.29l4.34-4.34c.39-.39.39-1.02 0-1.41l-3.99-3.98zM12 9c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-4.71 1.96L3.66 7.34l3.63-3.63 3.62 3.62-3.62 3.63zM10 13c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2 2c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm2-4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2.66 9.34l-3.63-3.62 3.63-3.63 3.62 3.62-3.62 3.63z"/>',
		'image': '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
		'image_aspect_ratio': '<path d="M16 10h-2v2h2v-2z"/><path d="M16 14h-2v2h2v-2z"/><path d="M8 10H6v2h2v-2z"/><path d="M12 10h-2v2h2v-2z"/><path d="M20 18H4V6h16v12zm0-14H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z"/>',
		'iso': '<path d="M19 19H5L19 5v14zM5.5 7.5h2v-2H9v2h2V9H9v2H7.5V9h-2V7.5zM19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M17 17v-1.5h-5V17h5z"/>',
		'landscape': '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
		'leak_add': '<path d="M6 3H3v3c1.66 0 3-1.34 3-3z"/><path d="M14 3h-2a9 9 0 0 1-9 9v2c6.08 0 11-4.93 11-11z"/><path d="M10 3H8c0 2.76-2.24 5-5 5v2c3.87 0 7-3.13 7-7z"/><path d="M10 21h2a9 9 0 0 1 9-9v-2c-6.07 0-11 4.93-11 11z"/><path d="M18 21h3v-3c-1.66 0-3 1.34-3 3z"/><path d="M14 21h2c0-2.76 2.24-5 5-5v-2c-3.87 0-7 3.13-7 7z"/>',
		'leak_remove': '<path d="M10 3H8c0 .37-.04.72-.12 1.06l1.59 1.59C9.81 4.84 10 3.94 10 3z"/><path d="M3 4.27l2.84 2.84C5.03 7.67 4.06 8 3 8v2c1.61 0 3.09-.55 4.27-1.46L8.7 9.97A8.99 8.99 0 0 1 3 12v2c2.71 0 5.19-.99 7.11-2.62l2.5 2.5A11.044 11.044 0 0 0 10 21h2c0-2.16.76-4.14 2.03-5.69l1.43 1.43A6.922 6.922 0 0 0 14 21h2c0-1.06.33-2.03.89-2.84L19.73 21 21 19.73 4.27 3 3 4.27z"/><path d="M14 3h-2c0 1.5-.37 2.91-1.02 4.16l1.46 1.46C13.42 6.98 14 5.06 14 3z"/><path d="M19.94 16.12c.34-.08.69-.12 1.06-.12v-2c-.94 0-1.84.19-2.66.52l1.6 1.6z"/><path d="M15.38 11.56l1.46 1.46A8.98 8.98 0 0 1 21 12v-2c-2.06 0-3.98.58-5.62 1.56z"/>',
		'lens': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'linked_camera': '<circle cx="12" cy="14" r="3.2"/><path d="M16 3.33c2.58 0 4.67 2.09 4.67 4.67H22c0-3.31-2.69-6-6-6v1.33M16 6c1.11 0 2 .89 2 2h1.33c0-1.84-1.49-3.33-3.33-3.33V6"/><path d="M17 9c0-1.11-.89-2-2-2V4H9L7.17 6H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V9h-5zm-5 10c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/>',
		'looks': '<path d="M12 10c-3.86 0-7 3.14-7 7h2c0-2.76 2.24-5 5-5s5 2.24 5 5h2c0-3.86-3.14-7-7-7z"/><path d="M12 6C5.93 6 1 10.93 1 17h2c0-4.96 4.04-9 9-9s9 4.04 9 9h2c0-6.07-4.93-11-11-11z"/>',
		'looks_3': '<path d="M19.01 3h-14c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 7.5c0 .83-.67 1.5-1.5 1.5.83 0 1.5.67 1.5 1.5V15c0 1.11-.9 2-2 2h-4v-2h4v-2h-2v-2h2V9h-4V7h4c1.1 0 2 .89 2 2v1.5z"/>',
		'looks_4': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 14h-2v-4H9V7h2v4h2V7h2v10z"/>',
		'looks_5': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2H9v-2h4v-2H9V7h6v2z"/>',
		'looks_6': '<path d="M11 15h2v-2h-2v2zm8-12H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 6h-4v2h2c1.1 0 2 .89 2 2v2c0 1.11-.9 2-2 2h-2c-1.1 0-2-.89-2-2V9c0-1.11.9-2 2-2h4v2z"/>',
		'looks_one': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14h-2V9h-2V7h4v10z"/>',
		'looks_two': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-4 8c0 1.11-.9 2-2 2h-2v2h4v2H9v-4c0-1.11.9-2 2-2h2V9H9V7h4c1.1 0 2 .89 2 2v2z"/>',
		'loupe': '<path d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7z"/><path d="M12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-18C6.49 2 2 6.49 2 12s4.49 10 10 10h8c1.1 0 2-.9 2-2v-8c0-5.51-4.49-10-10-10z"/>',
		'monochrome_photos': '<path d="M20 19h-8v-1c-2.8 0-5-2.2-5-5s2.2-5 5-5V7h8v12zm0-14h-3.2L15 3H9L7.2 5H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/><path d="M17 13c0-2.8-2.2-5-5-5v1.8c1.8 0 3.2 1.4 3.2 3.2 0 1.8-1.4 3.2-3.2 3.2V18c2.8 0 5-2.2 5-5z"/><path d="M8.8 13c0 1.8 1.4 3.2 3.2 3.2V9.8c-1.8 0-3.2 1.4-3.2 3.2z"/>',
		'movie_creation': '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z"/>',
		'movie_filter': '<path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4zm-6.58 11.68L10.37 18l-1.05-2.32L7 14.63l2.32-1.05 1.05-2.32 1.05 2.32 2.32 1.05-2.32 1.05zm3.69-3.47l-.53 1.16-.53-1.16-1.16-.53 1.16-.53.53-1.15.53 1.16 1.16.53-1.16.52z"/>',
		'music_note': '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>',
		'nature': '<path d="M13 16.12c3.47-.41 6.17-3.36 6.17-6.95 0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H5v2h14v-2h-6v-3.88z"/>',
		'nature_people': '<path d="M22.17 9.17c0-3.87-3.13-7-7-7s-7 3.13-7 7c0 3.47 2.52 6.34 5.83 6.89V20H6v-3h1v-4c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v4h1v5h16v-2h-3v-3.88c3.47-.41 6.17-3.36 6.17-6.95zM4.5 11c.83 0 1.5-.67 1.5-1.5S5.33 8 4.5 8 3 8.67 3 9.5 3.67 11 4.5 11z"/>',
		'navigate_before': '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
		'navigate_next': '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
		'palette': '<path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'panorama': '<path d="M23 18V6c0-1.1-.9-2-2-2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2zM8.5 12.5l2.5 3.01L14.5 11l4.5 6H5l3.5-4.5z"/>',
		'panorama_fisheye': '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>',
		'panorama_horizontal': '<path d="M20 6.54v10.91c-2.6-.77-5.28-1.16-8-1.16-2.72 0-5.4.39-8 1.16V6.54c2.6.77 5.28 1.16 8 1.16 2.72.01 5.4-.38 8-1.16M21.43 4c-.1 0-.2.02-.31.06C18.18 5.16 15.09 5.7 12 5.7c-3.09 0-6.18-.55-9.12-1.64-.11-.04-.22-.06-.31-.06-.34 0-.57.23-.57.63v14.75c0 .39.23.62.57.62.1 0 .2-.02.31-.06 2.94-1.1 6.03-1.64 9.12-1.64 3.09 0 6.18.55 9.12 1.64.11.04.21.06.31.06.33 0 .57-.23.57-.63V4.63c0-.4-.24-.63-.57-.63z"/>',
		'panorama_vertical': '<path d="M19.94 21.12c-1.1-2.94-1.64-6.03-1.64-9.12 0-3.09.55-6.18 1.64-9.12.04-.11.06-.22.06-.31 0-.34-.23-.57-.63-.57H4.63c-.4 0-.63.23-.63.57 0 .1.02.2.06.31C5.16 5.82 5.71 8.91 5.71 12c0 3.09-.55 6.18-1.64 9.12-.05.11-.07.22-.07.31 0 .33.23.57.63.57h14.75c.39 0 .63-.24.63-.57-.01-.1-.03-.2-.07-.31zM6.54 20c.77-2.6 1.16-5.28 1.16-8 0-2.72-.39-5.4-1.16-8h10.91c-.77 2.6-1.16 5.28-1.16 8 0 2.72.39 5.4 1.16 8H6.54z"/>',
		'panorama_wide_angle': '<path d="M12 6c2.45 0 4.71.2 7.29.64.47 1.78.71 3.58.71 5.36 0 1.78-.24 3.58-.71 5.36-2.58.44-4.84.64-7.29.64s-4.71-.2-7.29-.64C4.24 15.58 4 13.78 4 12c0-1.78.24-3.58.71-5.36C7.29 6.2 9.55 6 12 6m0-2c-2.73 0-5.22.24-7.95.72l-.93.16-.25.9C2.29 7.85 2 9.93 2 12s.29 4.15.87 6.22l.25.89.93.16c2.73.49 5.22.73 7.95.73s5.22-.24 7.95-.72l.93-.16.25-.89c.58-2.08.87-4.16.87-6.23s-.29-4.15-.87-6.22l-.25-.89-.93-.16C17.22 4.24 14.73 4 12 4z"/>',
		'photo': '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>',
		'photo_album': '<path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 15l3-3.86 2.14 2.58 3-3.86L18 19H6z"/>',
		'photo_camera': '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
		'photo_filter': '<path d="M17.13 8.9l.59-1.3 1.3-.6-1.3-.59-.59-1.3-.59 1.3-1.31.59 1.31.6z"/><path d="M12.39 6.53l-1.18 2.61-2.61 1.18 2.61 1.18 1.18 2.61 1.19-2.61 2.6-1.18-2.6-1.18z"/><path d="M19.02 10v9H5V5h9V3H5.02c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-9h-2z"/>',
		'photo_library': '<path d="M11 12l2.03 2.71L16 11l4 5H8l3-4zm11 4V4c0-1.1-.9-2-2-2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2z"/><path d="M2 6v14c0 1.1.9 2 2 2h14v-2H4V6H2z"/>',
		'photo_size_select_actual': '<path d="M21 3H3C2 3 1 4 1 5v14c0 1.1.9 2 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3.01L14.5 11l4.5 6H5z"/>',
		'photo_size_select_large': '<path d="M21 15h2v2h-2v-2z"/><path d="M21 11h2v2h-2v-2z"/><path d="M23 19h-2v2c1 0 2-1 2-2z"/><path d="M13 3h2v2h-2V3z"/><path d="M21 7h2v2h-2V7z"/><path d="M21 3v2h2c0-1-1-2-2-2z"/><path d="M1 7h2v2H1V7z"/><path d="M17 3h2v2h-2V3z"/><path d="M17 19h2v2h-2v-2z"/><path d="M3 3C2 3 1 4 1 5h2V3z"/><path d="M9 3h2v2H9V3z"/><path d="M5 3h2v2H5V3z"/><path d="M3 19l2.5-3.21 1.79 2.15 2.5-3.22L13 19H3zm-2-8v8c0 1.1.9 2 2 2h12V11H1z"/>',
		'photo_size_select_small': '<path d="M23 15h-2v2h2v-2z"/><path d="M23 11h-2v2h2v-2z"/><path d="M23 19h-2v2c1 0 2-1 2-2z"/><path d="M15 3h-2v2h2V3z"/><path d="M23 7h-2v2h2V7z"/><path d="M21 3v2h2c0-1-1-2-2-2z"/><path d="M3 21h8v-6H1v4c0 1.1.9 2 2 2z"/><path d="M3 7H1v2h2V7z"/><path d="M15 19h-2v2h2v-2z"/><path d="M19 3h-2v2h2V3z"/><path d="M19 19h-2v2h2v-2z"/><path d="M3 3C2 3 1 4 1 5h2V3z"/><path d="M3 11H1v2h2v-2z"/><path d="M11 3H9v2h2V3z"/><path d="M7 3H5v2h2V3z"/>',
		'picture_as_pdf': '<path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6z"/><path d="M14 11.5h1v-3h-1v3zm-5-2h1v-1H9v1zm11.5-1H19v1h1.5V11H19v2h-1.5V7h3v1.5zm-4 3c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm-5-2c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zM20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>',
		'portrait': '<path d="M16.5 16.25c0-1.5-3-2.25-4.5-2.25s-4.5.75-4.5 2.25V17h9v-.75zm-4.5-4c1.24 0 2.25-1.01 2.25-2.25S13.24 7.75 12 7.75 9.75 8.76 9.75 10s1.01 2.25 2.25 2.25z"/><path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'remove_red_eye': '<path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5z"/><path d="M12 9c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>',
		'rotate_90_degrees_ccw': '<path d="M3.69 12.9l3.66-3.66L11 12.9l-3.66 3.66-3.65-3.66zm3.65-6.49L.86 12.9l6.49 6.48 6.49-6.48-6.5-6.49z"/><path d="M19.36 6.64A8.95 8.95 0 0 0 13 4V.76L8.76 5 13 9.24V6c1.79 0 3.58.68 4.95 2.05a7.007 7.007 0 0 1 0 9.9 6.973 6.973 0 0 1-7.79 1.44l-1.49 1.49C10.02 21.62 11.51 22 13 22c2.3 0 4.61-.88 6.36-2.64a8.98 8.98 0 0 0 0-12.72z"/>',
		'rotate_left': '<path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47z"/><path d="M6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47z"/><path d="M7.1 18.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32z"/><path d="M13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z"/>',
		'rotate_right': '<path d="M15.55 5.55L11 1v3.07C7.06 4.56 4 7.92 4 12s3.05 7.44 7 7.93v-2.02c-2.84-.48-5-2.94-5-5.91s2.16-5.43 5-5.91V10l4.55-4.45z"/><path d="M19.93 11c-.17-1.39-.72-2.73-1.62-3.89l-1.42 1.42c.54.75.88 1.6 1.02 2.47h2.02z"/><path d="M13 17.9v2.02c1.39-.17 2.74-.71 3.9-1.61l-1.44-1.44c-.75.54-1.59.89-2.46 1.03z"/><path d="M16.89 15.48l1.42 1.41c.9-1.16 1.45-2.5 1.62-3.89h-2.02c-.14.87-.48 1.72-1.02 2.48z"/>',
		'slideshow': '<path d="M10 8v8l5-4-5-4z"/><path d="M19 19H5V5h14v14zm0-16H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'straighten': '<path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 10H3V8h2v4h2V8h2v4h2V8h2v4h2V8h2v4h2V8h2v8z"/>',
		'style': '<path d="M2.53 19.65l1.34.56v-9.03l-2.43 5.86c-.41 1.02.08 2.19 1.09 2.61z"/><path d="M7.88 8.75c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm14.15 7.2L17.07 3.98a2.013 2.013 0 0 0-1.81-1.23c-.26 0-.53.04-.79.15L7.1 5.95a1.999 1.999 0 0 0-1.08 2.6l4.96 11.97a1.998 1.998 0 0 0 2.6 1.08l7.36-3.05a1.994 1.994 0 0 0 1.09-2.6z"/><path d="M5.88 19.75c0 1.1.9 2 2 2h1.45l-3.45-8.34v6.34z"/>',
		'switch_camera': '<path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 11.5V13H9v2.5L5.5 12 9 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>',
		'switch_video': '<path d="M18 9.5V6c0-.55-.45-1-1-1H3c-.55 0-1 .45-1 1v12c0 .55.45 1 1 1h14c.55 0 1-.45 1-1v-3.5l4 4v-13l-4 4zm-5 6V13H7v2.5L3.5 12 7 8.5V11h6V8.5l3.5 3.5-3.5 3.5z"/>',
		'tag_faces': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
		'texture': '<path d="M19.51 3.08L3.08 19.51c.09.34.27.65.51.9.25.24.56.42.9.51L20.93 4.49c-.19-.69-.73-1.23-1.42-1.41z"/><path d="M11.88 3L3 11.88v2.83L14.71 3h-2.83z"/><path d="M5 3c-1.1 0-2 .9-2 2v2l4-4H5z"/><path d="M19 21c.55 0 1.05-.22 1.41-.59.37-.36.59-.86.59-1.41v-2l-4 4h2z"/><path d="M9.29 21h2.83L21 12.12V9.29L9.29 21z"/>',
		'timelapse': '<path d="M16.24 7.76C15.07 6.59 13.54 6 12 6v6l-4.24 4.24c2.34 2.34 6.14 2.34 8.49 0 2.34-2.34 2.34-6.14-.01-8.48z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'timer': '<path d="M15 1H9v2h6V1z"/><path d="M11 14h2V8h-2v6z"/><path d="M12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm7.03-12.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61z"/>',
		'timer_10': '<path d="M0 7.72V9.4l3-1V18h2V6h-.25L0 7.72z"/><path d="M23.78 14.37c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38a6.64 6.64 0 0 1-.87-.23 2.61 2.61 0 0 1-.55-.25.717.717 0 0 1-.28-.3.978.978 0 0 1 .01-.8c.06-.13.15-.25.27-.34.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95a2.517 2.517 0 0 0-.93-1.97c-.3-.25-.66-.44-1.09-.59C21.49 9.07 21 9 20.46 9c-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84a2.2 2.2 0 0 0-.23 1.01c0 .36.08.69.23.96.15.28.36.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24a1.333 1.333 0 0 1-.59-1.11h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z"/><path d="M12.9 13.22c0 .6-.04 1.11-.12 1.53-.08.42-.2.76-.36 1.02-.16.26-.36.45-.59.57-.23.12-.51.18-.82.18-.3 0-.58-.06-.82-.18s-.44-.31-.6-.57c-.16-.26-.29-.6-.38-1.02-.09-.42-.13-.93-.13-1.53v-2.5c0-.6.04-1.11.13-1.52.09-.41.21-.74.38-1 .16-.25.36-.43.6-.55.24-.11.51-.17.81-.17.31 0 .58.06.81.17.24.11.44.29.6.55.16.25.29.58.37.99.08.41.13.92.13 1.52v2.51zm.92-6.17c-.34-.4-.75-.7-1.23-.88-.47-.18-1.01-.27-1.59-.27-.58 0-1.11.09-1.59.27-.48.18-.89.47-1.23.88-.34.41-.6.93-.79 1.59-.18.65-.28 1.45-.28 2.39v1.92c0 .94.09 1.74.28 2.39.19.66.45 1.19.8 1.6.34.41.75.71 1.23.89.48.18 1.01.28 1.59.28.59 0 1.12-.09 1.59-.28.48-.18.88-.48 1.22-.89.34-.41.6-.94.78-1.6.18-.65.28-1.45.28-2.39v-1.92c0-.94-.09-1.74-.28-2.39-.18-.66-.44-1.19-.78-1.59z"/>',
		'timer_3': '<path d="M11.61 12.97c-.16-.24-.36-.46-.62-.65a3.38 3.38 0 0 0-.93-.48c.3-.14.57-.3.8-.5.23-.2.42-.41.57-.64.15-.23.27-.46.34-.71.08-.24.11-.49.11-.73 0-.55-.09-1.04-.28-1.46-.18-.42-.44-.77-.78-1.06-.33-.28-.73-.5-1.2-.64-.45-.13-.97-.2-1.53-.2-.55 0-1.06.08-1.52.24-.47.17-.87.4-1.2.69-.33.29-.6.63-.78 1.03-.2.39-.29.83-.29 1.29h1.98c0-.26.05-.49.14-.69.09-.2.22-.38.38-.52.17-.14.36-.25.58-.33.22-.08.46-.12.73-.12.61 0 1.06.16 1.36.47.3.31.44.75.44 1.32 0 .27-.04.52-.12.74-.08.22-.21.41-.38.57-.17.16-.38.28-.63.37-.25.09-.55.13-.89.13H6.72v1.57H7.9c.34 0 .64.04.91.11.27.08.5.19.69.35.19.16.34.36.44.61.1.24.16.54.16.87 0 .62-.18 1.09-.53 1.42-.35.33-.84.49-1.45.49-.29 0-.56-.04-.8-.13-.24-.08-.44-.2-.61-.36-.17-.16-.3-.34-.39-.56-.09-.22-.14-.46-.14-.72H4.19c0 .55.11 1.03.32 1.45.21.42.5.77.86 1.05s.77.49 1.24.63.96.21 1.48.21c.57 0 1.09-.08 1.58-.23.49-.15.91-.38 1.26-.68.36-.3.64-.66.84-1.1.2-.43.3-.93.3-1.48 0-.29-.04-.58-.11-.86-.08-.25-.19-.51-.35-.76z"/><path d="M20.87 14.37c-.14-.28-.35-.53-.63-.74-.28-.21-.61-.39-1.01-.53s-.85-.27-1.35-.38a6.64 6.64 0 0 1-.87-.23 2.61 2.61 0 0 1-.55-.25.717.717 0 0 1-.28-.3.935.935 0 0 1-.08-.39.946.946 0 0 1 .36-.75c.12-.1.27-.18.45-.24s.4-.09.64-.09c.25 0 .47.04.66.11.19.07.35.17.48.29.13.12.22.26.29.42.06.16.1.32.1.49h1.95a2.517 2.517 0 0 0-.93-1.97c-.3-.25-.66-.44-1.09-.59-.43-.15-.92-.22-1.46-.22-.51 0-.98.07-1.39.21-.41.14-.77.33-1.06.57-.29.24-.51.52-.67.84a2.2 2.2 0 0 0-.23 1.01c0 .36.08.68.23.96.15.28.37.52.64.73.27.21.6.38.98.53.38.14.81.26 1.27.36.39.08.71.17.95.26s.43.19.57.29c.13.1.22.22.27.34.05.12.07.25.07.39 0 .32-.13.57-.4.77-.27.2-.66.29-1.17.29-.22 0-.43-.02-.64-.08-.21-.05-.4-.13-.56-.24a1.333 1.333 0 0 1-.59-1.11h-1.89c0 .36.08.71.24 1.05.16.34.39.65.7.93.31.27.69.49 1.15.66.46.17.98.25 1.58.25.53 0 1.01-.06 1.44-.19.43-.13.8-.31 1.11-.54.31-.23.54-.51.71-.83.17-.32.25-.67.25-1.06-.02-.4-.09-.74-.24-1.02z"/>',
		'timer_off': '<path d="M19.04 4.55l-1.42 1.42a9.012 9.012 0 0 0-10.57-.49l1.46 1.46C9.53 6.35 10.73 6 12 6c3.87 0 7 3.13 7 7 0 1.27-.35 2.47-.94 3.49l1.45 1.45A8.878 8.878 0 0 0 21 13c0-2.12-.74-4.07-1.97-5.61l1.42-1.42-1.41-1.42z"/><path d="M15 1H9v2h6V1z"/><path d="M11 9.44l2 2V8h-2v1.44z"/><path d="M12 20c-3.87 0-7-3.13-7-7 0-1.28.35-2.48.95-3.52l9.56 9.56c-1.03.61-2.23.96-3.51.96zM3.02 4L1.75 5.27 4.5 8.03A8.905 8.905 0 0 0 3 13c0 4.97 4.02 9 9 9 1.84 0 3.55-.55 4.98-1.5l2.5 2.5 1.27-1.27-7.71-7.71L3.02 4z"/>',
		'tonality': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2-15.86c1.03.13 2 .45 2.87.93H13v-.93zM13 7h5.24c.25.31.48.65.68 1H13V7zm0 3h6.74c.08.33.15.66.19 1H13v-1zm0 9.93V19h2.87c-.87.48-1.84.8-2.87.93zM18.24 17H13v-1h5.92c-.2.35-.43.69-.68 1zm1.5-3H13v-1h6.93c-.04.34-.11.67-.19 1z"/>',
		'transform': '<path d="M22 18v-2H8V4h2L7 1 4 4h2v2H2v2h4v8c0 1.1.9 2 2 2h8v2h-2l3 3 3-3h-2v-2h4z"/><path d="M10 8h6v6h2V8c0-1.1-.9-2-2-2h-6v2z"/>',
		'tune': '<path d="M13 21v-2h8v-2h-8v-2h-2v6h2zM3 17v2h6v-2H3z"/><path d="M21 13v-2H11v2h10zM7 9v2H3v2h4v2h2V9H7z"/><path d="M15 9h2V7h4V5h-4V3h-2v6zM3 5v2h10V5H3z"/>',
		'view_comfy': '<path d="M3 9h4V5H3v4z"/><path d="M3 14h4v-4H3v4z"/><path d="M8 14h4v-4H8v4z"/><path d="M13 14h4v-4h-4v4z"/><path d="M8 9h4V5H8v4z"/><path d="M13 5v4h4V5h-4z"/><path d="M18 14h4v-4h-4v4z"/><path d="M3 19h4v-4H3v4z"/><path d="M8 19h4v-4H8v4z"/><path d="M13 19h4v-4h-4v4z"/><path d="M18 19h4v-4h-4v4z"/><path d="M18 5v4h4V5h-4z"/>',
		'view_compact': '<path d="M3 19h6v-7H3v7z"/><path d="M10 19h12v-7H10v7z"/><path d="M3 5v6h19V5H3z"/>',
		'vignette': '<path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9 15c-4.42 0-8-2.69-8-6s3.58-6 8-6 8 2.69 8 6-3.58 6-8 6z"/>',
		'wb_auto': '<path d="M6.85 12.65h2.3L8 9l-1.15 3.65zM22 7l-1.2 6.29L19.3 7h-1.6l-1.49 6.29L15 7h-.76C12.77 5.17 10.53 4 8 4c-4.42 0-8 3.58-8 8s3.58 8 8 8c3.13 0 5.84-1.81 7.15-4.43l.1.43H17l1.5-6.1L20 16h1.75l2.05-9H22zm-11.7 9l-.7-2H6.4l-.7 2H3.8L7 7h2l3.2 9h-1.9z"/>',
		'wb_cloudy': '<path d="M19.36 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.64-4.96z"/>',
		'wb_incandescent': '<path d="M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/><path d="M11 22.45h2V19.5h-2v2.95z"/><path d="M4 10.5H1v2h3v-2z"/><path d="M15 6.31V1.5H9v4.81C7.21 7.35 6 9.28 6 11.5c0 3.31 2.69 6 6 6s6-2.69 6-6c0-2.22-1.21-4.15-3-5.19z"/><path d="M20 10.5v2h3v-2h-3z"/><path d="M17.24 18.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z"/>',
		'wb_irradescent': '<path d="M5 14.5h14v-6H5v6z"/><path d="M11 .55V3.5h2V.55h-2z"/><path d="M19.04 3.05l-1.79 1.79 1.41 1.41 1.8-1.79-1.42-1.41z"/><path d="M13 22.45V19.5h-2v2.95h2z"/><path d="M20.45 18.54l-1.8-1.79-1.41 1.41 1.79 1.8 1.42-1.42z"/><path d="M3.55 4.46l1.79 1.79 1.41-1.41-1.79-1.79-1.41 1.41z"/><path d="M4.96 19.95l1.79-1.8-1.41-1.41-1.79 1.79 1.41 1.42z"/>',
		'wb_sunny': '<path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41z"/><path d="M4 10.5H1v2h3v-2z"/><path d="M13 .55h-2V3.5h2V.55z"/><path d="M20.45 4.46l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79z"/><path d="M17.24 18.16l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4z"/><path d="M20 10.5v2h3v-2h-3z"/><path d="M12 5.5c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/><path d="M11 22.45h2V19.5h-2v2.95z"/><path d="M3.55 18.54l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/>',
		//
		// maps
		//
		'add_location': '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm4 8h-3v3h-2v-3H8V8h3V5h2v3h3v2z"/>',
		'beenhere': '<path d="M19 1H5c-1.1 0-1.99.9-1.99 2L3 15.93c0 .69.35 1.3.88 1.66L12 23l8.11-5.41c.53-.36.88-.97.88-1.66L21 3c0-1.1-.9-2-2-2zm-9 15l-5-5 1.41-1.41L10 13.17l7.59-7.59L19 7l-9 9z"/>',
		'directions': '<path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>',
		'directions_bike': '<path d="M16 4.8c.99 0 1.8-.81 1.8-1.8s-.81-1.8-1.8-1.8c-1 0-1.8.81-1.8 1.8S15 4.8 16 4.8z"/><path d="M19 20.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zm0-8.5c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/><path d="M14.8 10H19V8.2h-3.2l-1.93-3.27c-.3-.5-.84-.83-1.46-.83-.47 0-.89.19-1.2.5l-3.7 3.7c-.32.3-.51.73-.51 1.2 0 .63.33 1.16.85 1.47L11.2 13v5H13v-6.48l-2.25-1.67 2.32-2.33L14.8 10z"/><path d="M5 20.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5zM5 12c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/>',
		'directions_bus': '<path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>',
		'directions_car': '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
		'directions_ferry': '<path d="M20 21c-1.39 0-2.78-.47-4-1.32-2.44 1.71-5.56 1.71-8 0C6.78 20.53 5.39 21 4 21H2v2h2c1.38 0 2.74-.35 4-.99 2.52 1.29 5.48 1.29 8 0 1.26.65 2.62.99 4 .99h2v-2h-2z"/><path d="M6 6h12v3.97L12 8 6 9.97V6zM3.95 19H4c1.6 0 3.02-.88 4-2 .98 1.12 2.4 2 4 2s3.02-.88 4-2c.98 1.12 2.4 2 4 2h.05l1.89-6.68c.08-.26.06-.54-.06-.78s-.34-.42-.6-.5L20 10.62V6c0-1.1-.9-2-2-2h-3V1H9v3H6c-1.1 0-2 .9-2 2v4.62l-1.29.42c-.26.08-.48.26-.6.5s-.15.52-.06.78L3.95 19z"/>',
		'directions_subway': '<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/>',
		'directions_train': '<path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z"/>',
		'directions_transit': '<path d="M12 2c-4.42 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z"/>',
		'directions_walk': '<path d="M14 3.8c.99 0 1.8-.81 1.8-1.8 0-1-.81-1.8-1.8-1.8-1 0-1.8.81-1.8 1.8S13 3.8 14 3.8z"/><path d="M14.12 10H19V8.2h-3.62l-2-3.33c-.3-.5-.84-.83-1.46-.83-.17 0-.34.03-.49.07L6 5.8V11h1.8V7.33l2.11-.66L6 22h1.8l2.87-8.11L13 17v5h1.8v-6.41l-2.49-4.54.73-2.87L14.12 10z"/>',
		'edit_location': '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm-1.56 10H9v-1.44l3.35-3.34 1.43 1.43L10.44 12zm4.45-4.45l-.7.7-1.44-1.44.7-.7c.15-.15.39-.15.54 0l.9.9c.15.15.15.39 0 .54z"/>',
		'ev_station': '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM18 10c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM8 18v-4.5H6L10 6v5h2l-4 7z"/>',
		'flight': '<path d="M10.18 9"/><path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
		'hotel': '<path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3z"/><path d="M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>',
		'layers': '<path d="M11.99 18.54l-7.37-5.73L3 14.07l9 7 9-7-1.63-1.27-7.38 5.74z"/><path d="M12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27L12 16z"/>',
		'layers_clear': '<path d="M19.81 14.99l1.19-.92-1.43-1.43-1.19.92 1.43 1.43z"/><path d="M19.36 10.27L21 9l-9-7-2.91 2.27 7.87 7.88 2.4-1.88z"/><path d="M3.27 1L2 2.27l4.22 4.22L3 9l1.63 1.27L12 16l2.1-1.63 1.43 1.43L12 18.54l-7.37-5.73L3 14.07l9 7 4.95-3.85L20.73 21 22 19.73 3.27 1z"/>',
		'local_activity': '<path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z"/>',
		'local_airport': '<path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/>',
		'local_atm': '<path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1z"/><path d="M20 18H4V6h16v12zm0-14H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z"/>',
		'local_bar': '<path d="M11 13v6H6v2h12v-2h-5v-6l8-8V3H3v2l8 8zM7.5 7l-2-2h13l-2 2h-9z"/>',
		'local_cafe': '<path d="M20 8h-2V5h2v3zm0-5H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2c1.11 0 2-.89 2-2V5c0-1.11-.89-2-2-2z"/><path d="M2 21h18v-2H2v2z"/>',
		'local_car_wash': '<path d="M17 5c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5z"/><path d="M12 5c.83 0 1.5-.67 1.5-1.5 0-1-1.5-2.7-1.5-2.7s-1.5 1.7-1.5 2.7c0 .83.67 1.5 1.5 1.5z"/><path d="M7 5c.83 0 1.5-.67 1.5-1.5C8.5 2.5 7 .8 7 .8S5.5 2.5 5.5 3.5C5.5 4.33 6.17 5 7 5z"/><path d="M5 13l1.5-4.5h11L19 13H5zm12.5 5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm-11 0c-.83 0-1.5-.67-1.5-1.5S5.67 15 6.5 15s1.5.67 1.5 1.5S7.33 18 6.5 18zm12.42-9.99C18.72 7.42 18.16 7 17.5 7h-11c-.66 0-1.21.42-1.42 1.01L3 14v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99z"/>',
		'local_convenience_store': '<path d="M19 7V4H5v3H2v13h8v-4h4v4h8V7h-3zm-8 3H9v1h2v1H8V9h2V8H8V7h3v3zm5 2h-1v-2h-2V7h1v2h1V7h1v5z"/>',
		'local_dining': '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
		'local_drink': '<path d="M3 2l2.01 18.23C5.13 21.23 5.97 22 7 22h10c1.03 0 1.87-.77 1.99-1.77L21 2H3zm9 17c-1.66 0-3-1.34-3-3 0-2 3-5.4 3-5.4s3 3.4 3 5.4c0 1.66-1.34 3-3 3zm6.33-11H5.67l-.44-4h13.53l-.43 4z"/>',
		'local_florist': '<path d="M12 22c4.97 0 9-4.03 9-9-4.97 0-9 4.03-9 9z"/><path d="M12 5.5c1.38 0 2.5 1.12 2.5 2.5s-1.12 2.5-2.5 2.5S9.5 9.38 9.5 8s1.12-2.5 2.5-2.5zm-6.4 4.75c0 1.38 1.12 2.5 2.5 2.5.53 0 1.01-.16 1.42-.44l-.02.19c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5l-.02-.19c.4.28.89.44 1.42.44 1.38 0 2.5-1.12 2.5-2.5 0-1-.59-1.85-1.43-2.25.84-.4 1.43-1.25 1.43-2.25 0-1.38-1.12-2.5-2.5-2.5-.53 0-1.01.16-1.42.44l.02-.19C14.5 2.12 13.38 1 12 1S9.5 2.12 9.5 3.5l.02.19c-.4-.28-.89-.44-1.42-.44-1.38 0-2.5 1.12-2.5 2.5 0 1 .59 1.85 1.43 2.25-.84.4-1.43 1.25-1.43 2.25z"/><path d="M3 13c0 4.97 4.03 9 9 9 0-4.97-4.03-9-9-9z"/>',
		'local_gas_station': '<path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5zm6 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>',
		'local_grocery_store': '<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2z"/><path d="M1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1z"/><path d="M17 18c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>',
		'local_hospital': '<path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>',
		'local_hotel': '<path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3z"/><path d="M19 7h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z"/>',
		'local_laundry_service': '<path d="M9.17 16.83a4.008 4.008 0 0 0 5.66 0 4.008 4.008 0 0 0 0-5.66l-5.66 5.66z"/><path d="M12 20c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zM7 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm3 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm8-1.99L6 2c-1.11 0-2 .89-2 2v16c0 1.11.89 2 2 2h12c1.11 0 2-.89 2-2V4c0-1.11-.89-1.99-2-1.99z"/>',
		'local_library': '<path d="M12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.19 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55z"/>',
		'local_mall': '<path d="M19 6h-2c0-2.76-2.24-5-5-5S7 3.24 7 6H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-7-3c1.66 0 3 1.34 3 3H9c0-1.66 1.34-3 3-3zm0 10c-2.76 0-5-2.24-5-5h2c0 1.66 1.34 3 3 3s3-1.34 3-3h2c0 2.76-2.24 5-5 5z"/>',
		'local_movies': '<path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/>',
		'local_offer': '<path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>',
		'local_parking': '<path d="M13 3H6v18h4v-6h3c3.31 0 6-2.69 6-6s-2.69-6-6-6zm.2 8H10V7h3.2c1.1 0 2 .9 2 2s-.9 2-2 2z"/>',
		'local_pharmacy': '<path d="M21 5h-2.64l1.14-3.14L17.15 1l-1.46 4H3v2l2 6-2 6v2h18v-2l-2-6 2-6V5zm-5 9h-3v3h-2v-3H8v-2h3V9h2v3h3v2z"/>',
		'local_phone': '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
		'local_pizza': '<path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>',
		'local_play': '<path d="M20 12c0-1.1.9-2 2-2V6c0-1.1-.9-2-2-2H4c-1.1 0-1.99.9-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2zm-4.42 4.8L12 14.5l-3.58 2.3 1.08-4.12-3.29-2.69 4.24-.25L12 5.8l1.54 3.95 4.24.25-3.29 2.69 1.09 4.11z"/>',
		'local_post_office': '<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>',
		'local_print_shop': '<path d="M19 12c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-3 7H8v-5h8v5zm3-11H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3z"/><path d="M18 3H6v4h12V3z"/>',
		'local_restaurant': '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
		'local_see': '<circle cx="12" cy="12" r="3.2"/><path d="M12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>',
		'local_shipping': '<path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'local_taxi': '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5H15V3H9v2H6.5c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>',
		'map': '<path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9c-.21.07-.36.25-.36.48V20.5c0 .28.22.5.5.5l.16-.03L9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5c0-.28-.22-.5-.5-.5zM15 19l-6-2.11V5l6 2.11V19z"/>',
		'my_location': '<path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"/><path d="M12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm8.94-8c-.46-4.17-3.77-7.48-7.94-7.94V1h-2v2.06C6.83 3.52 3.52 6.83 3.06 11H1v2h2.06c.46 4.17 3.77 7.48 7.94 7.94V23h2v-2.06c4.17-.46 7.48-3.77 7.94-7.94H23v-2h-2.06z"/>',
		'navigation': '<path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>',
		'near_me': '<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>',
		'person_pin_circle': '<path d="M12 2C8.14 2 5 5.14 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.86-3.14-7-7-7zm0 2c1.1 0 2 .9 2 2 0 1.11-.9 2-2 2s-2-.89-2-2c0-1.1.9-2 2-2zm0 10c-1.67 0-3.14-.85-4-2.15.02-1.32 2.67-2.05 4-2.05s3.98.73 4 2.05c-.86 1.3-2.33 2.15-4 2.15z"/>',
		'person_pin': '<path d="M19 2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h4l3 3 3-3h4c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 3.3c1.49 0 2.7 1.21 2.7 2.7 0 1.49-1.21 2.7-2.7 2.7-1.49 0-2.7-1.21-2.7-2.7 0-1.49 1.21-2.7 2.7-2.7zM18 16H6v-.9c0-2 4-3.1 6-3.1s6 1.1 6 3.1v.9z"/>',
		'pin_drop': '<path d="M10 8c0-1.1.9-2 2-2s2 .9 2 2-.89 2-2 2c-1.1 0-2-.9-2-2zm8 0c0-3.31-2.69-6-6-6S6 4.69 6 8c0 4.5 6 11 6 11s6-6.5 6-11z"/><path d="M5 20v2h14v-2H5z"/>',
		'place': '<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>',
		'rate_review': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 14v-2.47l6.88-6.88c.2-.2.51-.2.71 0l1.77 1.77c.2.2.2.51 0 .71L8.47 14H6zm12 0h-7.5l2-2H18v2z"/>',
		'restaurant': '<path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7z"/><path d="M16 6v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>',
		'restaurant_menu': '<path d="M8.1 13.34l2.83-2.83L3.91 3.5a4.008 4.008 0 0 0 0 5.66l4.19 4.18z"/><path d="M14.88 11.53c1.53.71 3.68.21 5.27-1.38 1.91-1.91 2.28-4.65.81-6.12-1.46-1.46-4.2-1.1-6.12.81-1.59 1.59-2.09 3.74-1.38 5.27L3.7 19.87l1.41 1.41L12 14.41l6.88 6.88 1.41-1.41L13.41 13l1.47-1.47z"/>',
		'satellite': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM5 4.99h3C8 6.65 6.66 8 5 8V4.99zM5 12v-2c2.76 0 5-2.25 5-5.01h2C12 8.86 8.87 12 5 12zm0 6l3.5-4.5 2.5 3.01L14.5 12l4.5 6H5z"/>',
		'store_mall_directory': '<path d="M20 4H4v2h16V4z"/><path d="M12 18H6v-4h6v4zm9-4v-2l-1-5H4l-1 5v2h1v6h10v-6h4v6h2v-6h1z"/>',
		'streetview': '<path d="M12.56 14.33c-.34.27-.56.7-.56 1.17V21h7c1.1 0 2-.9 2-2v-5.98c-.94-.33-1.95-.52-3-.52-2.03 0-3.93.7-5.44 1.83z"/><circle cx="18" cy="6" r="5"/><path d="M11.5 6c0-1.08.27-2.1.74-3H5c-1.1 0-2 .9-2 2v14c0 .55.23 1.05.59 1.41l9.82-9.82C12.23 9.42 11.5 7.8 11.5 6z"/>',
		'subway': '<circle cx="15.5" cy="16" r="1"/><circle cx="8.5" cy="16" r="1"/><path d="M7.01 9h10v5h-10z"/><path d="M17.8 2.8C16 2.09 13.86 2 12 2c-1.86 0-4 .09-5.8.8C3.53 3.84 2 6.05 2 8.86V22h20V8.86c0-2.81-1.53-5.02-4.2-6.06zm.2 13.08c0 1.45-1.18 2.62-2.63 2.62l1.13 1.12V20H15l-1.5-1.5h-2.83L9.17 20H7.5v-.38l1.12-1.12C7.18 18.5 6 17.32 6 15.88V9c0-2.63 3-3 6-3 3.32 0 6 .38 6 3v6.88z"/>',
		'terrain': '<path d="M14 6l-3.75 5 2.85 3.8-1.6 1.2C9.81 13.75 7 10 7 10l-6 8h22L14 6z"/>',
		'traffic': '<path d="M20 10h-3V8.86c1.72-.45 3-2 3-3.86h-3V4c0-.55-.45-1-1-1H8c-.55 0-1 .45-1 1v1H4c0 1.86 1.28 3.41 3 3.86V10H4c0 1.86 1.28 3.41 3 3.86V15H4c0 1.86 1.28 3.41 3 3.86V20c0 .55.45 1 1 1h8c.55 0 1-.45 1-1v-1.14c1.72-.45 3-2 3-3.86h-3v-1.14c1.72-.45 3-2 3-3.86zm-8 9c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2s.89-2 2-2c1.1 0 2 .9 2 2s-.89 2-2 2zm0-5c-1.11 0-2-.9-2-2 0-1.11.89-2 2-2 1.1 0 2 .89 2 2 0 1.1-.89 2-2 2z"/>',
		'train': '<path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-7H6V6h5v4zm2 0V6h5v4h-5zm3.5 7c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'tram': '<path d="M19 16.94V8.5c0-2.79-2.61-3.4-6.01-3.49l.76-1.51H17V2H7v1.5h4.75l-.76 1.52C7.86 5.11 5 5.73 5 8.5v8.44c0 1.45 1.19 2.66 2.59 2.97L6 21.5v.5h2.23l2-2H14l2 2h2v-.5L16.5 20h-.08c1.69 0 2.58-1.37 2.58-3.06zm-7 1.56c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5-4.5H7V9h10v5z"/>',
		'transfer_within_a_station': '<path d="M16.49 15.5v-1.75L14 16.25l2.49 2.5V17H22v-1.5z"/><path d="M19.51 19.75H14v1.5h5.51V23L22 20.5 19.51 18z"/><path d="M9.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM5.75 8.9L3 23h2.1l1.75-8L9 17v6h2v-7.55L8.95 13.4l.6-3C10.85 12 12.8 13 15 13v-2c-1.85 0-3.45-1-4.35-2.45l-.95-1.6C9.35 6.35 8.7 6 8 6c-.25 0-.5.05-.75.15L2 8.3V13h2V9.65l1.75-.75"/>',
		'zoom_out_map': '<path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3z"/><path d="M3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3z"/><path d="M9 21l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6z"/><path d="M21 15l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6z"/>',
		//
		// navigation
		//
		'apps': '<path d="M4 8h4V4H4v4z"/><path d="M10 20h4v-4h-4v4z"/><path d="M4 20h4v-4H4v4z"/><path d="M4 14h4v-4H4v4z"/><path d="M10 14h4v-4h-4v4z"/><path d="M16 4v4h4V4h-4z"/><path d="M10 8h4V4h-4v4z"/><path d="M16 14h4v-4h-4v4z"/><path d="M16 20h4v-4h-4v4z"/>',
		'arrow_back': '<path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>',
		'arrow_downward': '<path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"/>',
		'arrow_drop_down': '<path d="M7 10l5 5 5-5z"/>',
		'arrow_drop_down_circle': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 12l-4-4h8l-4 4z"/>',
		'arrow_drop_up': '<path d="M7 14l5-5 5 5z"/>',
		'arrow_forward': '<path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>',
		'arrow_upwards': '<path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z"/>',
		'cancel': '<path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>',
		'check': '<path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>',
		'chevron_left': '<path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>',
		'chevron_right': '<path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>',
		'close': '<path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>',
		'expand_less': '<path d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"/>',
		'expand_more': '<path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"/>',
		'first_page': '<path d="M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6z"/><path d="M6 6h2v12H6z"/>',
		'fullscreen': '<path d="M7 14H5v5h5v-2H7v-3z"/><path d="M5 10h2V7h3V5H5v5z"/><path d="M17 17h-3v2h5v-5h-2v3z"/><path d="M14 5v2h3v3h2V5h-5z"/>',
		'fullscreen_exit': '<path d="M5 16h3v3h2v-5H5v2z"/><path d="M8 8H5v2h5V5H8v3z"/><path d="M14 19h2v-3h3v-2h-5v5z"/><path d="M16 8V5h-2v5h5V8h-3z"/>',
		'last_page': '<path d="M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6z"/><path d="M16 6h2v12h-2z"/>',
		'menu': '<path d="M3 18h18v-2H3v2z"/><path d="M3 13h18v-2H3v2z"/><path d="M3 6v2h18V6H3z"/>',
		'more_horiz': '<path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M18 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
		'more_vert': '<path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/><path d="M12 16c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/><path d="M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>',
		'refresh': '<path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>',
		'subdirectory_arrow_left': ' <path d="M11 9l1.42 1.42L8.83 14H18V4h2v12H8.83l3.59 3.58L11 21l-6-6 6-6z"/>',
		'subdirectory_arrow_right': '<path d="M19 15l-6 6-1.42-1.42L15.17 16H4V4h2v10h9.17l-3.59-3.58L13 9l6 6z"/>',
		//
		// notification
		//
		'adb': '<path d="M5 16c0 3.87 3.13 7 7 7s7-3.13 7-7v-4H5v4z"/><path d="M15 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zM9 9c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm7.12-4.63l2.1-2.1-.82-.83-2.3 2.31C14.16 3.28 13.12 3 12 3s-2.16.28-3.09.75L6.6 1.44l-.82.83 2.1 2.1C6.14 5.64 5 7.68 5 10v1h14v-1c0-2.32-1.14-4.36-2.88-5.63z"/>',
		'airline_seat_flat': '<path d="M22 11v2H9V7h9c2.21 0 4 1.79 4 4z"/><path d="M2 14v2h6v2h8v-2h6v-2H2z"/><path d="M7.14 12.1a3 3 0 0 0-.04-4.24 3 3 0 0 0-4.24.04 3 3 0 0 0 .04 4.24 3 3 0 0 0 4.24-.04z"/>',
		'airline_seat_angled': '<path d="M22.25 14.29l-.69 1.89L9.2 11.71l2.08-5.66 8.56 3.09a4 4 0 0 1 2.41 5.15z"/><path d="M1.5 12.14L8 14.48V19h8v-1.63L20.52 19l.69-1.89-19.02-6.86-.69 1.89z"/><path d="M7.3 10.2a3.01 3.01 0 0 0 1.41-4A3.005 3.005 0 0 0 4.7 4.8a2.99 2.99 0 0 0-1.4 4 2.99 2.99 0 0 0 4 1.4z"/>',
		'airline_seat_individual_suite': '<path d="M7 13c1.65 0 3-1.35 3-3S8.65 7 7 7s-3 1.35-3 3 1.35 3 3 3z"/><path d="M19 7h-8v7H3V7H1v10h22v-6c0-2.21-1.79-4-4-4z"/>',
		'airline_seat_legroom_extra': '<path d="M4 12V3H2v9c0 2.76 2.24 5 5 5h6v-2H7c-1.66 0-3-1.34-3-3z"/><path d="M22.83 17.24c-.38-.72-1.29-.97-2.03-.63l-1.09.5-3.41-6.98a2.01 2.01 0 0 0-1.79-1.12L11 9V3H5v8c0 1.66 1.34 3 3 3h7l3.41 7 3.72-1.7c.77-.36 1.1-1.3.7-2.06z"/>',
		'airline_seat_legroom_normal': '<path d="M5 12V3H3v9c0 2.76 2.24 5 5 5h6v-2H8c-1.66 0-3-1.34-3-3z"/><path d="M20.5 18H19v-7c0-1.1-.9-2-2-2h-5V3H6v8c0 1.65 1.35 3 3 3h7v7h4.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z"/>',
		'airline_seat_legroom_reduced': '<path d="M19.97 19.2c.18.96-.55 1.8-1.47 1.8H14v-3l1-4H9c-1.65 0-3-1.35-3-3V3h6v6h5c1.1 0 2 .9 2 2l-2 7h1.44c.73 0 1.39.49 1.53 1.2z"/><path d="M5 12V3H3v9c0 2.76 2.24 5 5 5h4v-2H8c-1.66 0-3-1.34-3-3z"/>',
		'airline_seat_recline_extra': '<path d="M5.35 5.64c-.9-.64-1.12-1.88-.49-2.79.63-.9 1.88-1.12 2.79-.49.9.64 1.12 1.88.49 2.79-.64.9-1.88 1.12-2.79.49z"/><path d="M16 19H8.93c-1.48 0-2.74-1.08-2.96-2.54L4 7H2l1.99 9.76A5.01 5.01 0 0 0 8.94 21H16v-2z"/><path d="M16.23 15h-4.88l-1.03-4.1c1.58.89 3.28 1.54 5.15 1.22V9.99c-1.63.31-3.44-.27-4.69-1.25L9.14 7.47c-.23-.18-.49-.3-.76-.38a2.21 2.21 0 0 0-.99-.06h-.02a2.268 2.268 0 0 0-1.84 2.61l1.35 5.92A3.008 3.008 0 0 0 9.83 18h6.85l3.82 3 1.5-1.5-5.77-4.5z"/>',
		'airline_seat_recline_normal': '<path d="M7.59 5.41c-.78-.78-.78-2.05 0-2.83.78-.78 2.05-.78 2.83 0 .78.78.78 2.05 0 2.83-.79.79-2.05.79-2.83 0z"/><path d="M6 16V7H4v9c0 2.76 2.24 5 5 5h6v-2H9c-1.66 0-3-1.34-3-3z"/><path d="M20 20.07L14.93 15H11.5v-3.68c1.4 1.15 3.6 2.16 5.5 2.16v-2.16c-1.66.02-3.61-.87-4.67-2.04l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C8.01 7 7 8.01 7 9.25V15c0 1.66 1.34 3 3 3h5.07l3.5 3.5L20 20.07z"/>',
		'bluetooth_audio': '<path d="M19.53 6.71l-1.26 1.26c.63 1.21.98 2.57.98 4.02 0 1.45-.36 2.82-.98 4.02l1.2 1.2c.97-1.54 1.54-3.36 1.54-5.31-.01-1.89-.55-3.67-1.48-5.19zm-5.29 5.3l2.32 2.32c.28-.72.44-1.51.44-2.33 0-.82-.16-1.59-.43-2.31l-2.33 2.32z"/><path d="M12.88 16.29L11 18.17v-3.76l1.88 1.88zM11 5.83l1.88 1.88L11 9.59V5.83zm4.71 1.88L10 2H9v7.59L4.41 5 3 6.41 8.59 12 3 17.59 4.41 19 9 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29z"/>',
		'confirmation_number': '<path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-9 7.5h-2v-2h2v2zm0-4.5h-2v-2h2v2zm0-4.5h-2v-2h2v2z"/>',
		'disc_full': '<path d="M20 7v5h2V7h-2zm0 9h2v-2h-2v2z"/><path d="M10 14c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c-4.42 0-8 3.58-8 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8z"/>',
		'do_not_disturb': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z"/>',
		'do_not_disturb_alt': '<path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zM4 12c0-4.4 3.6-8 8-8 1.8 0 3.5.6 4.9 1.7L5.7 16.9C4.6 15.5 4 13.8 4 12zm8 8c-1.8 0-3.5-.6-4.9-1.7L18.3 7.1C19.4 8.5 20 10.2 20 12c0 4.4-3.6 8-8 8z"/>',
		'do_not_disturb_off': '<path d="M17 11v2h-1.46l4.68 4.68A9.92 9.92 0 0 0 22 12c0-5.52-4.48-10-10-10-2.11 0-4.07.66-5.68 1.78L13.54 11H17z"/><path d="M7 13v-2h1.46l2 2H7zM2.27 2.27L1 3.54l2.78 2.78A9.92 9.92 0 0 0 2 12c0 5.52 4.48 10 10 10 2.11 0 4.07-.66 5.68-1.78L20.46 23l1.27-1.27L11 11 2.27 2.27z"/>',
		'do_not_disturb_on': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>',
		'drive_eta': '<path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>',
		'enhanced_encryption': '<path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM8.9 6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2H8.9V6zM16 16h-3v3h-2v-3H8v-2h3v-3h2v3h3v2z"/>',
		'event_available': '<path d="M16.53 11.06L15.47 10l-4.88 4.88-2.12-2.12-1.06 1.06L10.59 17l5.94-5.94z"/><path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'event_busy': '<path d="M9.31 17l2.44-2.44L14.19 17l1.06-1.06-2.44-2.44 2.44-2.44L14.19 10l-2.44 2.44L9.31 10l-1.06 1.06 2.44 2.44-2.44 2.44L9.31 17z"/><path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'event_note': '<path d="M19 19H5V8h14v11zm0-16h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/><path d="M14 14H7v2h7v-2zm3-4H7v2h10v-2z"/>',
		'folder_special': '<path d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6.42 12L10 15.9 6.42 18l.95-4.07-3.16-2.74 4.16-.36L10 7l1.63 3.84 4.16.36-3.16 2.74.95 4.06z"/>',
		'live_tv': '<path d="M21 20H3V8h18v12zm0-14h-7.59l3.29-3.29L16 2l-4 4-4-4-.71.71L10.59 6H3a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8a2 2 0 0 0-2-2z"/><path d="M9 10v8l7-4z"/>',
		'mms': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM5 14l3.5-4.5 2.5 3.01L14.5 8l4.5 6H5z"/>',
		'more': '<path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.97.89 1.66.89H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 13.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm5 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>',
		'network_check': '<path d="M15.9 5c-.17 0-.32.09-.41.23l-.07.15-5.18 11.65c-.16.29-.26.61-.26.96 0 1.11.9 2.01 2.01 2.01.96 0 1.77-.68 1.96-1.59l.01-.03L16.4 5.5c0-.28-.22-.5-.5-.5z"/><path d="M21 11l2-2a15.367 15.367 0 0 0-5.59-3.57l-.53 2.82c1.5.62 2.9 1.53 4.12 2.75zM1 9l2 2c2.88-2.88 6.79-4.08 10.53-3.62l1.19-2.68C9.89 3.84 4.74 5.27 1 9z"/><path d="M5 13l2 2a7.1 7.1 0 0 1 4.03-2l1.28-2.88c-2.63-.08-5.3.87-7.31 2.88zm12 2l2-2c-.8-.8-1.7-1.42-2.66-1.89l-.55 2.92c.42.27.83.59 1.21.97z"/>',
		'network_locked': '<path d="M19.5 10c.17 0 .33.03.5.05V1L1 20h13v-3c0-.89.39-1.68 1-2.23v-.27c0-2.48 2.02-4.5 4.5-4.5z"/><path d="M21 16h-3v-1.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5V16zm1 0v-1.5c0-1.38-1.12-2.5-2.5-2.5S17 13.12 17 14.5V16c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1v-4c0-.55-.45-1-1-1z"/>',
		'no_encryption': '<path d="M21 21.78L4.22 5 3 6.22l2.04 2.04C4.42 8.6 4 9.25 4 10v10c0 1.1.9 2 2 2h12c.23 0 .45-.05.66-.12L19.78 23 21 21.78z"/><path d="M8.9 6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2H9.66L20 18.34V10c0-1.1-.9-2-2-2h-1V6c0-2.76-2.24-5-5-5-2.56 0-4.64 1.93-4.94 4.4L8.9 7.24V6z"/>',
		'ondemand_video': '<path d="M21 17H3V5h18v12zm0-14H3c-1.11 0-2 .89-2 2v12a2 2 0 0 0 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5a2 2 0 0 0-2-2z"/><path d="M16 11l-7 4V7z"/>',
		'personal_video': '<path d="M21 3H3c-1.11 0-2 .89-2 2v12c0 1.1.89 2 2 2h5v2h8v-2h5c1.1 0 1.99-.9 1.99-2L23 5c0-1.11-.9-2-2-2zm0 14H3V5h18v12z"/>',
		'phone_bluetooth_speaker': '<path d="M18 7.21l.94.94-.94.94V7.21zm0-4.3l.94.94-.94.94V2.91zM14.71 9.5L17 7.21V11h.5l2.85-2.85L18.21 6l2.15-2.15L17.5 1H17v3.79L14.71 2.5l-.71.71L16.79 6 14 8.79l.71.71z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
		'phone_forwarded': '<path d="M18 11l5-5-5-5v3h-4v4h4v3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>',
		'phone_in_talk': '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 12h2c0-4.97-4.03-9-9-9v2c3.87 0 7 3.13 7 7z"/><path d="M15 12h2c0-2.76-2.24-5-5-5v2c1.66 0 3 1.34 3 3z"/>',
		'phone_locked': '<path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19.2 4h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4zm.8 0v-.5C20 2.12 18.88 1 17.5 1S15 2.12 15 3.5V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/>',
		'phone_missed': '<path d="M6.5 5.5L12 11l7-7-1-1-6 6-4.5-4.5H11V3H5v6h1.5V5.5z"/><path d="M23.71 16.67C20.66 13.78 16.54 12 12 12 7.46 12 3.34 13.78.29 16.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73 1.6 0 3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.12-.52-.3-.7z"/>',
		'phone_paused': '<path d="M17 3h-2v7h2V3z"/><path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/><path d="M19 3v7h2V3h-2z"/>',
		'power': '<path d="M16.01 7L16 3h-2v4h-4V3H8v4h-.01C7 6.99 6 7.99 6 8.99v5.49L9.5 18v3h5v-3l3.5-3.51v-5.5c0-1-1-2-1.99-1.99z"/>',
		'priority_high': '<circle cx="12" cy="19" r="2"/><path d="M10 3h4v12h-4z"/>',
		'sd_card': '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-6 6h-2V4h2v4zm3 0h-2V4h2v4zm3 0h-2V4h2v4z"/>',
		'sim_card_alert': '<path d="M18 2h-8L4.02 8 4 20c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 15h-2v-2h2v2zm0-4h-2V8h2v5z"/>',
		'sms': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>',
		'sms_failed': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 12h-2v-2h2v2zm0-4h-2V6h2v4z"/>',
		'sync': '<path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8z"/><path d="M12 18c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/>',
		'sync_disabled': '<path d="M10 6.35V4.26c-.8.21-1.55.54-2.23.96l1.46 1.46c.25-.12.5-.24.77-.33z"/><path d="M2.86 5.41l2.36 2.36a7.925 7.925 0 0 0 1.14 9.87L4 20h6v-6l-2.24 2.24A6.003 6.003 0 0 1 6 12c0-1 .25-1.94.68-2.77l8.08 8.08c-.25.13-.5.25-.77.34v2.09c.8-.21 1.55-.54 2.23-.96l2.36 2.36 1.27-1.27L4.14 4.14 2.86 5.41z"/><path d="M20 4h-6v6l2.24-2.24A6.003 6.003 0 0 1 18 12c0 1-.25 1.94-.68 2.77l1.46 1.46a7.925 7.925 0 0 0-1.14-9.87L20 4z"/>',
		'sync_problem': '<path d="M3 12c0 2.21.91 4.2 2.36 5.64L3 20h6v-6l-2.24 2.24C5.68 15.15 5 13.66 5 12c0-2.61 1.67-4.83 4-5.65V4.26C5.55 5.15 3 8.27 3 12z"/><path d="M21 4h-6v6l2.24-2.24C18.32 8.85 19 10.34 19 12c0 2.61-1.67 4.83-4 5.65v2.09c3.45-.89 6-4.01 6-7.74 0-2.21-.91-4.2-2.36-5.64L21 4z"/><path d="M11 13h2V7h-2v6zm0 4h2v-2h-2v2z"/>',
		'system_update': '<path d="M17 19H7V5h10v14zm0-17.99L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/><path d="M16 13h-3V8h-2v5H8l4 4 4-4z"/>',
		'tap_and_play': '<path d="M2 16v2c2.76 0 5 2.24 5 5h2c0-3.87-3.13-7-7-7z"/><path d="M2 20v3h3c0-1.66-1.34-3-3-3z"/><path d="M2 12v2a9 9 0 0 1 9 9h2c0-6.08-4.92-11-11-11z"/><path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v7.37c.69.16 1.36.37 2 .64V5h10v13h-3.03c.52 1.25.84 2.59.95 4H17c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99z"/>',
		'time_to_leave': '<path d="M18.92 5.01C18.72 4.42 18.16 4 17.5 4h-11c-.66 0-1.21.42-1.42 1.01L3 11v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 15c-.83 0-1.5-.67-1.5-1.5S5.67 12 6.5 12s1.5.67 1.5 1.5S7.33 15 6.5 15zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 10l1.5-4.5h11L19 10H5z"/>',
		'vibration': '<path d="M0 15h2V9H0v6z"/><path d="M3 17h2V7H3v10z"/><path d="M22 9v6h2V9h-2z"/><path d="M19 17h2V7h-2v10z"/><path d="M16 19H8V5h8v14zm.5-16h-9C6.67 3 6 3.67 6 4.5v15c0 .83.67 1.5 1.5 1.5h9c.83 0 1.5-.67 1.5-1.5v-15c0-.83-.67-1.5-1.5-1.5z"/>',
		'voice_chat': '<path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12l-4-3.2V14H6V6h8v3.2L18 6v8z"/>',
		'vpn_lock': '<path d="M21.2 4h-3.4v-.5c0-.94.76-1.7 1.7-1.7s1.7.76 1.7 1.7V4zm.8 0v-.5a2.5 2.5 0 0 0-5 0V4c-.55 0-1 .45-1 1v4c0 .55.45 1 1 1h5c.55 0 1-.45 1-1V5c0-.55-.45-1-1-1z"/><path d="M10 20.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L8 16v1c0 1.1.9 2 2 2v1.93zM18.92 12c.04.33.08.66.08 1 0 2.08-.8 3.97-2.1 5.39-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H7v-2h2c.55 0 1-.45 1-1V8h2c1.1 0 2-.9 2-2V3.46c-.95-.3-1.95-.46-3-.46C5.48 3 1 7.48 1 13s4.48 10 10 10 10-4.48 10-10c0-.34-.02-.67-.05-1h-2.03z"/>',
		'wc': '<path d="M5.5 22v-7.5H4V9c0-1.1.9-2 2-2h3c1.1 0 2 .9 2 2v5.5H9.5V22h-4z"/><path d="M18 22v-6h3l-2.54-7.63A2.01 2.01 0 0 0 16.56 7h-.12a2 2 0 0 0-1.9 1.37L12 16h3v6h3z"/><path d="M7.5 6c1.11 0 2-.89 2-2 0-1.11-.89-2-2-2-1.11 0-2 .89-2 2 0 1.11.89 2 2 2z"/><path d="M16.5 6c1.11 0 2-.89 2-2 0-1.11-.89-2-2-2-1.11 0-2 .89-2 2 0 1.11.89 2 2 2z"/>',
		'wifi': '<path d="M1 9l2 2c4.97-4.97 13.03-4.97 18 0l2-2C16.93 2.93 7.08 2.93 1 9z"/><path d="M9 17l3 3 3-3a4.237 4.237 0 0 0-6 0z"/><path d="M5 13l2 2a7.074 7.074 0 0 1 10 0l2-2C15.14 9.14 8.87 9.14 5 13z"/>',
		//
		// places
		//
		'ac_unit': '<path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/>',
		'airport_shuttle': '<path d="M17 5H3c-1.1 0-2 .89-2 2v9h2c0 1.65 1.34 3 3 3s3-1.35 3-3h5.5c0 1.65 1.34 3 3 3s3-1.35 3-3H23v-5l-6-6zM3 11V7h4v4H3zm3 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm7-6.5H9V7h4v4zm4.5 6.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM15 11V7h1l4 4h-5z"/>',
		'all_inclusive': '<path d="M18.6 6.62c-1.44 0-2.8.56-3.77 1.53L12 10.66 10.48 12h.01L7.8 14.39c-.64.64-1.49.99-2.4.99-1.87 0-3.39-1.51-3.39-3.38S3.53 8.62 5.4 8.62c.91 0 1.76.35 2.44 1.03l1.13 1 1.51-1.34L9.22 8.2C8.2 7.18 6.84 6.62 5.4 6.62 2.42 6.62 0 9.04 0 12s2.42 5.38 5.4 5.38c1.44 0 2.8-.56 3.77-1.53l2.83-2.5.01.01L13.52 12h-.01l2.69-2.39c.64-.64 1.49-.99 2.4-.99 1.87 0 3.39 1.51 3.39 3.38s-1.52 3.38-3.39 3.38c-.9 0-1.76-.35-2.44-1.03l-1.14-1.01-1.51 1.34 1.27 1.12c1.02 1.01 2.37 1.57 3.82 1.57 2.98 0 5.4-2.41 5.4-5.38s-2.42-5.37-5.4-5.37z"/>',
		'beach_access': '<path d="M13.127 14.56l1.43-1.43 6.44 6.443L19.57 21z"/><path d="M17.42 8.83l2.86-2.86c-3.95-3.95-10.35-3.96-14.3-.02 3.93-1.3 8.31-.25 11.44 2.88z"/><path d="M5.95 5.98c-3.94 3.95-3.93 10.35.02 14.3l2.86-2.86C5.7 14.29 4.65 9.91 5.95 5.98z"/><path d="M5.97 5.96l-.01.01c-.38 3.01 1.17 6.88 4.3 10.02l5.73-5.73c-3.13-3.13-7.01-4.68-10.02-4.3z"/>',
		'business_center': '<path d="M10 16v-1H3.01L3 19c0 1.11.89 2 2 2h14c1.11 0 2-.89 2-2v-4h-7v1h-4z"/><path d="M14 7h-4V5h4v2zm6 0h-4.01V5l-2-2h-4l-2 2v2H4c-1.1 0-2 .9-2 2v3c0 1.11.89 2 2 2h6v-2h4v2h6c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2z"/>',
		'casino': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM7.5 18c-.83 0-1.5-.67-1.5-1.5S6.67 15 7.5 15s1.5.67 1.5 1.5S8.33 18 7.5 18zm0-9C6.67 9 6 8.33 6 7.5S6.67 6 7.5 6 9 6.67 9 7.5 8.33 9 7.5 9zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4.5 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm0-9c-.83 0-1.5-.67-1.5-1.5S15.67 6 16.5 6s1.5.67 1.5 1.5S17.33 9 16.5 9z"/>',
		'child_care': '<circle cx="14.5" cy="10.5" r="1.25"/> <circle cx="9.5" cy="10.5" r="1.25"/> <path d="M22.94 12.66c.04-.21.06-.43.06-.66s-.02-.45-.06-.66c-.25-1.51-1.36-2.74-2.81-3.17-.53-1.12-1.28-2.1-2.19-2.91C16.36 3.85 14.28 3 12 3s-4.36.85-5.94 2.26c-.92.81-1.67 1.8-2.19 2.91-1.45.43-2.56 1.65-2.81 3.17-.04.21-.06.43-.06.66s.02.45.06.66c.25 1.51 1.36 2.74 2.81 3.17.52 1.11 1.27 2.09 2.17 2.89C7.62 20.14 9.71 21 12 21s4.38-.86 5.97-2.28c.9-.8 1.65-1.79 2.17-2.89 1.44-.43 2.55-1.65 2.8-3.17zM19 14c-.1 0-.19-.02-.29-.03-.2.67-.49 1.29-.86 1.86C16.6 17.74 14.45 19 12 19s-4.6-1.26-5.85-3.17c-.37-.57-.66-1.19-.86-1.86-.1.01-.19.03-.29.03-1.1 0-2-.9-2-2s.9-2 2-2c.1 0 .19.02.29.03.2-.67.49-1.29.86-1.86C7.4 6.26 9.55 5 12 5s4.6 1.26 5.85 3.17c.37.57.66 1.19.86 1.86.1-.01.19-.03.29-.03 1.1 0 2 .9 2 2s-.9 2-2 2zM7.5 14c.76 1.77 2.49 3 4.5 3s3.74-1.23 4.5-3h-9z"/>',
		'child_friedly': '<path d="M13 2v8h8c0-4.42-3.58-8-8-8z"/><path d="M17 20c-.83 0-1.5-.67-1.5-1.5S16.17 17 17 17s1.5.67 1.5 1.5S17.83 20 17 20zm-9 0c-.83 0-1.5-.67-1.5-1.5S7.17 17 8 17s1.5.67 1.5 1.5S8.83 20 8 20zm11.32-4.11A7.948 7.948 0 0 0 21 11H6.44l-.95-2H2v2h2.22s1.89 4.07 2.12 4.42c-1.1.59-1.84 1.75-1.84 3.08C4.5 20.43 6.07 22 8 22c1.76 0 3.22-1.3 3.46-3h2.08c.24 1.7 1.7 3 3.46 3 1.93 0 3.5-1.57 3.5-3.5 0-1.04-.46-1.97-1.18-2.61z"/>',
		'fitness_center': '<path d="M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"/>',
		'free_breakfast': '<path d="M20 8h-2V5h2v3zm0-5H4v10c0 2.21 1.79 4 4 4h6c2.21 0 4-1.79 4-4v-3h2a2 2 0 0 0 2-2V5c0-1.11-.89-2-2-2z"/><path d="M4 19h16v2H4z"/>',
		'golf_course': '<circle cx="19.5" cy="19.5" r="1.5"/><path d="M17 5.92L9 2v18H7v-1.73c-1.79.35-3 .99-3 1.73 0 1.1 2.69 2 6 2s6-.9 6-2c0-.99-2.16-1.81-5-1.97V8.98l6-3.06z"/>',
		'hot_tub': '<circle cx="7" cy="6" r="2"/><path d="M11.15 12c-.31-.22-.59-.46-.82-.72l-1.4-1.55c-.19-.21-.43-.38-.69-.5-.29-.14-.62-.23-.96-.23h-.03C6.01 9 5 10.01 5 11.25V12H2v8c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-8H11.15zM7 20H5v-6h2v6zm4 0H9v-6h2v6zm4 0h-2v-6h2v6zm4 0h-2v-6h2v6zm-.35-14.14l-.07-.07c-.57-.62-.82-1.41-.67-2.2L18 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71zm-4 0l-.07-.07c-.57-.62-.82-1.41-.67-2.2L14 3h-1.89l-.06.43c-.2 1.36.27 2.71 1.3 3.72l.07.06c.57.62.82 1.41.67 2.2l-.11.59h1.91l.06-.43c.21-1.36-.27-2.71-1.3-3.71z"/>',
		'kitchen': '<path d="M18 9H6V4h12v5zm0 11H6v-9.02h12V20zm0-17.99L6 2a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.11-.9-1.99-2-1.99z"/><path d="M8 5h2v3H8z"/><path d="M8 12h2v5H8z"/>',
		'pool': '<path d="M22 21c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.46.27-1.08.64-2.19.64-1.11 0-1.73-.37-2.18-.64-.37-.23-.6-.36-1.15-.36s-.78.13-1.15.36c-.46.27-1.08.64-2.19.64v-2c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.23.59.36 1.15.36v2zm0-4.5c-1.11 0-1.73-.37-2.18-.64-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36-.56 0-.78.13-1.15.36-.45.27-1.07.64-2.18.64s-1.73-.37-2.18-.64c-.37-.22-.6-.36-1.15-.36s-.78.13-1.15.36c-.47.27-1.09.64-2.2.64v-2c.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36.56 0 .78-.13 1.15-.36.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36s.78-.13 1.15-.36c.45-.27 1.07-.64 2.18-.64s1.73.37 2.18.64c.37.22.6.36 1.15.36v2zM8.67 12c.56 0 .78-.13 1.15-.36.46-.27 1.08-.64 2.19-.64 1.11 0 1.73.37 2.18.64.37.22.6.36 1.15.36s.78-.13 1.15-.36c.12-.07.26-.15.41-.23L10.48 5C8.93 3.45 7.5 2.99 5 3v2.5c1.82-.01 2.89.39 4 1.5l1 1-3.25 3.25c.31.12.56.27.77.39.37.23.59.36 1.15.36z"/> <circle cx="16.5" cy="5.5" r="2.5"/>',
		'room_service': '<path d="M2 17h20v2H2z"/><path d="M13.84 7.79A2.006 2.006 0 0 0 12 5a2.006 2.006 0 0 0-1.84 2.79C6.25 8.6 3.27 11.93 3 16h18c-.27-4.07-3.25-7.4-7.16-8.21z"/>',
		'rv_hookup': '<path d="M18 14h-4v-3h4v3zm-7 6c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm9-3v-6c0-1.1-.9-2-2-2H7V7l-3 3 3 3v-2h4v3H4v3c0 1.1.9 2 2 2h2c0 1.66 1.34 3 3 3s3-1.34 3-3h8v-2h-2z"/><path d="M17 2v2H9v2h8v2l3-3z"/>',
		'smoke_free': '<path d="M2 6l6.99 7H2v3h9.99l7 7 1.26-1.25-17-17z"/><path d="M20.5 13H22v3h-1.5z"/><path d="M18 13h1.5v3H18z"/><path d="M18.85 4.88c.62-.61 1-1.45 1-2.38h-1.5c0 1.02-.83 1.85-1.85 1.85v1.5c2.24 0 4 1.83 4 4.07V12H22V9.92c0-2.23-1.28-4.15-3.15-5.04z"/><path d="M14.5 8.7h1.53c1.05 0 1.97.74 1.97 2.05V12h1.5v-1.59c0-1.8-1.6-3.16-3.47-3.16H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75V2a3.35 3.35 0 0 0 0 6.7z"/><path d="M17 15.93V13h-2.93z"/>',
		'smoke_rooms': '<path d="M2 16h15v3H2z"/><path d="M20.5 16H22v3h-1.5z"/><path d="M18 16h1.5v3H18z"/><path d="M18.85 7.73c.62-.61 1-1.45 1-2.38C19.85 3.5 18.35 2 16.5 2v1.5c1.02 0 1.85.83 1.85 1.85S17.52 7.2 16.5 7.2v1.5c2.24 0 4 1.83 4 4.07V15H22v-2.24c0-2.22-1.28-4.14-3.15-5.03z"/><path d="M16.03 10.2H14.5c-1.02 0-1.85-.98-1.85-2s.83-1.75 1.85-1.75v-1.5a3.35 3.35 0 0 0 0 6.7h1.53c1.05 0 1.97.74 1.97 2.05V15h1.5v-1.64c0-1.81-1.6-3.16-3.47-3.16z"/>',
		'spa': '<path d="M8.55 12c-1.07-.71-2.25-1.27-3.53-1.61 1.28.34 2.46.9 3.53 1.61zm10.43-1.61c-1.29.34-2.49.91-3.57 1.64 1.08-.73 2.28-1.3 3.57-1.64z"/> <path d="M15.49 9.63c-.18-2.79-1.31-5.51-3.43-7.63-2.14 2.14-3.32 4.86-3.55 7.63 1.28.68 2.46 1.56 3.49 2.63 1.03-1.06 2.21-1.94 3.49-2.63zm-6.5 2.65c-.14-.1-.3-.19-.45-.29.15.11.31.19.45.29zm6.42-.25c-.13.09-.27.16-.4.26.13-.1.27-.17.4-.26zM12 15.45C9.85 12.17 6.18 10 2 10c0 5.32 3.36 9.82 8.03 11.49.63.23 1.29.4 1.97.51.68-.12 1.33-.29 1.97-.51C18.64 19.82 22 15.32 22 10c-4.18 0-7.85 2.17-10 5.45z"/>',
		//
		// social
		//
		'cake': '<path d="M12 6c1.11 0 2-.9 2-2 0-.38-.1-.73-.29-1.03L12 0l-1.71 2.97c-.19.3-.29.65-.29 1.03 0 1.1.9 2 2 2z"/><path d="M16.6 15.99l-1.07-1.07-1.08 1.07c-1.3 1.3-3.58 1.31-4.89 0l-1.07-1.07-1.09 1.07C6.75 16.64 5.88 17 4.96 17c-.73 0-1.4-.23-1.96-.61V21c0 .55.45 1 1 1h16c.55 0 1-.45 1-1v-4.61c-.56.38-1.23.61-1.96.61-.92 0-1.79-.36-2.44-1.01z"/><path d="M18 9h-5V7h-2v2H6c-1.66 0-3 1.34-3 3v1.54c0 1.08.88 1.96 1.96 1.96.52 0 1.02-.2 1.38-.57l2.14-2.13 2.13 2.13c.74.74 2.03.74 2.77 0l2.14-2.13 2.13 2.13c.37.37.86.57 1.38.57 1.08 0 1.96-.88 1.96-1.96V12C21 10.34 19.66 9 18 9z"/>',
		'domain': '<path d="M20 19h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zM10 7H8V5h2v2zm0 4H8V9h2v2zm0 4H8v-2h2v2zm0 4H8v-2h2v2zM6 7H4V5h2v2zm0 4H4V9h2v2zm0 4H4v-2h2v2zm0 4H4v-2h2v2zm6-12V3H2v18h20V7H12z"/><path d="M18 11h-2v2h2v-2z"/><path d="M18 15h-2v2h2v-2z"/>',
		'group': '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/><path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/><path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
		'group_add': '<path d="M8 10H5V7H3v3H0v2h3v3h2v-3h3v-2z"/><path d="M18 11c1.66 0 2.99-1.34 2.99-3S19.66 5 18 5c-.32 0-.63.05-.91.14.57.81.9 1.79.9 2.86 0 1.07-.34 2.04-.9 2.86.28.09.59.14.91.14z"/><path d="M13 11c1.66 0 2.99-1.34 2.99-3S14.66 5 13 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M19.62 13.16c.83.73 1.38 1.66 1.38 2.84v2h3v-2c0-1.54-2.37-2.49-4.38-2.84z"/><path d="M13 13c-2 0-6 1-6 3v2h12v-2c0-2-4-3-6-3z"/>',
		'location_city': '<path d="M15 11V5l-3-3-3 3v2H3v14h18V11h-6zm-8 8H5v-2h2v2zm0-4H5v-2h2v2zm0-4H5V9h2v2zm6 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V9h2v2zm0-4h-2V5h2v2zm6 12h-2v-2h2v2zm0-4h-2v-2h2v2z"/>',
		'mood': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
		'mood_bad': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2z"/><path d="M15.5 11c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5z"/><path d="M8.5 11c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11z"/><path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>',
		'notifications': '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M18 16v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
		'notifications_none': '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M16 17H7v-6.5C7 8.01 9.01 6 11.5 6S16 8.01 16 10.5V17zm2-1v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
		'notifications_off': '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M18 10.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-.51.12-.99.32-1.45.56L18 14.18V10.5z"/><path d="M17.73 19l2 2L21 19.73 4.27 3 3 4.27l2.92 2.92C5.34 8.16 5 9.29 5 10.5V16l-2 2v1h14.73z"/>',
		'notifications_active': '<path d="M6.58 3.58L5.15 2.15C2.76 3.97 1.18 6.8 1.03 10h2c.15-2.65 1.51-4.97 3.55-6.42z"/><path d="M19.97 10h2c-.15-3.2-1.73-6.03-4.13-7.85l-1.43 1.43c2.05 1.45 3.41 3.77 3.56 6.42z"/><path d="M18 10.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2v-5.5z"/><path d="M11.5 22c.14 0 .27-.01.4-.04.65-.13 1.19-.58 1.44-1.18.1-.24.16-.5.16-.78h-4c0 1.1.9 2 2 2z"/>',
		'notifications_paused': '<path d="M11.5 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2z"/><path d="M14 9.8l-2.8 3.4H14V15H9v-1.8l2.8-3.4H9V8h5v1.8zm4 6.2v-5.5c0-3.07-2.13-5.64-5-6.32V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5v.68c-2.87.68-5 3.25-5 6.32V16l-2 2v1h17v-1l-2-2z"/>',
		'pages': '<path d="M3 5v6h5L7 7l4 1V3H5c-1.1 0-2 .9-2 2z"/><path d="M8 13H3v6c0 1.1.9 2 2 2h6v-5l-4 1 1-4z"/><path d="M17 17l-4-1v5h6c1.1 0 2-.9 2-2v-6h-5l1 4z"/><path d="M19 3h-6v5l4-1-1 4h5V5c0-1.1-.9-2-2-2z"/>',
		'party_mode': '<path d="M20 4h-3.17L15 2H9L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-8 3c1.63 0 3.06.79 3.98 2H12c-1.66 0-3 1.34-3 3 0 .35.07.69.18 1H7.1c-.06-.32-.1-.66-.1-1 0-2.76 2.24-5 5-5zm0 10c-1.63 0-3.06-.79-3.98-2H12c1.66 0 3-1.34 3-3 0-.35-.07-.69-.18-1h2.08c.07.32.1.66.1 1 0 2.76-2.24 5-5 5z"/>',
		'people': '<path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3z"/><path d="M8 11c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3z"/><path d="M8 13c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5z"/><path d="M16 13c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>',
		'people_outline': '<path d="M21.5 17.5H14v-1.25c0-.46-.2-.86-.52-1.22.88-.3 1.96-.53 3.02-.53 2.44 0 5 1.21 5 1.75v1.25zm-9 0h-10v-1.25c0-.54 2.56-1.75 5-1.75s5 1.21 5 1.75v1.25zm4-4.5c-1.2 0-3.07.34-4.5 1-1.43-.67-3.3-1-4.5-1C5.33 13 1 14.08 1 16.25V19h22v-2.75c0-2.17-4.33-3.25-6.5-3.25z"/><path d="M7.5 6.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 5.5c1.93 0 3.5-1.57 3.5-3.5S9.43 5 7.5 5 4 6.57 4 8.5 5.57 12 7.5 12z"/><path d="M16.5 6.5c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 5.5c1.93 0 3.5-1.57 3.5-3.5S18.43 5 16.5 5 13 6.57 13 8.5s1.57 3.5 3.5 3.5z"/>',
		'person': '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
		'person_add': '<path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z"/><path d="M6 10V7H4v3H1v2h3v3h2v-3h3v-2H6z"/><path d="M15 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
		'person_outline': '<path d="M12 4C9.79 4 8 5.79 8 8s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 1.9c1.16 0 2.1.94 2.1 2.1 0 1.16-.94 2.1-2.1 2.1-1.16 0-2.1-.94-2.1-2.1 0-1.16.94-2.1 2.1-2.1"/><path d="M12 13c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4zm0 1.9c2.97 0 6.1 1.46 6.1 2.1v1.1H5.9V17c0-.64 3.13-2.1 6.1-2.1"/>',
		'plus_one': '<path d="M10 8H8v4H4v2h4v4h2v-4h4v-2h-4z"/><path d="M14.5 6.08V7.9l2.5-.5V18h2V5z"/>',
		'poll': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>',
		'public': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>',
		'school': '<path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z"/>',
		'sentiment_dissatisfied': '<circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-6c-2.33 0-4.32 1.45-5.12 3.5h1.67c.69-1.19 1.97-2 3.45-2s2.75.81 3.45 2h1.67c-.8-2.05-2.79-3.5-5.12-3.5z"/>',
		'sentiment_neutral': '<path d="M9 14h6v1.5H9z"/><circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
		'sentiment_satisfied': '<circle cx="15.5" cy="9.5" r="1.5"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-4c-1.48 0-2.75-.81-3.45-2H6.88c.8 2.05 2.79 3.5 5.12 3.5s4.32-1.45 5.12-3.5h-1.67c-.7 1.19-1.97 2-3.45 2z"/>',
		'sentiment_very_dissatisfied': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.51 22 22 17.53 22 12S17.52 2 11.99 2z"/><path d="M16.18 7.76l-1.06 1.06-1.06-1.06L13 8.82l1.06 1.06L13 10.94 14.06 12l1.06-1.06L16.18 12l1.06-1.06-1.06-1.06 1.06-1.06z"/><path d="M7.82 12l1.06-1.06L9.94 12 11 10.94 9.94 9.88 11 8.82 9.94 7.76 8.88 8.82 7.82 7.76 6.76 8.82l1.06 1.06-1.06 1.06z"/><path d="M12 14c-2.33 0-4.31 1.46-5.11 3.5h10.22c-.8-2.04-2.78-3.5-5.11-3.5z"/>',
		'sentiment_very_satisfied': '<path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm-.01-18C6.47 2 2 6.47 2 12s4.47 10 9.99 10C17.51 22 22 17.53 22 12S17.52 2 11.99 2z"/><path d="M13 9.94L14.06 11l1.06-1.06L16.18 11l1.06-1.06-2.12-2.12z"/><path d="M8.88 9.94L9.94 11 11 9.94 8.88 7.82 6.76 9.94 7.82 11z"/><path d="M12 17.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>',
		'share': '<path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>',
		'whatshot': '<path d="M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z"/>',
		//
		// toggle
		//
		'check_box': '<path d="M19 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.11 0 2-.9 2-2V5c0-1.1-.89-2-2-2zm-9 14l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>',
		'check_box_outline_blank': '<path d="M19 5v14H5V5h14m0-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>',
		'indeterminate_check_box': '<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2z"/>',
		'radio_button_unchecked': '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/>',
		'radio_button_checked': '<path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z"/><path d="M12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm0-18C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>',
		'star': '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
		'star_half': '<path d="M22 9.74l-7.19-.62L12 2.5 9.19 9.13 2 9.74l5.46 4.73-1.64 7.03L12 17.77l6.18 3.73-1.63-7.03L22 9.74zM12 15.9V6.6l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.9z"/>',
		'star_border': '<path d="M22 9.24l-7.19-.62L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.63-7.03L22 9.24zM12 15.4l-3.76 2.27 1-4.28-3.32-2.88 4.38-.38L12 6.1l1.71 4.04 4.38.38-3.32 2.88 1 4.28L12 15.4z"/>'
	})

	/*
	 * custom icons
	 */
	.addShapes({
		// Add single icon
		'standby': '<path d="M13 3.5h-2v10h2v-10z"/><path d="M16.56 5.94l-1.45 1.45C16.84 8.44 18 10.33 18 12.5c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 5.94C5.36 7.38 4 9.78 4 12.5c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56z"/>',
		'custom-delete': wbIconServiceProvider.getShape('delete'),
		'vertical': wbIconServiceProvider.getShape('view_sequential'),

		'corner_bottom_left': '<path d="M 5,5 H 3 V 3 H 5 Z M 5,7 H 3 v 2 h 2 z m 16,4 h -2 v 2 h 2 z m 0,-4 h -2 v 2 h 2 z m 0,8 h -2 v 2 h 2 z m 0,4 h -2 v 2 h 2 z m -4,0 h -2 v 2 h 2 z M 9,3 H 7 v 2 h 2 z m 4,0 h -2 v 2 h 2 z M 9,3 H 7 v 2 h 2 z m 8,0 h -2 v 2 h 2 z m 4,0 h -2 v 2 h 2 z M 3,16 c 0,2.76 2.24,5 5,5 h 5 V 19 H 8 C 6.35,19 5,17.65 5,16 V 11 H 3 Z" />',
		'corner_bottom_right': '<path d="m 5,19 v 2 H 3 v -2 z m 2,0 v 2 h 2 v -2 z m 4,-16 0,2 2,0 0,-2 z M 7,3 V 5 L 9,5 9,3 Z m 8,0 0,2 2,0 V 3 Z m 4,0 v 2 h 2 V 3 Z m 0,4 v 2 l 2,0 V 7 Z M 3,15 v 2 h 2 v -2 z m 0,-4 v 2 h 2 v -2 z m 0,4 v 2 H 5 V 15 Z M 3,7 V 9 H 5 V 7 Z M 3,3 V 5 H 5 V 3 Z m 13,18 c 2.76,0 5,-2.24 5,-5 v -5 l -2,0 0,5 c 0,1.65 -1.35,3 -3,3 l -5,0 v 2 z" />',
		'corner_top_left': '<path d="M 19,5 V 3 h 2 V 5 Z M 17,5 V 3 h -2 v 2 z m -4,16 v -2 h -2 v 2 z m 4,0 v -2 h -2 v 2 z M 9,21 V 19 H 7 v 2 z M 5,21 V 19 H 3 l 0,2 z M 5,17 5,15 H 3 v 2 z M 21,9 V 7 h -2 v 2 z m 0,4 v -2 h -2 v 2 z M 21,9 V 7 h -2 v 2 z m 0,8 v -2 h -2 v 2 z m 0,4 v -2 h -2 v 2 z M 8,3 C 5.24,3 3,5.24 3,8 v 5 H 5 V 8 C 5,6.35 6.35,5 8,5 h 5 V 3 Z" />',
		'corner_top_right': '<path d="m 19,19 h 2 v 2 h -2 z m 0,-2 h 2 V 15 H 19 Z M 3,13 H 5 V 11 H 3 Z m 0,4 H 5 V 15 H 3 Z M 3,9 H 5 V 7 H 3 Z M 3,5 H 5 V 3 H 3 Z M 7,5 H 9 V 3 H 7 Z m 8,16 h 2 v -2 h -2 z m -4,0 h 2 v -2 h -2 z m 4,0 h 2 V 19 H 15 Z M 7,21 H 9 V 19 H 7 Z M 3,21 H 5 V 19 H 3 Z M 21,8 C 21,5.24 18.76,3 16,3 h -5 v 2 h 5 c 1.65,0 3,1.35 3,3 v 5 h 2 z" />',
		'full_rounded': wbIconServiceProvider.getShape('crop_free'),

		'align_justify_vertical': '<path d="M 21,21 V 3 h -2 v 18 z m -4,0 V 3 h -2 l 0,18 z m -4,0 0,-18 h -2 l 0,18 z M 9,21 9,3 H 7 L 7,21 Z M 3,21 H 5 L 5,3 H 3 Z" />',
		'align_center_vertical': '<path d="m 15,17 h 2 V 7 h -2 z m 6,4 V 3 h -2 v 18 z m -8,0 0,-18 h -2 l 0,18 z M 7,17 H 9 L 9,7 H 7 Z M 3,21 H 5 L 5,3 H 3 Z" />',
		'align_end_vertical': '<path d="m 15,9 0,12 h 2 V 9 Z M 7,9 7,21 H 9 L 9,9 Z m 6,12 0,-18 h -2 l 0,18 z m 8,0 V 3 H 19 V 21 Z M 3,21 H 5 L 5,3 H 3 Z" />',
		'align_start_vertical': '<path d="M 21,21 V 3 H 19 V 21 Z M 17,15 V 3 h -2 l 0,12 z m -4,6 0,-18 h -2 l 0,18 z M 9,15 9,3 H 7 V 15 Z M 3,21 H 5 L 5,3 H 3 Z" />',

		'sort_space_between_horiz': '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 1.5373337,1.999831 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 H 8.465053 c 0.4320489,0 0.7855436,-0.350389 0.7855436,-0.778642 V 7.3281513 c 0,-0.4282528 -0.3534947,-0.7786414 -0.7855436,-0.7786414 z m 9.4265256,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />',
		'sort_space_around_horiz': '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007773 3,4.5572829 V 19.442717 C 3,20.299223 3.7069894,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572829 C 21,3.7007773 20.293011,3 19.428912,3 Z m 0,1.549679 H 19.428912 V 19.451842 H 4.5710877 Z m 2.6757586,1.9602906 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.343697 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 h 2.3566315 c 0.4320492,0 0.7855442,-0.350389 0.7855442,-0.778642 V 7.288611 c 0,-0.4282528 -0.353495,-0.7786414 -0.7855442,-0.7786414 z m 7.0698947,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.343697 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356631 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.288611 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />',
		'sort_center_horiz': '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 3.7344017,1.999831 c -0.4320492,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534946,0.778642 0.7855438,0.778642 h 2.3566316 c 0.432049,0 0.785543,-0.350389 0.785543,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785543,-0.7786414 z m 5.4988066,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356631 c 0.43205,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785544,-0.7786414 z" />',
		'sort_start_horiz': '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 1.5373337,1.999831 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 H 8.465053 c 0.4320489,0 0.7855436,-0.350389 0.7855436,-0.778642 V 7.3281513 c 0,-0.4282528 -0.3534947,-0.7786414 -0.7855436,-0.7786414 z m 5.4988066,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785543,-0.350389 0.785543,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785543,-0.7786414 z" />',
		'sort_end_horiz': '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 5.4650523,1.999831 c -0.4320487,0 -0.7855434,0.3503886 -0.7855434,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855434,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z m 5.498807,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />',

		'sort_space_between_vert': '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-1.537333 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-9.426526 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 6.108421 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />',
		'sort_space_around_vert': '<path d="M 3,19.428912 C 3,20.293011 3.7007773,21 4.5572829,21 H 19.442717 C 20.299223,21 21,20.293011 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572829 C 3.7007773,3 3,3.706989 3,4.571088 Z m 1.549679,0 0,-14.857824 h 14.902163 v 14.857824 z m 1.9602906,-2.675758 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 h 9.343697 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.343697,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-7.069895 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.343697,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 7.326628 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.288611 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />',
		'sort_center_vert': '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-3.734401 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785543 -0.778642,-0.785543 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785543 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 7.839073 c 0,-0.43205 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785544 z" />',
		'sort_start_vert': '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-5.465052 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 l 9.3436967,0 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 6.108421 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />',
		'sort_end_vert': '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-1.537333 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 10.03614 c 0,-0.432049 -0.350389,-0.785543 -0.778642,-0.785543 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785543 z" />',
		'download': '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Capa_1" x="0px" y="0px" width="18" height="18" viewBox="0 0 24 24" xml:space="preserve" sodipodi:docname="download11111.svg" inkscape:version="0.92.3(2405546, 2018-03-11)"><metadata id="metadata44"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs42" /><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1366" inkscape:window-height="706" id="namedview40" showgrid="false" inkscape:zoom="6.1592508" inkscape:cx="-15.061405" inkscape:cy="1.1743357" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:current-layer="Capa_1" /><g id="g135" transform="matrix(0.06722689,0,0,0.05536332,-2.5714288,-4.45e-6)"><g id="g78"><g id="file-download"><path id="path75" d="m 395.25,153 h -102 V 0 h -153 v 153 h -102 l 178.5,178.5 z m -357,229.5 v 51 h 357 v -51 z" inkscape:connector-curvature="0" /></g></g></g></svg>',
		'upload': '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Capa_1" x="0px" y="0px" width="18" height="18" viewBox="0 0 24 24" xml:space="preserve" sodipodi:docname="upload-button.svg" inkscape:version="0.92.3 (2405546, 2018-03-11)"><metadata id="metadata44"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title /></cc:Work></rdf:RDF></metadata><defs id="defs42" /><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10"  guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1366" inkscape:window-height="706" id="namedview40" showgrid="false" inkscape:zoom="2.177624" inkscape:cx="-53.237791" inkscape:cy="29.341367" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:current-layer="Capa_1" /><g id="g73" transform="matrix(0.06722689,0,0,0.05536332,-2.5714288,-4.45e-6)"><g id="g15"><g   id="file-upload-8"><polygon id="polygon10" points="140.25,178.5 140.25,331.5 293.25,331.5 293.25,178.5 395.25,178.5 216.75,0 38.25,178.5 " /><rect id="rect12" height="51" width="357" y="382.5" x="38.25" /></g></g></g></svg>',

		'wb-opacity': '<path d="M3.55,18.54L4.96,19.95L6.76,18.16L5.34,16.74M11,22.45C11.32,22.45 13,22.45 13,22.45V19.5H11M12,5.5A6,6 0 0,0 6,11.5A6,6 0 0,0 12,17.5A6,6 0 0,0 18,11.5C18,8.18 15.31,5.5 12,5.5M20,12.5H23V10.5H20M17.24,18.16L19.04,19.95L20.45,18.54L18.66,16.74M20.45,4.46L19.04,3.05L17.24,4.84L18.66,6.26M13,0.55H11V3.5H13M4,10.5H1V12.5H4M6.76,4.84L4.96,3.05L3.55,4.46L5.34,6.26L6.76,4.84Z" />',
		'wb-vertical-boxes': '<path d="M4,21V3H8V21H4M10,21V3H14V21H10M16,21V3H20V21H16Z" />',
		'wb-horizontal-boxes': '<path d="M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z" />',
		'wb-horizontal-arrows': '<path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />',
		'wb-vertical-arrows': '<path d="M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z" />',
		'wb-direction':'<path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />',

		'list_tree': '<path d="m 3.0063556,9.3749998 2.3368645,-1.125 -2.3432204,-1.25 z M 11,13 H 21 V 11 H 11 Z m 0,4 H 21 V 15 H 11 Z M 6.9999997,6.9999998 v 2 H 21 v -2 z" />',

		'wb-object-video': wbIconServiceProvider.getShape('video_library'),
		'wb-object-audio':  wbIconServiceProvider.getShape('audiotrack'),
		'wb-object-data': wbIconServiceProvider.getShape('storage'),

		'wb-widget-group': wbIconServiceProvider.getShape('pages'),
		'wb-widget-html': wbIconServiceProvider.getShape('settings_ethernet'),

		/*
		 * Wifi
		 */
		'signal_wifi_0_bar': '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/>',
		'signal_wifi_1_bar': '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M6.67 14.86L12 21.49v.01l.01-.01 5.33-6.63C17.06 14.65 15.03 13 12 13s-5.06 1.65-5.33 1.86z"/>',
		'signal_wifi_2_bar': '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M4.79 12.52l7.2 8.98H12l.01-.01 7.2-8.98C18.85 12.24 16.1 10 12 10s-6.85 2.24-7.21 2.52z"/>',
		'signal_wifi_3_bar': '<path fill-opacity=".3" d="M12.01 21.49L23.64 7c-.45-.34-4.93-4-11.64-4C5.28 3 .81 6.66.36 7l11.63 14.49.01.01.01-.01z"/><path d="M3.53 10.95l8.46 10.54.01.01.01-.01 8.46-10.54C20.04 10.62 16.81 8 12 8c-4.81 0-8.04 2.62-8.47 2.95z"/>',
		'signal_cellular_connected_no_internet_0_bar': '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M20 22h2v-2h-2v2zm0-12v8h2v-8h-2z"/>',
		'signal_cellular_connected_no_internet_1_bar': '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M20 10v8h2v-8h-2zm-8 12V12L2 22h10zm8 0h2v-2h-2v2z"/>',
		'signal_cellular_connected_no_internet_2_bar': '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M14 22V10L2 22h12zm6-12v8h2v-8h-2zm0 12h2v-2h-2v2z"/>',
		'signal_cellular_connected_no_internet_3_bar': '<path fill-opacity=".3" d="M22 8V2L2 22h16V8z"/><path d="M17 22V7L2 22h15zm3-12v8h2v-8h-2zm0 12h2v-2h-2v2z"/>',
		'signal_cellular_0_bar': '<path fill-opacity=".3" d="M2 22h20V2z"/>',
		'signal_cellular_1_bar': '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M12 12L2 22h10z"/>',
		'signal_cellular_2_bar': '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M14 10L2 22h12z"/>',
		'signal_cellular_3_bar': '<path fill-opacity=".3" d="M2 22h20V2z"/><path d="M17 7L2 22h15z"/>',
		'now_wallpaper': '<path d="M4 4h7V2H4c-1.1 0-2 .9-2 2v7h2V4z"/><path d="M10 13l-4 5h12l-3-4-2.03 2.71L10 13z"/><path d="M17 8.5c0-.83-.67-1.5-1.5-1.5S14 7.67 14 8.5s.67 1.5 1.5 1.5S17 9.33 17 8.5z"/><path d="M20 2h-7v2h7v7h2V4c0-1.1-.9-2-2-2z"/><path d="M20 20h-7v2h7c1.1 0 2-.9 2-2v-7h-2v7z"/><path d="M4 13H2v7c0 1.1.9 2 2 2h7v-2H4v-7z"/>',
		'now_widgets': '<path d="M13 13v8h8v-8h-8z"/><path d="M3 21h8v-8H3v8z"/><path d="M3 3v8h8V3H3z"/><path d="M16.66 1.69L11 7.34 16.66 13l5.66-5.66-5.66-5.65z"/>',
		'battery_20': '<path d="M7 17v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17H7z"/><path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h10V5.33z"/>',
		'battery_30': '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V15h10V5.33z"/><path d="M7 15v5.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V15H7z"/>',
		'battery_50': '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V13h10V5.33z"/><path d="M7 13v7.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13H7z"/>',
		'battery_60': '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h10V5.33z"/><path d="M7 11v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11H7z"/>',
		'battery_80': '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h10V5.33z"/><path d="M7 9v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9H7z"/>',
		'battery_90': '<path fill-opacity=".3" d="M17 5.33C17 4.6 16.4 4 15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h10V5.33z"/><path d="M7 8v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8H7z"/>',
		'battery_alert': '<path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4zM13 18h-2v-2h2v2zm0-4h-2V9h2v5z"/>',
		'battery_charging_20': '<path d="M11 20v-3H7v3.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V17h-4.4L11 20z"/><path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V17h4v-2.5H9L13 7v5.5h2L12.6 17H17V5.33C17 4.6 16.4 4 15.67 4z"/>',
		'battery_charging_30': '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v9.17h2L13 7v5.5h2l-1.07 2H17V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M11 20v-5.5H7v6.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V14.5h-3.07L11 20z"/>',
		'battery_charging_50': '<path d="M14.47 13.5L11 20v-5.5H9l.53-1H7v7.17C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V13.5h-2.53z"/><path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v8.17h2.53L13 7v5.5h2l-.53 1H17V5.33C17 4.6 16.4 4 15.67 4z"/>',
		'battery_charging_60': '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V11h3.87L13 7v4h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9l1.87-3.5H7v9.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V11h-4v1.5z"/>',
		'battery_charging_80': '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V9h4.93L13 7v2h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9L11.93 9H7v11.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V9h-4v3.5z"/>',
		'battery_charging_90': '<path fill-opacity=".3" d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33V8h5.47L13 7v1h4V5.33C17 4.6 16.4 4 15.67 4z"/><path d="M13 12.5h2L11 20v-5.5H9L12.47 8H7v12.67C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V8h-4v4.5z"/>',
		'account_child': '<circle cx="12" cy="13.49" r="1.5"/><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 2.5c1.24 0 2.25 1.01 2.25 2.25S13.24 9 12 9 9.75 7.99 9.75 6.75 10.76 4.5 12 4.5zm5 10.56v2.5c-.45.41-.96.77-1.5 1.05v-.68c0-.34-.17-.65-.46-.92-.65-.62-1.89-1.02-3.04-1.02-.96 0-1.96.28-2.65.73l-.17.12-.21.17c.78.47 1.63.72 2.54.82l1.33.15c.37.04.66.36.66.75 0 .29-.16.53-.4.66-.28.15-.64.09-.95.09-.35 0-.69-.01-1.03-.05-.5-.06-.99-.17-1.46-.33-.49-.16-.97-.38-1.42-.64-.22-.13-.44-.27-.65-.43l-.31-.24c-.04-.02-.28-.18-.28-.23v-4.28c0-1.58 2.63-2.78 5-2.78s5 1.2 5 2.78v1.78z"/>',
	});


});

/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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
 * @ngdoc Controllers
 * @name MbSettingsCtrl
 * @description Manages settings page
 * 
 * Manages settings pages.
 * 
 */
.controller('AmWbSettingPageCtrl', function ($scope, $element) {


    this.setWidget = function (widget) {
        var oldWidget = this.widget;
        this.widget = widget;
        if (angular.isFunction(this.init)) {
            this.init(this.widget, oldWidget);
        }
    };

    this.getWidget = function () {
        return this.widget;
    };

    this.setElement = function (element) {
        this.element = element;
    };

    this.getElement = function () {
        return this.element;
    };

    this.setScope = function (scope) {
        this.scope = scope;
    };

    this.getScope = function () {
        return this.scope;
    };

    this.isRoot = function () {
        var widget = this.getWidget();
        if (!widget) {
            return false;
        }
        return widget.isRoot();
    };

    this.setStyleBackground = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.background.' + key, value);
    };

    this.getStyleBackground = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.background.' + key);
    };

    this.setStyleSize = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.size.' + key, value);
    };

    this.getStyleSize = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.size.' + key);
    };

    this.setStyleBorder = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.border.' + key, value);
    };

    this.getStyleBorder = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.border.' + key);
    };

    this.setStyleLayout = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.layout.' + key, value);
    };

    this.getStyleLayout = function (key, defaultValue) {
        if (!this.widget) {
            return;
        }
        var rkey = 'style.layout.' + key;
        if(!this.widget.hasModelProperty(rkey)){
        	return defaultValue;
        }
        return this.widget.getModelProperty(rkey);
    };

    this.setStyle = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.' + key, value);
    };

    this.getStyle = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.' + key);
    };

    this.setProperty = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty(key, value);
    };

    this.getProperty = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty(key);
    };


    this.setElement($element);
    this.setScope($scope);
});

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
var WbAbstractWidget = function () {

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
			dblclick: function ($event) {
				ctrl.fire('dblclick', $event);
				ctrl.evalWidgetEvent('dblclick', $event);
			},
			mouseout: function ($event) {
				ctrl.fire('mouseout', $event);
				ctrl.evalWidgetEvent('mouseout', $event);
			},
			mouseover: function ($event) {
				ctrl.fire('mouseover', $event);
				ctrl.evalWidgetEvent('mouseover', $event);
			},
			mousedown: function ($event) {
				ctrl.fire('mousedown', $event);
				ctrl.evalWidgetEvent('mousedown', $event);
			},
			mouseup: function ($event) {
				ctrl.fire('mouseup', $event);
				ctrl.evalWidgetEvent('mouseup', $event);
			},
			mouseenter: function ($event) {
				ctrl.fire('mouseenter', $event);
				ctrl.evalWidgetEvent('mouseenter', $event);
			},
			mouseleave: function ($event) {
				ctrl.fire('mouseleave', $event);
				ctrl.evalWidgetEvent('mouseleave', $event);
			}
	};

	/*
	 * Add resize observer to the element
	 */
	this.resizeObserver = new ResizeObserver(debounce(function ($event) {
		if(angular.isArray($event)){
			$event = $event[0];
		}
		ctrl.fire('resize', $event);
		ctrl.evalWidgetEvent('resize', $event);
	}, 300));

	var options = {
			root: null,
			rootMargin: "0px",
	};
	this.intersectionObserver = new IntersectionObserver(function ($event) {
		if(angular.isArray($event)){
			$event = $event[0];
		}
		ctrl.setIntersecting($event.isIntersecting, $event);
	}, options);
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

/**
 * Refreshes the view based on the current data
 * 
 * It used runtime and model data to update the view.
 */
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
 * Reload all data to run the widget from the start
 * 
 * This function clean the runtime data and refresh the widget. On the other
 * hand the init event will be fired.
 * 
 * @memberof WbAbstractWidget
 */
WbAbstractWidget.prototype.reload = function(){
	// clean runtime model
	this.runtimeModel = {};

	// refresh the view
	this.refresh();

	// fire init
	var $event = {
			source: this,
			type: 'init'
	};
	this.evalWidgetEvent('init', $event);
};


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
	this.fire('modelChanged');
	this.reload();
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

	// check if value changed
	if(angular.equals($event.oldValue, $event.newValue)){
		return;
	}

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
 * If the change cause the view to update then this function will update and
 * render the view.
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

	// check if value changed
	if(angular.equals($event.oldValue, $event.newValue)){
		return;
	}

	// Set the address
	var model = this.getRuntimeModel();
	if(angular.isDefined(value)){
		objectPath.set(model, key, value);
	} else {
		objectPath.del(model, key);
	}


	// refresh the view
	this.refresh($event);
	this.fire('runtimeModelUpdated', $event);
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
	if(!event){
		event = {};
	}
	event.type = type;
	event.source = this;

	if (this.isEditable()) {
		// User function will not evaluate in edit mode
		return;
	}
	var eventFunction;
	if (!this.eventFunctions.hasOwnProperty(type) && this.getEvent().hasOwnProperty(type)) {
		var body = '\'use strict\'; var $event = arguments[0], $widget = arguments[1], $http = arguments[2], $media =  arguments[3], $window =  arguments[4], $local =  arguments[5], $timeout = arguments[6];' + this.getEvent()[type];
		this.eventFunctions[type] = new Function(body);
	}
	eventFunction = this.eventFunctions[type];
	if (eventFunction) {
		try{
			return eventFunction(event, this, this.$http, this.$mdMedia, this.$wbWindow, this.$wbLocal, this.$timeout);
		} catch(ex){
			console.log('Fail to run event code');
			console.log({
				type: type,
				event: event
			});
			console.log(ex);
		}
	}
};

/**
 * Remove the widgets
 */
WbAbstractWidget.prototype.destroy = function ($event) {
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
	this.fire('destroy', $event);
};

WbAbstractWidget.prototype.setElement = function ($element) {
	try{
		this.disconnect();
	} finally{
		this.$element = $element;
		this.connect();
	}
};

WbAbstractWidget.prototype.disconnect = function () {
	var $element = this.getElement();
	if (!$element) {
		return;
	}
	this.resizeObserver.unobserve($element[0]);
	this.intersectionObserver.unobserve($element[0]);
	angular.forEach(this.eventListeners, function (listener, key) {
		$element.off(key, listener);
	});
};

WbAbstractWidget.prototype.connect = function () {
	var $element = this.getElement();
	if (!$element) {
		return;
	}
	angular.forEach(this.eventListeners, function (listener, key) {
		$element.on(key, listener);
	});
	this.resizeObserver.observe($element[0]);
	this.intersectionObserver.observe($element[0]);
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
	if(this.callbacks[type].includes(callback)){
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
	// propagate to child
	angular.forEach(this.childWidgets, function (widget) {
		widget.setEditable(editable);
	});

	// TODO: maso, 2019: add event data
	if (editable) {
		this.fire('editable');
	} else {
		this.fire('noneditable');
	}
	var ctrl = this;
	this.$timeout(function(){
		ctrl.reload();
	}, 100);
};

WbAbstractWidget.prototype.isIntersecting = function(){
	return this.intersecting;
};

WbAbstractWidget.prototype.setIntersecting = function(intersecting, $event){
	this.intersecting = intersecting;
	this.fire('intersection', $event);
	this.evalWidgetEvent('intersection', $event);
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
	if(!element){
		return {
			width: 0,
			height: 0,
			top: 0,
			left: 0
		};
	}

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
			update: function(/* anim */) {
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

/**
 * Sets window of the widget
 * 
 * @memberof WbAbstractWidget
 * @params window {WbWindow} of the current widget
 */
WbAbstractWidget.prototype.setWindow = function (window) {
	this.window = window;
};

/**
 * Gets window of the widget
 * 
 * @memberof WbAbstractWidget
 * @return window of the current widget or from the root
 */
WbAbstractWidget.prototype.getWindow = function () {
	return this.window || this.getRoot().getWindow() || this.$wbWindow;
};

/*******************************************************************************
 * * * * *
 ******************************************************************************/
/**
 * @ngdoc Controllers
 * @name wbWidgetCtrl
 * @description Controller of a widget
 * 
 * 
 * @ngInject
 */
var WbWidgetCtrl = function ($scope, $element, $wbUtil, $http, $widget, $mdMedia, $timeout, $wbWindow, $wbLocal) {
	WbAbstractWidget.call(this);
	this.setElement($element);
	this.setScope($scope);
	this.$wbUtil = $wbUtil;
	this.$http = $http;
	this.$widget = $widget;
	this.$mdMedia = $mdMedia;
	this.$timeout = $timeout;
	this.$wbWindow = $wbWindow;
	this.$wbLocal = $wbLocal;
};
WbWidgetCtrl.prototype = new WbAbstractWidget();



/*******************************************************************************
 * * * * *
 ******************************************************************************/
/**
 * @ngdoc Controllers
 * @name WbWidgetGroupCtrl
 * @description Manages a group widget
 * 
 * This is a group controller
 * 
 * @ngInject
 */
var WbWidgetGroupCtrl = function ($scope, $element, $wbUtil, $widget, $mdTheming, $q, $http, $mdMedia, $timeout, $wbWindow, $wbLocal) {
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
	this.$wbWindow = $wbWindow;
	this.$wbLocal = $wbLocal;

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
			widget.setEditable(ctrl.isEditable());
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
			widget.setSelected(false);
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

angular.module('am-wb-core')
/**
 * @ngdoc Directives
 * @name ngSrcError
 * @description Handle ngSrc error
 * 
 * 
 * For example if you are about to set image of a user
 * 
 * @example
 * TO check if the directive works:
 ```html
 <img 
    alt="Test avatar" 
    ng-src="/this/path/dose/not/exist"
    ng-src-error="https://www.gravatar.com/avatar/{{ 'avatar id' | wbsha1}}?d=identicon&size=32">
 ```
 * @example
 * In this example we show an account avatar or a random from avatar generator
 ```html
  <img 
      ng-src="/api/v2/user/accounts/{{account.id}}/avatar"
      ng-src-error="https://www.gravatar.com/avatar/{{account.id}}?">
  ```
 */
.directive('ngSrcError', function () {
    return {
        link : function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.ngSrcError) {
                    attrs.$set('src', attrs.ngSrcError);
                }
            });
        }
    }
});
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

angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wb-setting-panel-group
	 * @description Widgets settings
	 * 
	 * Loads list of settings.
	 * 
	 */
	.directive('wbEventPanel', function ($settings, $widget) {
	    /**
	     * Init settings
	     */
	    function postLink($scope, $element, $attrs, $ctrls) {
		// Load ngModel
		var ngModelCtrl = $ctrls[0];
		var widget = null;
		var eventTypes = [{
			key: 'init',
			title: 'Initialization'
		    }, {
			key: 'click',
			title: 'Click'
		    }, {
			key: 'dblclick',
			title: 'Double click'
		    }, {
			key: 'mouseout',
			title: 'Mouse out'
		    }, {
			key: 'mouseover',
			title: 'Mouse over'
		    }, {
			key: 'mousedown',
			title: 'Mouse down'
		    }, {
			key: 'mouseup',
			title: 'Mouse up'
		    }, {
			key: 'mouseenter',
			title: 'Mouse enter'
		    }, {
			key: 'mouseleave',
			title: 'Mouse leave'
		    }, {
			key: 'resize',
			title: 'Resize'
		    }, {
			key: 'intersection',
			title: 'Intersection'
		    }, {
			key: 'success',
			title: 'Success'
		    }, {
			key: 'failure',
			title: 'Failure'
		    }];

		ngModelCtrl.$render = function () {
		    if (ngModelCtrl.$viewValue) {
			widget = ngModelCtrl.$viewValue;
			if (angular.isArray(widget)
				&& widget.length > 0) {
			    widget = widget[0];
			    loadEvents();
			} else {
			    cleanEvents();
			}
		    }
		};

		function cleanEvents() {
		    $scope.events = [];
		}

		function loadEvents() {
		    cleanEvents();
		    for (var i = 0; i < eventTypes.length; i++) {
			var event = eventTypes[i];
			event.code = widget.getModelProperty('event.' + event.key);
			$scope.events.push(event);
		    }
		}

		function saveEvents() {
		    for (var i = 0; i < $scope.events.length; i++) {
			var event = $scope.events[i];
			if (event.code) {
			    widget.setModelProperty('event.'
				    + event.key, event.code);
			} else {
			    widget.setModelProperty('event.'
				    + event.key, undefined);
			}
		    }
		}

		/**
		 * Save events into the model
		 */
		$scope.saveEvents = saveEvents;
	    }

	    return {
		restrict: 'E',
		replace: true,
		templateUrl: 'views/directives/wb-event-panel.html',
		scope: {},
		link: postLink,
		require: ['ngModel'],
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function ($scope, $resource) {

		    var defaultLanguages = [{
			    text: 'JavaScript',
			    value: 'javascript'
			}];
		    this.editEvent = function (event) {
			$resource.get('script', {
			    data: {
				language: 'javascript',
				languages: defaultLanguages,
				code: event.code
			    }
			}).then(function (value) {
			    event.code = value.code;
			    if (!value) {
				delete event.code;
			    }
			    $scope.saveEvents();
			});
		    };

		    this.deleteEvent = function (event) {
			delete event.code;
			$scope.saveEvents();
		    };
		}
	    };
	});

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

angular.module('am-wb-core')
/**
 * @ngdoc Directives
 * @name wb-group
 * @description Render a list of widget
 *  ## wbOnModelSelect
 * 
 * If a widget select with in the group then the wbOnModelSelect parameter will
 * be evaluated with the following attributes:
 *  - $event : the related event - $ctrl : the widget (to support legacy) -
 * $model: the model (to support legace)
 * 
 * NOTE: The root widget will be passed as first selected item. The function
 * will be evaluated in non edit mode.
 */
.directive('wbGroup', function($widget, $parse, $timeout) {

	/*
	 * Link widget view
	 */
	function wbGroupLink($scope, $element, $attrs, ngModelCtrl) {

		var model;
		var rootWidget;
		var onSelectionFuction;

		if ($scope.wbOnModelSelect) {
			onSelectionFuction = $parse($scope.wbOnModelSelect);
		}

		/*
		 * Fire if a widget is selected
		 */
		function fireSelection($event) {
			if(!onSelectionFuction) {
				return;
			}
			var widgets = $event.widgets;
			var locals = {
					'$event' : $event,
					'widgets' : widgets
			};
			if (angular.isArray(widgets) && widgets.length) {
				locals.$model = rootWidget.getModel();
				locals.$ctrl = rootWidget;
			}
			$scope.$eval(function() {
				onSelectionFuction($scope.$parent, locals);
			});
			$timeout(function(){
				try{$scope.$digest();} catch(ex){};
			});
		}

		// Load ngModel
		ngModelCtrl.$render = function() {
			model = ngModelCtrl.$viewValue;
			if (!model) {
				if (rootWidget) {
					rootWidget.setModel({
						type : 'Group'
					});
				}
				return;
			}
			// set new model to the group
			if (rootWidget) {
				rootWidget.setModel(model);
			} else {
				$widget.compile(model, null, $element)
				.then(function(widget) {
					rootWidget = widget;
					// load
					rootWidget.on('select', fireSelection);
					fireSelection({
						widgets : [ widget ]
					});
				});
			}
		};

		/*
		 * Watch for editable in root element
		 */
		$scope.$watch('wbEditable', function(editable) {
			if (rootWidget) {
				rootWidget.setEditable(editable);
			}
		});

		$scope.$watch('wbAllowedTypes', function(wbAllowedTypes) {
			if (rootWidget) {
				rootWidget.setAllowedTypes(wbAllowedTypes);
			}
		});

	}

	return {
		restrict : 'E',
		templateUrl: 'views/widgets/wb-group.html',
		scope : {
			wbEditable : '=?',
			wbOnModelSelect : '@?',
			wbAllowedTypes : '<?'
		},
		link : wbGroupLink,
		require : 'ngModel',
		replace: true
	};
});

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

angular.module('am-wb-core')



/**
 * @ngdoc Directives
 * @name wb-icon
 * @description Icon for WB
 */
.directive('wbIcon', function (wbIconService, $interpolate) {
	'use strict';
	// FORMAT
	var template = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="{{icon.viewbox}}" width="{{icon.size}}" height="{{icon.size}}">{{{icon.shape}}}</svg>';
	// REPLACE FORMAT
	var replaceTemplate = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="{{icon.viewbox}}" width="{{icon.size}}" height="{{icon.size}}"><g id="{{icon.name}}" style="display:none">{{{icon.shape}}}</g><g id="{{old.name}}" style="display:none">{{{old.shape}}}</g></svg>';
	
	// optimize pars
	Mustache.parse(template);
	Mustache.parse(replaceTemplate);

	var shapes = wbIconService.getShapes();

	function postLink(scope, element, attr, ctrls, transclude) {
		// icon information
		var icon = {
				name: 'help',
				viewbox: '0 0 24 24',
				size: 24,
		};
		// Counter
		var renderCount = 0;


		/*
		 * Sets icon and render the shape
		 */
		function setIcon(iconName){
			var tempIcon = _.clone(icon);
			// icon
			if (iconName !== undefined) {
				tempIcon.name = iconName;
				// Check for material-design-icons style name, and extract icon / size
				var ss = iconName.match(/ic_(.*)_([0-9]+)px.svg/m);
				if (ss !== null) {
					tempIcon.name = ss[1];
					tempIcon.size = ss[2];
				}
			}
			
			render(tempIcon);
		}

		function setViewBox(viewBox){
			// viewBox
			if (attr.viewBox !== undefined) {
				viewBox = attr.viewBox;
			} else {
				viewBox = wbIconService.getViewBox(icon) ? wbIconService.getViewBox(icon) : '0 0 24 24';
			}
			render();
		}

		function setSize(newsize){
			if (newsize === icon.size) { 
				return; 
			}
			var tempIcon = _.clone(icon);
			tempIcon.size = newsize;
			render(tempIcon);
		}

		function render(newIcon) {
			// check for new changes
			if(renderCount && newIcon.name === icon.name 
					&& newIcon.size === icon.size
					&& newIcon.viewbox === icon.viewbox){
				return;
			}
			newIcon.shape = shapes[newIcon.name];
			if(renderCount && window.SVGMorpheus) {
				// this block will succeed if SVGMorpheus is available
				var options = JSON.parse(attr.options || '{}');
				element.html(Mustache.render(replaceTemplate, {
					icon: newIcon,
					old: icon
				}));
				new SVGMorpheus(element.children()[0]).to(newicon, options);
			} else {
				element.html(Mustache.render(template, {
					icon: newIcon
				}));
			}

			icon = newIcon;
			renderCount++;
		};

		// watch for any changes
		if (attr.icon !== undefined) {
			attr.$observe('icon', setIcon); 
		} else if(attr.wbIconName !== undefined){
			attr.$observe('wbIconName', setIcon);
		} else {
			transclude(scope, function(clone) {
				var text = clone.text();
				if (text && text.trim()) {
					scope.$watch(function() {
						return $interpolate(text.trim())(scope);
					}, setIcon);
				}
			});
		}
		if (attr.size !== undefined) { 
			attr.$observe('size', setSize);  
		}
	}

	return {
		restrict: 'AE',
		transclude : true,
		link: postLink,
		replace: false
	};
})

.directive('mdIconFloat', function($mdTheming) {

	var INPUT_TAGS = [ 'INPUT', 'TEXTAREA', 'SELECT',
		'MD-SELECT' ];

	var LEFT_SELECTORS = INPUT_TAGS.reduce(
			function(selectors, isel) {
				return selectors.concat([ 'wb-icon ~ ' + isel,
					'.wb-icon ~ ' + isel ]);
			}, []).join(',');

	var RIGHT_SELECTORS = INPUT_TAGS.reduce(
			function(selectors, isel) {
				return selectors.concat([ isel + ' ~ wb-icon',
					isel + ' ~ .wb-icon' ]);
			}, []).join(',');

	function compile(tElement) {
		// Check for both a left & right icon
		var leftIcon = tElement[0]
		.querySelector(LEFT_SELECTORS);
		var rightIcon = tElement[0]
		.querySelector(RIGHT_SELECTORS);

		if (leftIcon) {
			tElement.addClass('md-icon-left');
		}
		if (rightIcon) {
			tElement.addClass('md-icon-right');
		}

		return function postLink(scope, element) {
			$mdTheming(element);
		};
	}

	return {
		restrict : 'C',
		compile : compile
	};
});

/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-on-enter
 * @description Call an action on ENTER
 * 
 * ```
 * <input
 *  wb-on-enter="toast('ESC')">
 * ```
 */
.directive('wbOnEnter', function() {
    return function(scope, elm, attr) {
        elm.bind('keypress', function(e) {
            if (e.keyCode === 13) {
                scope.$apply(attr.wbOnEnter);
            }
        });
    };
});
/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-on-error
 * @description Call an action on error
 * 
 * This directive is used to run an action on error of an element
 * 
 * ```
 * <img
 * 	wb-on-error="toast('image is not loaded')"
 * 	href="image/path">
 * ```
 */
.directive('wbOnError', function() {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			element.bind('error', function() {
				// call the function that was passed
				if (attrs.wbOnError) {
					scope.$apply(attrs.wbOnError);
				}
			});
		}
	};
});

/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-on-esc
 * @description Call an action on ESC
 * 
 * ```
 * <input
 *  wb-on-esc="toast('ESC')">
 * ```
 */
.directive('wbOnEsc', function() {
    return function(scope, elm, attr) {
        elm.bind('keydown', function(e) {
            if (e.keyCode === 27) {
                scope.$apply(attr.wbOnEsc);
            }
        });
    };
});


/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-on-load
 * @description Call an action on load
 * 
 * This directive is used to run an action on load of an element. For exmaple
 * use to show alert on load of image:
 * 
 * ```
 * <img
 * 	wb-on-load="toast('image is loaded')"
 * 	href="image/path">
 * ```
 */
.directive('wbOnLoad', function() {
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			element.bind('load', function() {
				// call the function that was passed
				if (attrs.wbOnLoad) {
					scope.$apply(attrs.wbOnLoad);
				}
			});
		}
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-setting-page
 * @description Display a setting of a model
 * 
 */
.directive('wbSettingPage', function ($widget, $settings, $wbUtil, $controller, $compile, $mdTheming) {

	function postLink($scope, $element, $attrs, $ctrls) {
		var wbWidget = null;
		var settingCtrl = null;

		function loadSetting(page) {
			return $wbUtil.getTemplateFor(page)
			.then(function (templateSrc) {
				var element = angular.element(templateSrc);
				var scope = $scope.$new();
				var controller = $controller('AmWbSettingPageCtrl',{
					$scope: scope,
					$element: element
				});
				if (angular.isDefined(page.controller)) {
					angular.extend(controller, $controller(page.controller, {
						$scope: scope,
						$element: element
					}));
					if (page.controllerAs) {
						scope[page.controllerAs] = controller;
					}
					element.data('$ngControllerController', controller);
				}
				$compile(element)(scope);
				$mdTheming(element);
				$element.empty();
				$element.append(element);
				return controller;
			});
		}

		$scope.$watch('type', function (type) {
			if (!type) {
				return;
			}
			var setting = $settings.page(type);
			loadSetting(setting)//
			.then(function(ctrl){
				settingCtrl = ctrl;
				if(wbWidget) {
					settingCtrl.setWidget(wbWidget);
				}
			});
		});

		// Load ngModel
		var ngModelCtrl = $ctrls[0];
		ngModelCtrl.$render = function () {
			wbWidget = ngModelCtrl.$viewValue;
			if(settingCtrl) {
				settingCtrl.setWidget(wbWidget);
			}
		};
	}

	// create directive
	return {
		restrict: 'E',
		replace: true,
		template: '<div layout="column"></div>',
		link: postLink,
		scope: {
			type: '@wbType'
		},
		require: ['ngModel']
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-setting-panel-group
 * @description Widgets settings
 * 
 * Loads list of settings.
 * 
 */
.directive('wbSettingPanelGroup', function($settings, $widget) {

	/**
	 * Init settings
	 */
	function postLink($scope, $element, $attrs, $ctrls) {

		// Load ngModel
		var ngModelCtrl = $ctrls[0];
		var settingMap = [];
		$scope.settings = [];

		/**
		 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
		 * 
		 * @returns
		 */
		function loadSetting(wbWidget) {

			// hide all settings
			var i;
			for(i = 0; i < $scope.settings.length; i++){
				$scope.settings[i].visible = false;
			}
			
			if(!wbWidget || (angular.isArray(wbWidget) && wbWidget.length < 1)){
			    $scope.wbModel = null;
			    return;
			}

			// load pages
			var widget = $widget.getWidget(wbWidget.getModel());
			var settingKeys = $settings.getSettingsFor(widget);

			// visible new ones
			for(i = 0; i < settingKeys.length; i++){
				var key = settingKeys[i];
				if(!settingMap[key]){
					var setting = $settings.getPage(key);
					settingMap[key] = angular.copy(setting);
					$scope.settings.push(settingMap[key]);
				}
				settingMap[key].visible = true;
			}
			
			// set model in view
			$scope.wbModel = wbWidget;
		}

		ngModelCtrl.$render = function() {
			if(ngModelCtrl.$viewValue) {
				var model = ngModelCtrl.$viewValue;
				if(angular.isArray(model) && model.length){
					loadSetting(model[0]);
				} else {
					loadSetting(model);
				}
			}
		};
	}
	
	return {
		restrict : 'E',
		replace: true,
		templateUrl: function($element, $attr){
			var link = 'views/directives/wb-setting-panel-';
			if(angular.isDefined($attr.wbTabMode)){
				link += 'tabs.html';
			} else {
				link += 'expansion.html';
			}
			return link;
		},
		scope : {},
		link : postLink,
		require:['ngModel']
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbWidget
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbUiChoose', function() {
	return {
		templateUrl : 'views/directives/wb-ui-choose.html',
		restrict : 'E',
		controllerAs: 'ctrl',
		scope : {
			items : '=items',
			selected : '=selected'
		},
		controller : function($scope) {
			this.selectedIndex = 0;
			if ($scope.selected !== null) {
				for ( var item in $scope.items) {
					if (item.value === $scope.selected) {
						this.selectedIndex = $scope.items.indexOf(item);
					}
				}
			} else {
				$scope.selected = $scope.items[0].value;
			}

			// listen to active tab and update selected attribute.
			// $scope.$watch('selectedIndex', function(current) {
			//	$scope.selected = $scope.items[current].value;
			// });
			
			
			// listen to active tab and update selected attribute.
			this.tabChanged = function (current) {
			    $scope.selected = $scope.items[current].value;
			};
		}
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingAudio
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to select audio file.
 *
 */
.directive('wbUiSettingAudio', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-audio.html',
        restrict: 'E',
        scope: {
            title: '@title',
            icon: '@icon'
        },
        require: ['ngModel'],
        link: function (scope, element, attr, ctrls) {
            var ngModelCtrl = ctrls[0];

            ngModelCtrl.$render = function () {
                scope.value = ngModelCtrl.$modelValue;
            };

            scope.valueChanged = function (value) {
                ngModelCtrl.$setViewValue(value);
            };
        },
        controllerAs: 'ctrl',
        /*
         * @ngInject
         */
        controller: function($scope, $resource){
            this.editValue = function(value){
                var ctrl = this;
                return $resource.get('audio', {
                    style: {
                        title: 'Select Audio'
                    },
                    data: value
                })//
                .then(function(newValue){
                    ctrl.updateValue(newValue);
                });
            };
            this.updateValue = function(newValue) {
                $scope.value = newValue;
                $scope.valueChanged(newValue);
            }
        }
    };
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingColor
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingBackgroundAttachment', function () {

    function postLink(scope, element, attr, ctrls) {
        var ngModelCtrl = ctrls[0];

        ngModelCtrl.$render = function () {
            scope.attachment = ngModelCtrl.$modelValue;
        };

        scope.attachmentChanged = function (newAttachment) {
            ngModelCtrl.$setViewValue(newAttachment);
        };
    }
    return {
        templateUrl: 'views/directives/wb-ui-setting-background-attachment.html',
        restrict: 'E',
        replace: true,
        scope: {},
        require: ['ngModel'],
        link: postLink,
        /*
         * @ngInject
         */
        controller: function ($scope) {
            $scope.items = [
                {name: 'Scroll', value: 'scroll'},
                {name: 'Fixed', value: 'fixed'},
                {name: 'Local', value: 'local'},
                {name: 'Initial', value: 'initial'},
                {name: 'Inherit', value: 'inherit'},
                {name: 'Nothing', value: ''}
                ];

        }
    };
});
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


angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wbUiSettingColor
	 * @description a setting section to set color.
	 *
	 */
	.directive('wbUiSettingBackgroundOrigin', function () {
	    function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0];

		ngModelCtrl.$render = function () {
		    scope.origin = ngModelCtrl.$modelValue;
		};

		scope.originChanged = function (newOrigin) {
		    ngModelCtrl.$setViewValue(newOrigin);
		};
	    }

	    return {
		templateUrl: 'views/directives/wb-ui-setting-background-origin.html',
		restrict: 'E',
		replace: true,
		scope: {},
		require: ['ngModel'],
		link: postLink,
        /*
         * @ngInject
         */
		controller: function ($scope) {
		    $scope.items = [
			{name: 'Padding-box', value: 'padding-box'},
			{name: 'Border-box', value: 'border-box'},
			{name: 'Content-box', value: 'content-box'},
			{name: 'No-repeat', value: 'no-repeat'},
			{name: 'Initial', value: 'initial'},
			{name: 'Inherit', value: 'inherit'},
			{name: 'Nothing', value: ''}
		    ];

		}
	    };
	});
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


angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wbUiSettingColor
	 * @description a setting section to set color.
	 *
	 */
	.directive('wbUiSettingBackgroundPosition', function () {
	    
	    function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0];

		ngModelCtrl.$render = function () {
		    scope.position = ngModelCtrl.$modelValue;
		};

		scope.positionChanged = function (newPosition) {
		    ngModelCtrl.$setViewValue(newPosition);
		};
	    }

	    return {
		templateUrl: 'views/directives/wb-ui-setting-background-position.html',
		restrict: 'E',
		scope: {},
		controllerAs: 'ctrl',
		require: ['ngModel'],
		link: postLink,
		/*
		 * 
		 * @ngInject
		 */
		controller: function ($scope) {
		    $scope.items = [
			{title: 'Left top', value: 'left top'},
			{title: 'Left center', value: 'left center'},
			{title: 'Left bottom', value: 'left bottom'},
			{title: 'Right top', value: 'right top'},
			{title: 'Right center', value: 'right center'},
			{title: 'Center top', value: 'center top'},
			{title: 'Center center', value: 'center center'},
			{title: 'Center bottom', value: 'center bottom'},
			{title: 'Initial', value: 'initial'},
			{title: 'Inherit', value: 'inherit'},
			{title: 'Nothing', value: ''}
		    ];

		}
	    };
	});
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

angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wbUiSettingColor
	 * @description a setting section to set color.
	 *
	 */
	.directive('wbUiSettingBackgroundRepeat', function () {

	    function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0];

		ngModelCtrl.$render = function () {
		    scope.repeat = ngModelCtrl.$modelValue;
		};

		scope.repeatChanged = function (newRepeat) {
		    ngModelCtrl.$setViewValue(newRepeat);
		};
	    }

	    return {
		templateUrl: 'views/directives/wb-ui-setting-background-repeat.html',
		restrict: 'E',
		replace: true,
		scope: {},
		require: ['ngModel'],
		link: postLink,
        /*
         * @ngInject
         */
		controller: function ($scope) {
		    $scope.items = [
			{name: 'Repeat', value: 'repeat'},
			{name: 'Repeat-x', value: 'repeat-x'},
			{name: 'Repeat-y', value: 'repeat-y'},
			{name: 'No-repeat', value: 'no-repeat'},
			{name: 'Space', value: 'space'},
			{name: 'Round', value: 'round'},
			{name: 'Initial', value: 'initial'},
			{name: 'Inherit', value: 'inherit'},
			{name: 'Nothing', value: ''}

		    ];

		}
	    };
	});
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

angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wbUiSettingColor
	 * @description a setting section to set color.
	 * 
	 */
	.directive('wbUiSettingBackgroundSize', function () {

	    function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0];
		//  $mdTheming(element);

		/*
		 * convert to index
		 */

		ngModelCtrl.$render = function () {
		    scope.size = ngModelCtrl.$modelValue;
		};

		scope.sizeChanged = function (newSize) {
		    ngModelCtrl.$setViewValue(newSize);
		};
	    }

	    return {
		templateUrl: 'views/directives/wb-ui-setting-background-size.html',
		restrict: 'E',
		replace: true,
		scope: {},
		require: ['ngModel'],
		link: postLink,
		/*
		 * @ngInject
		 */
		controller: function ($scope) {
		    $scope.items = [{
			    name: 'Automatic',
			    value: 'auto'
			}, {
			    name: 'Length',
			    value: 'length'
			}, {
			    name: 'Cover',
			    value: 'cover'
			}, {
			    name: 'Contain',
			    value: 'contain'
			}, {
			    name: 'Initial',
			    value: 'initial'
			}, {
			    name: 'Inherit',
			    value: 'inherit'
			}, {
			    name: 'Nothing',
			    value: ''
			}];

		}
	    };
	});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingChoose
 * @description a setting section for choosing values.
 *
 */
.directive('wbUiSettingChoose', function ($mdTheming, $mdUtil) {

	function postLink(scope, element, attr, ctrls) {
		var ngModelCtrl = ctrls[0] || $mdUtil.fakeNgModel();
		$mdTheming(element);

		/*
		 * convert to index
		 */
		function toIndex (value){
			for (var index = 0; index < scope.xitems.length; index++) {
				if (scope.xitems[index].value === value){
					return index;
				}
			}
			// TODO: maso, 2017: update default value.
			return 0;
		}

		/*
		 * render the data
		 */
		ngModelCtrl.$render  = function() {
			scope.selectedIndex = toIndex(ngModelCtrl.$modelValue);
		}

		scope.selectionChanged = function(){
		    ngModelCtrl.$setViewValue(scope.xitems[scope.selectedIndex].value);
		};
	}

	/*
	 * Directive info
	 */
	return {
		templateUrl: 'views/directives/wb-ui-setting-choose.html',
		restrict: 'E',
		scope: {
			icon: '@',
			title: '@',
			xitems: '<items'
		},
		require: ['?ngModel'],
		priority: 210, // Run before ngAria
		link: postLink
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingColor
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingColor', function ($mdTheming){
    return {
        templateUrl: 'views/directives/wb-ui-setting-color.html',
        restrict: 'E',
        scope: {
            title: '@title',
            icon: '@icon'
        },
        require: ['ngModel'],
        link: function(scope, element, attr, ctrls) {
            var ngModelCtrl = ctrls[0];
            /*
             * convert to index
             */
            ngModelCtrl.$render = function () {
                scope.valueColor = ngModelCtrl.$modelValue;
            };

            scope.colorChanged = function (newColor) {
                ngModelCtrl.$setViewValue(newColor); 
            };
        }
    };
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingData
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to manage data.
 *
 */
.directive('wbUiSettingData', function() {
	return {
		templateUrl : 'views/directives/wb-ui-setting-data.html',
		restrict : 'E',
		scope : {
			title : '@title',
			icon : '@icon'
		},
        /*
         * @ngInject
         */
		controller : function($scope, $resource) {
			this.editValue = function(value) {
				return $resource.get('data', {
					style : {
						icon: 'insert_chart',
						title : 'Data sheet',
						description: 'Edit data of the current sheet'
					},
					data : value
				}) //
				.then(function(data) {
					if(!angular.isDefined($scope.value)){
						$scope.value = {};
					}
					// Just copy data values
					$scope.value.key = data.key;
					$scope.value.values = data.values;
				});
			};
		}
	};
});
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-ui-setting-dropdown
 * @description a setting section for choosing values.
 *
 */
.directive('wbUiSettingDropdownValue', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-dropdown-value.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value',
			icon: '@icon',
			items:'=items'
		}
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingDropdown
 * @description a setting section for choosing values.
 *
 */
.directive('wbUiSettingDropdown', function () {
    return {
        templateUrl: 'views/directives/wb-ui-setting-dropdown.html',
        restrict: 'E',
        scope: {
            title: '@title',
            icon: '@icon',
            items:'=items'
        },
        require: ['ngModel'],
        link: function (scope, element, attr, ctrls) {
            var ngModelCtrl = ctrls[0];

            ngModelCtrl.$render = function () {
                scope.value = ngModelCtrl.$modelValue;
            };

            scope.valueChanged = function (value) {
                scope.value = value;
                ngModelCtrl.$setViewValue(value);
            };
        }
    };
});

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




//General options
//- wbUiSettingClearButton 
//- wbUiSettingPreview

angular.module('am-wb-core')
	.controller('wbUiSettingGeneralCtrl', function ($scope) {

	    // TODO: maso, 2018:load from user config
	    $scope.wbUiSettingClearButton = true;
	    $scope.wbUiSettingPreview = true;

	    this.clearValue = function (/*$event*/){
	        // General option
	        this.value = null;
	        this.valueChanged(null);
	    }
	    
	    this.setValue = function(value){
	        this.value = value;
	        this.valueChanged(value);
	    }
	    
	    this.getValue = function(){
	        this.value;
	    }

	})
	.controller('wbUiSettingImageCtrl', function ($scope, $resource, $controller){
	    var ctrl = this;

	    angular.extend(ctrl, $controller('wbUiSettingGeneralCtrl', {
	        $scope : $scope
	    }));

	    function showImagePicker(){
	        return $resource.get('image', {
	            style: {
	                icon: 'image',
	                title: 'Select image',
	                description: 'Select image from resources.'
	            },
	            data: ctrl.getValue()
	        })//
	        .then(function(value){
	            ctrl.setValue(value);
	        });
	    }

	    ctrl.showImagePicker = showImagePicker;
	})

/**
 * @ngdoc Directives
 * @name wbUiSettingImage
 * @author maso(mostafa.barmshory@dpq.co.ir)
 * @description Set an image into a value
 * 
 * URL of the image is set as result.
 *
 */
.directive('wbUiSettingImage', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-image.html',
		restrict: 'E',
		scope: {
			title: '@title',
			icon: '@icon'
		},
		require:['wbUiSettingImage', 'ngModel'],
		link: function ($scope, $element, $attrs, $ctrl){
			var ctrl = $ctrl[0];
			var ngModelCtrl = $ctrl[1];
			var lock = false;
			ngModelCtrl.$render = function(){
				lock = true;
				ctrl.setValue(ngModelCtrl.$viewValue);
				lock = false;
			};
			ctrl.valueChanged = function (newValue) {
				if(lock){
					return;
				}
				ngModelCtrl.$setViewValue(newValue);
			};
		},
		controller: 'wbUiSettingImageCtrl',
		controllerAs: 'ctrl'
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingLength
 */
.directive('wbUiSettingLength', function () {

    function postLink($scope, $element, $attrs, ngModel) {
        ngModel.$render = function () {
            pars(ngModel.$modelValue);
        };

        // Add all length by default
        $scope.lengthValues = ['px', 'cm', 'in', '%', 'vh'];
        $scope.extraValues = $scope.extraValues || [];
        var types = $scope.extraValues;
        if (types) { 
            types = types.concat($scope.lengthValues);
            if (types.includes('length')) {
                var index = types.indexOf('length');
                types.splice(index, 1);
            }
        } else {
            types = $scope.lengthValues;
        }

        $scope.types = types;

        function pars(value) {
            if (!value) {
                $scope.internalUnit = types[0];
                $scope.internalValue = 0;
            } else {
                split(value);
            }
        }

        $scope.updateLength = function(unit, value) {
            if ($scope.lengthValues.includes(unit)) {
                ngModel.$setViewValue(value+unit);
            } else {
                ngModel.$setViewValue(unit);
            }
        };

        /*
         * @param {type} val
         * @returns {undefined}
         * decsription  Splite value to 'unit' and 'value'
         */
        function split(val) {
            if ($scope.extraValues.includes(val)) {
                $scope.internalUnit = val;
            } else {
                /*
                 * A regex which groups the val into the value and unit(such as 10px -> 10 , px).
                 * This regex also support signed float format such as (+10.75%, -100.76em)
                 */
                var regex = /^([+-]?\d+\.?\d*)([a-zA-Z%]*)$/;
                var matches = regex.exec(val);
                if(angular.isArray(matches)){
                    $scope.internalValue = Number(matches[1]);
                    $scope.internalUnit = matches[2];
                }
            }
        }
    }

    return {
        templateUrl: 'views/directives/wb-ui-setting-length.html',
        restrict: 'E',
        replace: true,
        scope: {
            title: '@title',
            icon: '@?',
            description: '@?',
            extraValues: '<?'
        },
        /*
         * @ngInject
         */
        controller: function ($scope) {
            /**
             * Check if the current unit is numerical
             */
            this.isNumerical = function () {
                return $scope.lengthValues.includes($scope.internalUnit);
            };

        },
        controllerAs: 'ctrl',
        link: postLink,
        require: 'ngModel'
    };
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingColor
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @description a setting section to set color.
 *
 */
.directive('wbUiSettingLink', function ($resource) {

    function postLink(scope, element, attr, ctrls) {
        var ngModelCtrl = ctrls[0];

        ngModelCtrl.$render = function () {
            scope.url = ngModelCtrl.$modelValue;
        };

        scope.urlChanged = function (url) {
            ngModelCtrl.$setViewValue(url);
        };
    }

    return {
        templateUrl: 'views/directives/wb-ui-setting-link.html',
        restrict: 'E',
        replace: true,
        scope: {
            title: '@title',
            icon: '@icon'
        },
        require: ['ngModel'],
        link: postLink,
        controllerAs: 'ctrl',
        /*
         * @ngInject
         */
        controller: function($scope){
            this.selectlink = function(){
                $resource.get('url', {
                    style: {
                        icon: 'link',
                        title: 'Link',
                        description: 'Select url'
                    },
                    data: $scope.url
                })//
                .then(function(value){
                    $scope.url = value;
                    $scope.urlChanged(value);
                });
            };
        }
    };
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingNumber
 * @description a setting section to set a number.
 *
 */
.directive('wbUiSettingNumber', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-number.html',
		restrict: 'E',
		scope: {
			title: '@title',
			icon: '@icon',
			slider:'@slider'
		},
		require: ['ngModel'],
		link: function (scope, element, attr, ctrls) {
		    var ngModelCtrl = ctrls[0];

		    ngModelCtrl.$render = function () {
			scope.value = ngModelCtrl.$modelValue;
		    };

		    scope.valueChanged = function (value) {
			ngModelCtrl.$setViewValue(value);
		    };
		}
	};
});

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

angular.module('am-wb-core')

	/**
	 * @ngdoc Directives
	 * @name wbUiSettingOnOffSwitch
	 * @description a setting section for on/off switch.
	 *
	 */
	.directive('wbUiSettingOnOffSwitch', function () {
	    return {
		templateUrl: 'views/directives/wb-ui-setting-on-off-switch.html',
		restrict: 'E',
		scope: {
		    title: '@title',
		    icon: '@icon'
		},
		require: ['ngModel'],
		link: function (scope, element, attr, ctrls) {
		    var ngModelCtrl = ctrls[0];

		    ngModelCtrl.$render = function () {
			scope.value = ngModelCtrl.$modelValue;
		    };

		    scope.valueChanged = function (value) {
			ngModelCtrl.$setViewValue(value);
		    };
		}
	    };
	});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-ui-setting-text
 * @description Setting for a text
 *
 */
.directive('wbUiSettingText', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-text.html',
		restrict: 'E',
		scope: {
			title: '@title',
			value: '=value',
			icon: '@icon'
		}
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wbUiSettingVideo
 * @author maso<mostafa.barmshory@dpq.co.ir>
 * @author hadi<mohammad.hadi.mansouri@dpq.co.ir>
 * @description a setting section to select audio file.
 *
 */
.directive('wbUiSettingVideo', function () {
	return {
		templateUrl: 'views/directives/wb-ui-setting-video.html',
		restrict: 'E',
		scope: {
			title: '@title',
            lable: '@lable',
			icon: '@icon'
		},
        /*
         * @ngInject
         */
		controller: function($scope, $resource){
			this.selectValue = function(){
			    var ctrl = this;
				return $resource.get('vedio', {
					style: {
						title: 'Select video'
					},
					data: $scope.value
				})//
				.then(function(value){
					ctrl.changeValue(value);
				});
			};
			/*
			 * Set new value
			 */
			this.changeValue = function(newValue){
			    $scope.valueChanged(newValue);
			};
			
			this.clearValue = function() {
                this.changeValue(null);
			};
		},
		controllerAs: 'ctrl',
		require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {
            /*
             * Set in scope
             */
            ngModelCtrl.$render = function () {
                scope.value = ngModelCtrl.$modelValue;
            };
            
            /*
             * Change the model
             */
            scope.valueChanged = function (newValue) {
                scope.value = newValue;
                ngModelCtrl.$setViewValue(newValue); 
            };
        }
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-widgets-explorer
 * @description Widgets explorers
 * 
 * This is widgets explorer list.
 * 
 */
.directive('wbWidgetsExplorer', function($widget, $rootScope) {
	/*
	 * link function
	 */
	function postLink(scope, element, attrs, ctrls) {

		var ngModel = ctrls[0];
		var widgets = null;

		if($rootScope.app && $rootScope.app.setting) {
			// save setting in root scope
			if(!$rootScope.app.setting.wbWidgetExplorer){
				$rootScope.app.setting.wbWidgetExplorer = {};
			}
			scope.wbWidgetExplorer = $rootScope.app.setting.wbWidgetExplorer;
		} else {
			scope.wbWidgetExplorer = {};
		}

		/*
		 * Filter widgets width the query
		 */
		function _loadQuery(query, widgets){
			if(query) {
				var q = query.trim().toLowerCase();
				return widgets.filter(function(w){
					return w.title.toLowerCase().indexOf(q) > -1 || w.description.indexOf(q) > -1;
				});
			}
			return widgets;
		}

		/*
		 * Load widgets in groups
		 */
		function _loadGroups(widgets){
			var groups = [];
			var tmp = {};
			for(var i = 0; i < widgets.length; i++){
				var gl = widgets[i].groups || [];
				for(var j = 0; j < gl.length; j++){
					var gid = gl[j];
					if(!angular.isDefined(tmp[gid])){
						tmp[gid] = angular.copy($widget.group(gid));
						tmp[gid].widgets = [];
						groups.push(tmp[gid]);
					}
					tmp[gid].widgets.push(widgets[i]);
				}
			}
			return groups;
		}

		function _runQuery(/*query, $event*/){
			scope.widgets = _loadQuery(scope.query, widgets);
			scope.groups = _loadGroups(scope.widgets);
		}

		function _load(){
			if(!widgets){
				scope.widgets = [];
				return;
			}
			// maso, 2018: clear configs
			scope.query = '';
			scope.widgets = _loadQuery(scope.query, widgets);
			scope.groups = _loadGroups(scope.widgets);
		}

		// Load models
		ngModel.$render = function(){
			widgets = ngModel.$modelValue;
			_load();
		};

		scope.runQuery = _runQuery;
	}

	return {
		templateUrl : 'views/directives/wb-widgets-explorer.html',
		restrict : 'E',
		replace : true,
		scope: {},
		require: ['ngModel'],
		link : postLink
	};
});
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-widgets-list
 * @description Widgets explorers
 * 
 * This is widgets explorer list.
 * 
 */
.directive('wbWidgetsList', function($window) {

	return {
		templateUrl : 'views/directives/wb-widgets-list.html',
		restrict : 'E',
		replace : true,
		scope : {
			widgets : '<'
		},
		/*
		 * @ngInject
		 */
		controller : function($scope) {
			if (angular.isFunction($window.openHelp)) {
				$scope.openHelp = function(widget, $event) {
					$window.openHelp(widget, $event);
				};
			}
		}
	};
});
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

angular.module('am-wb-core')

/**
 * @ngdoc Directives
 * @name wb-widgets-module
 * @description Widgets explorers
 * 
 * This is widgets explorer list.
 * 
 */
.directive('wbWidgetsModule', function($window) {

	return {
		templateUrl : 'views/directives/wb-widgets-module.html',
		restrict : 'E',
		replace : true,
		scope: {
			widgets: '<'
		},
		/*
		 * @ngInject
		 */
		controller: function($scope){
			if(angular.isFunction($window.openHelp)){
				$scope.openHelp = function(widget, $event){
					$window.openHelp(widget, $event);
				};
			}
		}
	};
});
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

angular.module('am-wb-core')
.factory('WbDialogWindow', function($wbWindow, $document, $wbFloat) {
	'use strict';


	// Utils
	function covertToFloadConfig(dialogWindow) {
		var options = {
				closeOnEscape: dialogWindow.closeOnEscape,
				header: dialogWindow.isTitleVisible(),
				headerTitle: dialogWindow.getTitle(),
				headerLogo: '',
				headerControls: {
//					close: 'remove',
//					maximize: 'remove',
//					normalize: 'remove',
//					minimize: 'remove',
//					smallify: 'remove',
//					smallifyrev: 'remove',
				}
		};

		if(angular.isDefined(dialogWindow.x)){
			options.position = {
					type: 'fixed',
					my: 'left-top',
					at: 'left-top',
					of: 'body',
					container: 'body',
					offsetX: dialogWindow.x,
					offsetY: dialogWindow.y
			}
		}
		if(angular.isDefined(dialogWindow.width)){
			options.panelSize = {
					width: dialogWindow.width, 
					height: dialogWindow.width
			};
		}

		return options;
	}

	/**
	 * @ngdoc Factory
	 * @name WbDialogWindow
	 * @description WbDialogWindow a dialog manager
	 * 
	 */
	var wbWindow = function(parent){
		this.parent = parent || $wbWindow;
		this.floatDialogElement = null;
		this.setTitleVisible(true);
	};

	/**
	 * Gets parent of the window
	 * 
	 * @memberof WbDialogWindow
	 */
	wbWindow.prototype.getParent = function(){
		return this.parent;
	}

	/**
	 * Sets title of the window
	 * 
	 * @memberof WbDialogWindow
	 * @params title {string} the window title
	 */
	wbWindow.prototype.setTitle = function(title){
		this.title = title;
		if(this.isVisible()){
			// TODO: maso, 2019: set title of the current dialog
		}
	};

	/**
	 * Sets title of the window
	 * 
	 * @memberof WbDialogWindow
	 * @return {string} the window title
	 */
	wbWindow.prototype.getTitle = function(){
		return this.title;
	};


	/**
	 * Sets language of the window
	 * 
	 * @memberof WbDialogWindow
	 * @params language {string} the window language
	 */
	wbWindow.prototype.setLanguage = function(language){
		this.language = language;
		if(this.isVisible()){
			// TODO: maso, 2019: set title of the current dialog
		}
	};

	/**
	 * Sets title of the window
	 * 
	 * @memberof WbDialogWindow
	 * @return {string} the window language
	 */
	wbWindow.prototype.getLanguage = function(){
		return this.language;
	};

	/**
	 * 
	 * The open() method opens a new browser window, or a new tab, depending 
	 * on your browser settings.
	 * 
	 * Tip: Use the close() method to close the window.
	 * 
	 * @memberof WbDialogWindow
	 * @return window object
	 */
	wbWindow.prototype.open = function(url, name, options, replace){
		return $wbWindow.open(url, name, options, replace);
	};

	/**
	 * Close current window
	 * 
	 * 
	 * @memberof WbDialogWindow
	 * @params visible {boolean} of the window
	 */
	wbWindow.prototype.close = function(){
		this.setVisible(false);
		// TODO: maso, 2019: remove dome and destroy scope.
	};

	/**
	 * Sets visible of the window
	 * 
	 * 
	 * @memberof WbDialogWindow
	 * @params visible {boolean} of the window
	 */
	wbWindow.prototype.setVisible = function(visible){
		if(!this.floatDialogElement) {
			this.floatDialogElement = $wbFloat.create(covertToFloadConfig(this));
		} else if(this.floatDialogElement.isVisible() === visible) {
			return;
		}

		this.floatDialogElement.setVisible(visible);
	};

	/**
	 * Gets visible of the window
	 * 
	 * 
	 * @memberof WbDialogWindow
	 * @returns true if the window is visible
	 */
	wbWindow.prototype.isVisible = function(){
		if(! this.floatDialogElement){
			return false;
		}
		return this.floatDialogElement.isVisible();
	};

	/**
	 * Sets position of the window
	 * 
	 * 
	 * @memberof WbDialogWindow
	 * @params x {string|int} absolute position
	 * @params y {string|int} absolute position
	 */
	wbWindow.prototype.setPosition = function(x, y) {
		this.x = x;
		this.y = y;
		if(this.floatDialogElement){
			// TODO: reload the window position
		}
	};

	/**
	 * Gets current position of the window
	 * 
	 * @memberof WbDialogWindow
	 * @return position
	 */
	wbWindow.prototype.getPosition = function() {
		return {
			x: this.x,
			y:this.y,
		};
	};



	/**
	 * Close window on Escape
	 * 
	 * @memberof WbDialogWindow
	 * @params x {string|int} absolute position
	 * @params y {string|int} absolute position
	 */
	wbWindow.prototype.setCloseOnEscape = function(closeOnEscape) {
		this.closeOnEscape = closeOnEscape;
		if(this.floatDialogElement){
			// TODO: reload the window close
		}
	};

	/**
	 * Sets size of the window
	 * 
	 * @memberof WbDialogWindow
	 * @params width {string|int} absolute position
	 * @params height {string|int} absolute position
	 */
	wbWindow.prototype.setSize = function(width, height) {
		this.width = width;
		this.height = height;
		if(this.floatDialogElement){
			// TODO: reload the window size
		}
	};

	/**
	 * Loads a library
	 * 
	 * @memberof WbDialogWindow
	 * @path path of library
	 * @return promise to load the library
	 */
	wbWindow.prototype.loadLibrary = function(path){
		return $wbLibs.load(path);
	};

	/**
	 * Check if the library is loaded
	 * 
	 * @memberof WbDialogWindow
	 * @return true if the library is loaded
	 */
	wbWindow.prototype.isLibraryLoaded = function(path){
		return $wbLibs.isLoaded(path);
	};


	/**
	 * Set meta
	 * 
	 * @memberof WbDialogWindow
	 * @params key {string} the key of meta
	 * @params value {string} the value of meta
	 */
	wbWindow.prototype.setMeta = function (key, value){
		var parent = this.getParent();
		if(parent) {
			parent.setMeta(key, value);
		}
	};

	/**
	 * Set link
	 * 
	 * @memberof WbDialogWindow
	 * @params key {string} the key of link
	 * @params data {string} the value of link
	 */
	wbWindow.prototype.setLink = function (key, data){
		var parent = this.getParent();
		if(parent) {
			parent.setLink(key, data);
		}
	};


	/**
	 * Write the body
	 * 
	 * @memberof WbDialogWindow
	 * @params data {string} the value
	 */
	wbWindow.prototype.write = function (data){
		this.floatDialogElement.getElement()
		.then(function(parentElement){
			// string
			var element = angular.element(data);
			parentElement.empty();
			parentElement.append(element);
		});
	};

	/**
	 * Set view the body
	 * 
	 * @memberof WbDialogWindow
	 * @params data {Object} the view
	 */
	wbWindow.prototype.setView = function (view){
		return this.floatDialogElement.setView(view);
	};

	wbWindow.prototype.setWidth = function(width){
		this.resizeTo(width, this.getHeight());
	};

	wbWindow.prototype.getWidth = function(){
		return this.width;
	};

	wbWindow.prototype.setHeight = function(height){
		this.resizeTo(this.getWidth(), height);
	};

	wbWindow.prototype.getHeight = function(){
		return this.height;
	};

	wbWindow.prototype.resizeTo = function(width, height) {
		this.width = width;
		this.height = height;
		if(this.floatDialogElement){
			this.floatDialogElement.resize(width, height);
		}
	};
	
	
	wbWindow.prototype.setTitleVisible = function(visible){
		this._titleVisible = visible;
		if(this.floatDialogElement){
			// TODO: maso, 2019: Check if the JPanel supports title visibility online.
		}
	};
	
	wbWindow.prototype.isTitleVisible = function(){
		return this._titleVisible;
	};

	return wbWindow;
});

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

angular.module('am-wb-core')
.factory('NativeWindowWrapper', function($q, $injector, $window, $wbFloat, $rootScope) {
    'use strict';

    /**
     * @ngdoc Factory
     * @name WbDialogWindow
     * @description WbDialogWindow a dialog manager
     * 
     */
    var nativeWindowWrapper = function(nativeWindow){
        this.nw = nativeWindow;
        this.location = nativeWindow.location;
        this.libs = {};
    };


    /********************************************************************
     * Utilitiey
     ********************************************************************/
    var WbDialogWindow;


    /*
     * Open a float based on options
     */
    function openFloatPanel(window, options) {
        if(!WbDialogWindow){
            WbDialogWindow = $injector.get('WbDialogWindow');
        }

        var window = new WbDialogWindow(window);
        window.setTitle(options.name);
        window.setLanguage(options.language);
        if(options.position){
            window.setPosition(options.position.x, options.position.y);
        }
        window.setCloseOnEscape(options.closeOnEscape);
        if(angular.isDefined(options.showTitle)) {
        	window.setTitleVisible(options.showTitle);
        }
        if(angular.isDefined(options.size)) {
        	var size = options.size;
        	window.setWidth(size.width);
        	window.setHeight(size.height);
        }
        if(angular.isDefined(options.showTitle)){
        	window.setTitleVisible(options.showTitle);
        }
        window.setVisible(true);
        
        if(angular.isString(options.url)){
        	// Open URL
        	window.write('<iframe style="width:100%; height: 100%;" src="'+options.url+'"></iframe>');
        } else if(angular.isObject(options.url)){
        	var view = options.url;
        	if(view.type === 'view'){
        		window.setView(view);
        	}
        } else {
        	throw {
        		message: 'Not supported type of URL',
        		url: options.url
        	}
        }
        
        
        return window;
    }

    /*
     * Convert to window option
     */
    function convertToWindowOption(options) {
        return '';
    }

    /*
     * Open window based on options
     */
    function openWindow(window, options) {
    	// check input url
        if(!angular.isString(options.url)){
        	throw {
        		message: 'Impossible to open window with weburger'
        	};
        }
        var windowNative = window.open(
                options.url, 
                options.name, 
                convertToWindowOption(options), 
                options.replace);
        return new nativeWindowWrapper(windowNative);
    }

    /********************************************************************
     * 
     ********************************************************************/
    /**
     * Gets parent of the window
     * 
     * @memberof NativeWindowWrapper
     * @return parent
     */
    nativeWindowWrapper.prototype.getParent = function(){
        return this.nw.parent;
    }

    nativeWindowWrapper.prototype.getDocument = function(){
        return this.nw.document;
    }

    nativeWindowWrapper.prototype.getHeadElement = function(){
        if(this._he) {
            return this._he;
        }
        var document = this.getDocument();
        this._he = angular.element(document.getElementsByTagName('head')[0]);
        return this._he;
    };

    nativeWindowWrapper.prototype.getBodyElement = function(){
        if(this._be) {
            return this._be;
        }
        var document = this.getDocument();
        this._be = angular.element(document.getElementsByTagName('body')[0]);
        return this._be;
    };

    nativeWindowWrapper.prototype.getLocation = function(){
        return this.nw.location;
    };
    
    /**
     * Sets title of the window
     * 
     * @memberof NativeWindowWrapper
     * @params title {string} the window title
     */
    nativeWindowWrapper.prototype.setTitle = function(title){
        var document = this.getDocument();
        document.title = title;
    };

    /**
     * Sets title of the window
     * 
     * @memberof NativeWindowWrapper
     * @return {string} the window title
     */
    nativeWindowWrapper.prototype.getTitle = function(){
        var document = this.getDocument();
        return document.title;
    };


    /**
     * Sets language of the window
     * 
     */
    nativeWindowWrapper.prototype.setLanguage = function(language){
        var bodyElement = this.getBodyElement();
        bodyElement.attr('lang', language);
    };

    /**
     * Gets language of the window
     * 
     */
    nativeWindowWrapper.prototype.getLanguage = function(){
        var bodyElement = this.getBodyElement();
        return bodyElement.attr('lang');
    };


    /**
     * 
     * The open() method opens a new browser window, or a new tab, depending 
     * on your browser settings.
     * 
     * Tip: Use the close() method to close the window.
     * 
     * @memberof NativeWindowWrapper
     * @return window object
     */
    nativeWindowWrapper.prototype.open = function(url, name, options, replace){
        // check options
        options = options || {
            internal: false
        };
        options.url = url;
        options.name = name;
        options.replace = replace;
        //open
        if(options.internal){
            return openFloatPanel(this, options);
        }
        return openWindow(this.nw, options);
    };

    /**
     * Close current window
     * 
     * @memberof NativeWindowWrapper
     */
    nativeWindowWrapper.prototype.close = function(){
    	this.nw.close();
    	// TODO: maso, 2019: remove all resources
    };


    /**
     * Loads a library
     * 
     * @memberof NativeWindowWrapper
     * @path path of library
     * @return promise to load the library
     */
    nativeWindowWrapper.prototype.loadLibrary = function(path){
        if(this.libs[path]){
            return $q.resolve({
                message: 'isload'
            });
        }
        var defer = $q.defer();

        var document = this.getDocument();
        var script = document.createElement('script');
        script.src = path;
        script.async=1;
        var ctrl = this;
        script.onload = function(){
            ctrl.libs[path] = true;
            defer.resolve({
                path: path,
                message: 'loaded'
            });
            $rootScope.$digest();
        };
        script.onerror = function() {
            ctrl.libs[path] = false;
            defer.reject({
                path: path,
                message: 'fail'
            });
            $rootScope.$digest();
        };
        document.getElementsByTagName('head')[0].appendChild(script);
        return defer.promise;
    };

    /**
     * Check if the library is loaded
     * 
     * @memberof NativeWindowWrapper
     * @return true if the library is loaded
     */
    nativeWindowWrapper.prototype.isLibraryLoaded = function(path){
        if(this.libs[path]){
            return true;
        }
        return false;
    };


    /**
     * Set meta
     * 
     * @memberof NativeWindowWrapper
     * @params key {string} the key of meta
     * @params value {string} the value of meta
     */
    nativeWindowWrapper.prototype.setMeta = function (key, value){
        var searchkey = key.replace(new RegExp(':', 'g'), '\\:');
        var headElement = this.getHeadElement();
        var elements = headElement.find('meta[name='+searchkey+']');
        var metaElement;
        if(elements.length === 0){
            // title element not found
            metaElement = angular.element('<meta name=\''+key+'\' content=\'\' />');
            headElement.append(metaElement);
        } else {
            metaElement = angular.element(elements[0]);
        }
        metaElement.attr('content', value);
    };

    /**
     * Set link
     * 
     * @memberof NativeWindowWrapper
     * @params key {string} the key of meta
     * @params data {string} the value of meta
     */
    nativeWindowWrapper.prototype.setLink = function(key, data){
        var searchkey = key.replace(new RegExp(':', 'g'), '\\:');
        var headElement = this.getHeadElement();
        var elements = headElement.find('link[key='+searchkey+']');
        var metaElement;
        if(elements.length === 0){
            // title element not found
            metaElement = angular.element('<link key=\''+key+'\' />');
            headElement.append(metaElement);
        } else {
            metaElement = angular.element(elements[0]);
        }
        for (var property in data) {
            metaElement.attr(property, data[property]);
        }
    };

    
    nativeWindowWrapper.prototype.setWidth = function(width){
    	this.resizeTo(width, this.getHeight());
    };
    
    nativeWindowWrapper.prototype.getWidth = function(){
    	return this.nw.innerWidth;
    };
    
    nativeWindowWrapper.prototype.setHeight = function(){
    	this.resizeTo(this.getWidth(), height);
    };
    
    nativeWindowWrapper.prototype.getHeight = function(){
    	return this.nw.innerHeight;
    };
    
    nativeWindowWrapper.prototype.resizeTo = function(width, height) {
    	this.nw.resizeTo(width, height);
    };

    /**
     * Sets position of the window
     */
    nativeWindowWrapper.prototype.setPosition = function(x, y) {
    	this.x = x;
    	this.y = y;
    	// TODO: maso, 2019: set position of the window
    };
    
    /**
     * Gets current position of the window
     */
    nativeWindowWrapper.prototype.getPosition = function() {
    	return {
    		x: this.x,
    		y: this.y
    	};
    	// TODO: maso, 2019: set position of the window
    };

    return nativeWindowWrapper;
});

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

angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name TinymcePluginCodesample
 * @description Adding code sample to tinymce
 * 
 * 
 * ## options
 * 
 * codesample_languages: array of languages
 * 
 */
.factory('TinymcePluginCodesample', function ($resource) {
	'use strict';
	var languages;
	var defaultLanguages = [{
		text: 'HTML/XML',
		value: 'markup'
	},
	{
		text: 'JavaScript',
		value: 'javascript'
	},
	{
		text: 'CSS',
		value: 'css'
	},
	{
		text: 'PHP',
		value: 'php'
	},
	{
		text: 'Ruby',
		value: 'ruby'
	},
	{
		text: 'Python',
		value: 'python'
	},
	{
		text: 'Java',
		value: 'java'
	},
	{
		text: 'C',
		value: 'c'
	},
	{
		text: 'C#',
		value: 'csharp'
	},
	{
		text: 'C++',
		value: 'cpp'
	}];

	/*
	 * dom utils
	 */
	var tinymceDomeUtils = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

	function isCodeSample(elm) {
		return elm && elm.nodeName === 'PRE' && elm.className.indexOf('language-') !== -1;
	}

	function trimArg(predicateFn) {
		return function (arg1, arg2) {
			return predicateFn(arg2);
		};
	}

	/*
	 * Insert new code sample into the cell
	 */
	function insertCodeSample(editor, language, code, node) {
		editor.undoManager.transact(function () {
//			var node = getSelectedCodeSample(editor);
			code = tinymceDomeUtils.DOM.encode(code);
			if (node) {
				editor.dom.setAttrib(node, 'class', 'language-' + language);
				node.innerHTML = code;
				Prism.highlightElement(node);
				editor.selection.select(node);
			} else {
				editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
				editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
			}
		});
	}

	/*
	 * Add to plugin manager
	 */

	var tinymcePluginCodesample = function (editor, pluginUrl) {
		this.setEditor(editor, pluginUrl);
	};

	/**
	 * Set editor and load the plugin
	 */
	tinymcePluginCodesample.prototype.setEditor = function(editor) {
		this._editor = editor;
		languages = editor.settings.codesample_languages || defaultLanguages;
		this.setup();
		this.register();
	};

	/**
	 * Gets current editor
	 */
	tinymcePluginCodesample.prototype.getEditor = function(){
		return this._editor;
	};



	/**
	 * Setups the environments and events
	 */
	tinymcePluginCodesample.prototype.setup = function () {
		var facotry = this;
		var editor = this.getEditor();
		var $ = editor.$;
		editor.on('PreProcess', function (e) {
			$('pre[contenteditable=false]', e.node).filter(trimArg(isCodeSample)).each(function (idx, elm) {
				var $elm = $(elm), code = elm.textContent;
				$elm.attr('class', $.trim($elm.attr('class')));
				$elm.removeAttr('contentEditable');
				$elm.empty().append($('<code></code>').each(function () {
					this.textContent = code;
				}));
			});
		});
		editor.on('SetContent', function () {
			var unprocessedCodeSamples = $('pre').filter(trimArg(isCodeSample)).filter(function (idx, elm) {
				return elm.contentEditable !== 'false';
			});
			if (unprocessedCodeSamples.length) {
				editor.undoManager.transact(function () {
					unprocessedCodeSamples.each(function (idx, elm) {
						$(elm).find('br').each(function (idx, elm) {
							elm.parentNode.replaceChild(editor.getDoc().createTextNode('\n'), elm);
						});
						elm.contentEditable = false;
						elm.innerHTML = editor.dom.encode(elm.textContent);
						Prism.highlightElement(elm);
						elm.className = $.trim(elm.className);
					});
				});
			}
		});

		editor.on('dblclick', function (ev) {
			if (isCodeSample(ev.target)) {
				facotry.openEditor();
			}
		});
	};

	/**
	 * Register the plugin with the editor
	 * 
	 */
	tinymcePluginCodesample.prototype.register = function () {
		var facotry = this;
		var editor = this.getEditor();
		editor.addCommand('codesample', function () {
			var node = editor.selection.getNode();
			if (editor.selection.isCollapsed() || isCodeSample(node)) {
				facotry.openEditor();
			} else {
				editor.formatter.toggle('code');
			}
		});
		editor.addButton('codesample', {
			cmd: 'codesample',
			title: 'Insert/Edit code sample'
		});
		editor.addMenuItem('codesample', {
			cmd: 'codesample',
			text: 'Code sample',
			icon: 'codesample'
		});
	};

	/*
	 * Get selected code sample from the editor
	 */
	tinymcePluginCodesample.prototype.getSelectedCodeSample = function () {
		var editor = this.getEditor();
		var node = editor.selection.getNode();
		if (isCodeSample(node)) {
			return node;
		}
		return null;
	};

	/*
	 * Get current code.
	 * 
	 * If the code sample is empty then an empty text is returned as
	 * result.
	 */
	tinymcePluginCodesample.prototype.getCurrentCode = function () {
		var node = this.getSelectedCodeSample();
		if (node) {
			return node.textContent;
		}
		return '';
	};


	/*
	 * Gets current language of the code sampler
	 */
	tinymcePluginCodesample.prototype.getCurrentLanguage = function (editor) {
		var matches;
		var node = this.getSelectedCodeSample();
		if (node) {
			matches = node.className.match(/language-(\w+)/);
			return matches ? matches[1] : '';
		}
		return '';
	};

	/*
	 * Open editor to edit a code sample
	 */
	tinymcePluginCodesample.prototype.openEditor = function () { 
		var editor = this.getEditor();
		var node = this.getSelectedCodeSample();
		var factory = this;
		$resource.get('script', {
			data : {
				language: this.getCurrentLanguage(editor),
				languages: languages,
				// TODO: maso, 2019: get code
				code: this.getCurrentCode()
			}
		})
		.then(function(script){
			insertCodeSample(editor, script.language, script.code, node);
		});
	};


	return tinymcePluginCodesample;
});













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
angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name TinymcePluginImageToolxcx
 * @description Adding image plugin
 * 
 */
.factory('TinymcePluginImageTool', function ($resource) {
	'use strict';

	var tinymcePluginImageTool = function (editor/*, pluginUrl*/) {
		var factory = this;
		this.setEditor(editor);
		editor.addButton('image', {
			icon: 'image',
			tooltip: 'Insert/edit image',
			onclick: function(url){
				editor.insertContent('<img src="' + url + '" >');
			},
			stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
		});

		editor.addMenuItem('image', {
			icon: 'image',
			text: 'Image',
			onclick: function(){
				factory.insertImage();
			},
			context: 'insert',
			prependToContext: true
		});

		editor.addCommand('mceImage', function(){
			factory.insertImage();
		});
	}

	tinymcePluginImageTool.prototype.insertImage = function() {
		var editor = this.getEditor();
		$resource.get('image')//
		.then(function(value){
			editor.insertContent('<img src="' + value + '" >');
		});
	};
	
	tinymcePluginImageTool.prototype.setEditor = function(editor) {
		this._editor = editor;
	};
	
	tinymcePluginImageTool.prototype.getEditor = function() {
		return this._editor;
	};

	return tinymcePluginImageTool;
});













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
angular.module('am-wb-core')//

/**
 * @ngdoc Factories
 * @name TinymcePluginLink
 * @description Adding image plugin
 * 
 * 
 * ## Options
 * 
 * link_assume_external_targets: 
 * link_context_toolbar:
 * link_list:
 * default_link_target: 
 */
.factory('TinymcePluginLink', function ($resource) {
	'use strict';
	

	var attachState = {};


	var global$1 = tinymce.util.Tools.resolve('tinymce.util.VK');
	var global$2 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');
	var global$3 = tinymce.util.Tools.resolve('tinymce.Env');
	var global$4 = tinymce.util.Tools.resolve('tinymce.util.Tools');
	var global$5 = tinymce.util.Tools.resolve('tinymce.util.Delay');
	var global$6 = tinymce.util.Tools.resolve('tinymce.util.XHR');



	//-----------------------------------------------------------
	// utility
	//-----------------------------------------------------------
	var assumeExternalTargets = function (editorSettings) {
		return typeof editorSettings.link_assume_external_targets === 'boolean' ? editorSettings.link_assume_external_targets : false;
	};

	var hasContextToolbar = function (editorSettings) {
		return typeof editorSettings.link_context_toolbar === 'boolean' ? editorSettings.link_context_toolbar : false;
	};

	var getLinkList = function (editorSettings) {
		return editorSettings.link_list;
	};

	function hasDefaultLinkTarget(editorSettings) {
		return typeof editorSettings.default_link_target === 'string';
	}

	function getDefaultLinkTarget(editorSettings) {
		return editorSettings.default_link_target;
	};

	var getTargetList = function (editorSettings) {
		return editorSettings.target_list;
	};

	var setTargetList = function (editor, list) {
		editor.settings.target_list = list;
	};

	var shouldShowTargetList = function (editorSettings) {
		return getTargetList(editorSettings) !== false;
	};

	var getRelList = function (editorSettings) {
		return editorSettings.rel_list;
	};

	var hasRelList = function (editorSettings) {
		return getRelList(editorSettings) !== undefined;
	};

	var getLinkClassList = function (editorSettings) {
		return editorSettings.link_class_list;
	};

	var hasLinkClassList = function (editorSettings) {
		return getLinkClassList(editorSettings) !== undefined;
	};

	var shouldShowLinkTitle = function (editorSettings) {
		return editorSettings.link_title !== false;
	};

	var allowUnsafeLinkTarget = function (editorSettings) {
		return typeof editorSettings.allow_unsafe_link_target === 'boolean' ? editorSettings.allow_unsafe_link_target : false;
	};

	var isImageFigure = function (node) {
		return node && node.nodeName === 'FIGURE' && /\bimage\b/i.test(node.className);
	};

	var appendClickRemove = function (link, evt) {
		document.body.appendChild(link);
		link.dispatchEvent(evt);
		document.body.removeChild(link);
	};

	var isLink = function (elm) {
		return elm && elm.nodeName === 'A' && elm.href;
	};
	
	var hasLinks = function (elements) {
		return global$4.grep(elements, isLink).length > 0;
	};
	
	var getLink = function (editor, elm) {
		return editor.dom.getParent(elm, 'a[href]');
	};

	var getSelectedLink = function (editor) {
		return getLink(editor, editor.selection.getStart());
	};
	
	var getHref = function (elm) {
		var href = elm.getAttribute('data-mce-href');
		return href ? href : elm.getAttribute('href');
	};
	
	var isContextMenuVisible = function (editor) {
		var contextmenu = editor.plugins.contextmenu;
		return contextmenu ? contextmenu.isContextMenuVisible() : false;
	};
	
	var hasOnlyAltModifier = function (e) {
		return e.altKey === true && e.shiftKey === false && e.ctrlKey === false && e.metaKey === false;
	};
	
	var trimCaretContainers = function (text) {
		return text.replace(/\uFEFF/g, '');
	};


	function getAnchorElement(editor, selectedElm) {
		selectedElm = selectedElm || editor.selection.getNode();
		if (isImageFigure(selectedElm)) {
			return editor.dom.select('a[href]', selectedElm)[0];
		} else {
			return editor.dom.getParent(selectedElm, 'a[href]');
		}
	}
	
	function getAnchorText(selection, anchorElm) {
		var text = anchorElm ? anchorElm.innerText || anchorElm.textContent : selection.getContent({ format: 'text' });
		return trimCaretContainers(text);
	}
	
	function isOnlyTextSelected(html) {
		if (/</.test(html) && (!/^<a [^>]+>[^<]+<\/a>$/.test(html) || html.indexOf('href=') === -1)) {
			return false;
		}
		return true;
	}
	
	function buildListItems(inputList, itemCallback, startItems) {
		var appendItems = function (values, output) {
			output = output || [];
			angular.forEach(values, function (item) {
				var menuItem = { 
						text: item.text || item.title 
				};
				if (item.menu) {
					menuItem.menu = appendItems(item.menu);
				} else {
					menuItem.value = item.value;
					if (itemCallback) {
						itemCallback(menuItem);
					}
				}
				output.push(menuItem);
			});
			return output;
		};
		return appendItems(inputList, startItems || []);
	};
	

	var toggleTargetRules = function (rel, isUnsafe) {
		var rules = ['noopener'];
		var newRel = rel ? rel.split(/\s+/) : [];
		var toString = function (rel) {
			return global$4.trim(rel.sort().join(' '));
		};
		var addTargetRules = function (rel) {
			rel = removeTargetRules(rel);
			return rel.length ? rel.concat(rules) : rules;
		};
		var removeTargetRules = function (rel) {
			return rel.filter(function (val) {
				return global$4.inArray(rules, val) === -1;
			});
		};
		newRel = isUnsafe ? addTargetRules(newRel) : removeTargetRules(newRel);
		return newRel.length ? toString(newRel) : null;
	};

	var link = function (editor, attachState) {
		return function (data) {
			editor.undoManager.transact(function () {
				var selectedElm = editor.selection.getNode();
				var anchorElm = getAnchorElement(editor, selectedElm);
				var linkAttrs = {
						href: data.href,
						target: data.target ? data.target : null,
								rel: data.rel ? data.rel : null,
										class: data.class ? data.class : null,
												title: data.title ? data.title : null
				};
				if (!hasRelList(editor.settings) && allowUnsafeLinkTarget(editor.settings) === false) {
					linkAttrs.rel = toggleTargetRules(linkAttrs.rel, linkAttrs.target === '_blank');
				}
				if (data.href === attachState.href) {
					attachState.attach();
					attachState = {};
				}
				if (anchorElm) {
					editor.focus();
					if (data.hasOwnProperty('text')) {
						if ('innerText' in anchorElm) {
							anchorElm.innerText = data.text;
						} else {
							anchorElm.textContent = data.text;
						}
					}
					editor.dom.setAttribs(anchorElm, linkAttrs);
					editor.selection.select(anchorElm);
					editor.undoManager.add();
				} else {
					if (isImageFigure(selectedElm)) {
						linkImageFigure(editor, selectedElm, linkAttrs);
					} else if (data.hasOwnProperty('text')) {
						editor.insertContent(editor.dom.createHTML('a', linkAttrs, editor.dom.encode(data.text)));
					} else {
						editor.execCommand('mceInsertLink', false, linkAttrs);
					}
				}
			});
		};
	};
	
	var unlink = function (editor) {
		return function () {
			editor.undoManager.transact(function () {
				var node = editor.selection.getNode();
				if (isImageFigure(node)) {
					unlinkImageFigure(editor, node);
				} else {
					editor.execCommand('unlink');
				}
			});
		};
	};
	
	var unlinkImageFigure = function (editor, fig) {
		var a, img;
		img = editor.dom.select('img', fig)[0];
		if (img) {
			a = editor.dom.getParents(img, 'a[href]', fig)[0];
			if (a) {
				a.parentNode.insertBefore(img, a);
				editor.dom.remove(a);
			}
		}
	};
	var linkImageFigure = function (editor, fig, attrs) {
		var a, img;
		img = editor.dom.select('img', fig)[0];
		if (img) {
			a = editor.dom.create('a', attrs);
			img.parentNode.insertBefore(a, img);
			a.appendChild(img);
		}
	};

	var delayedConfirm = function (editor, message, callback) {
		var rng = editor.selection.getRng();
		global$5.setEditorTimeout(editor, function () {
			editor.windowManager.confirm(message, function (state) {
				editor.selection.setRng(rng);
				callback(state);
			});
		});
	};

	
	//-----------------------------------------------------------
	// Factory
	//
	//
	//-----------------------------------------------------------
	var tinymcePluginLink = function (editor/*, pluginUrl*/) {
		this.setEditor(editor);

		this.setupButtons();
		this.setupMenuItems();
		this.setupContextToolbars();
		this.setupGotoLinks();
		this.register();
	};

	tinymcePluginLink.prototype.setEditor = function(editor) {
		this._editor = editor;
	};

	tinymcePluginLink.prototype.getEditor = function() {
		return this._editor;
	};

	tinymcePluginLink.prototype.setupButtons = function () {
		var editor = this.getEditor();
		var factory = this;
		editor.addButton('link', {
			active: false,
			icon: 'link',
			tooltip: 'Insert/edit link',
			onclick: function(){
				factory.openDialog();
			},
			onpostrender: function(){
				factory.toggleActiveState();
			}
		});
		editor.addButton('unlink', {
			active: false,
			icon: 'unlink',
			tooltip: 'Remove link',
			onclick: function(){
				factory.unlink();
			},
			onpostrender: function(){
				factory.toggleActiveState();
			}
		});
		if (editor.addContextToolbar) {
			editor.addButton('openlink', {
				icon: 'newtab',
				tooltip: 'Open link',
				onclick: function () {
					gotoLink(editor, getSelectedLink(editor));
				}
			});
		}
	};

	tinymcePluginLink.prototype.setupMenuItems = function () {
		var editor = this.getEditor();
		var factory = this;
		editor.addMenuItem('openlink', {
			text: 'Open link',
			icon: 'newtab',
			onclick: function () {
				factory.gotoLink(editor, getSelectedLink(editor));
			},
			onPostRender: function () {
				var self = this;
				var toggleVisibility = function (e) {
					if (hasLinks(e.parents)) {
						self.show();
					} else {
						self.hide();
					}
				};
				if (!hasLinks(editor.dom.getParents(editor.selection.getStart()))) {
					self.hide();
				}
				editor.on('nodechange', toggleVisibility);
				self.on('remove', function () {
					editor.off('nodechange', toggleVisibility);
				});
			},
			prependToContext: true
		});
		editor.addMenuItem('link', {
			icon: 'link',
			text: 'Link',
			shortcut: 'Meta+K',
			onclick: function(){
				factory.openDialog();
			},
			stateSelector: 'a[href]',
			context: 'insert',
			prependToContext: true
		});
		editor.addMenuItem('unlink', {
			icon: 'unlink',
			text: 'Remove link',
			onclick: function(){
				factory.unlink();
			},
			stateSelector: 'a[href]'
		});
	};

	tinymcePluginLink.prototype.setupContextToolbars = function () {
		var editor = this.getEditor();
		if (editor.addContextToolbar) {
			editor.addContextToolbar(function (elm) {
				var sel, rng, node;
				if (hasContextToolbar(editor.settings) && !isContextMenuVisible(editor) && isLink(elm)) {
					sel = editor.selection;
					rng = sel.getRng();
					node = rng.startContainer;
					if (node.nodeType === 3 && sel.isCollapsed() && rng.startOffset > 0 && rng.startOffset < node.data.length) {
						return true;
					}
				}
				return false;
			}, 'openlink | link unlink');
		}
	};

	tinymcePluginLink.prototype.setupGotoLinks = function () {
		var editor = this.getEditor();
		editor.on('click', function (e) {
			var link = getLink(editor, e.target);
			if (link && global$1.metaKeyPressed(e)) {
				e.preventDefault();
				gotoLink(editor, link);
			}
		});
		editor.on('keydown', function (e) {
			var link = getSelectedLink(editor);
			if (link && e.keyCode === 13 && hasOnlyAltModifier(e)) {
				e.preventDefault();
				gotoLink(editor, link);
			}
		});
	};
	
	tinymcePluginLink.prototype.toggleActiveState = function () {
		var editor = this.getEditor();
		return function () {
			var self = this;
			editor.on('nodechange', function (e) {
				self.active(!editor.readonly && !!$_ft5004fzjm0o6bvs.getAnchorElement(editor, e.element));
			});
		};
	};
	
	tinymcePluginLink.prototype.register = function () {
		var factory = this;
		var editor = this.getEditor();
		// commands
		editor.addCommand('mceLink', function(){
			factory.openDialog();
		});
		// shortcuts
		editor.addShortcut('Meta+K', '', function(){
			factory.openDialog();
		});
	};
	

	tinymcePluginLink.prototype.openDialog = function (editor) {
		var editor = this.getEditor();
		var linkList = getLinkList(editor.settings);
		var factory = this;
		if (typeof linkList === 'string') {
			global$6.send({
				url: linkList,
				success: function (text) {
					factory.showDialog(JSON.parse(text));
				}
			});
		} else if (typeof linkList === 'function') {
			linkList(function (list) {
				factory.showDialog(list);
			});
		} else {
			factory.showDialog(linkList);
		}
	};
	
	tinymcePluginLink.prototype.unlink = function () {
		var editor = this.getEditor();
		editor.undoManager.transact(function () {
			var node = editor.selection.getNode();
			if (isImageFigure(node)) {
				unlinkImageFigure(editor, node);
			} else {
				editor.execCommand('unlink');
			}
		});
	};
	

	tinymcePluginLink.prototype.showDialog = function (linkList) {
		var editor = this.getEditor();
		var data = {};
		var selection = editor.selection;
		var dom = editor.dom;
		var anchorElm, initialText;
		
		var win, onlyText, textListCtrl, linkListCtrl, relListCtrl, targetListCtrl, classListCtrl, linkTitleCtrl, value;
		
		var linkListChangeHandler = function (e) {
			var textCtrl = win.find('#text');
			if (!textCtrl.value() || e.lastControl && textCtrl.value() === e.lastControl.text()) {
				textCtrl.value(e.control.text());
			}
			win.find('#href').value(e.control.value());
		};
		
		var buildAnchorListControl = function (url) {
			var anchorList = [];
			global$4.each(editor.dom.select('a:not([href])'), function (anchor) {
				var id = anchor.name || anchor.id;
				if (id) {
					anchorList.push({
						text: id,
						value: '#' + id,
						selected: url.indexOf('#' + id) !== -1
					});
				}
			});
			if (anchorList.length) {
				anchorList.unshift({
					text: 'None',
					value: ''
				});
				return {
					name: 'anchor',
					type: 'listbox',
					label: 'Anchors',
					values: anchorList,
					onselect: linkListChangeHandler
				};
			}
		};
		
		var updateText = function () {
			if (!initialText && onlyText && !data.text) {
				this.parent().parent().find('#text')[0].value(this.value());
			}
		};
		
		var urlChange = function (e) {
			var meta = e.meta || {};
			if (linkListCtrl) {
				linkListCtrl.value(editor.convertURL(this.value(), 'href'));
			}
			global$4.each(e.meta, function (value, key) {
				var inp = win.find('#' + key);
				if (key === 'text') {
					if (initialText.length === 0) {
						inp.value(value);
						data.text = value;
					}
				} else {
					inp.value(value);
				}
			});
			if (meta.attach) {
				attachState = {
						href: this.value(),
						attach: meta.attach
				};
			}
			if (!meta.text) {
				updateText.call(this);
			}
		};
		
		var onBeforeCall = function (e) {
			e.meta = win.toJSON();
		};
		
		onlyText = isOnlyTextSelected(selection.getContent());
		anchorElm = getAnchorElement(editor);
		data.text = initialText = getAnchorText(editor.selection, anchorElm);
		data.href = anchorElm ? dom.getAttrib(anchorElm, 'href') : '';
		if (anchorElm) {
			data.target = dom.getAttrib(anchorElm, 'target');
		} else if (hasDefaultLinkTarget(editor.settings)) {
			data.target = getDefaultLinkTarget(editor.settings);
		}
		if (value = dom.getAttrib(anchorElm, 'rel')) {
			data.rel = value;
		}
		if (value = dom.getAttrib(anchorElm, 'class')) {
			data.class = value;
		}
		if (value = dom.getAttrib(anchorElm, 'title')) {
			data.title = value;
		}
		if (onlyText) {
			textListCtrl = {
					name: 'text',
					type: 'textbox',
					size: 40,
					label: 'Text to display',
					onchange: function () {
						data.text = this.value();
					}
			};
		}
		if (linkList) {
			linkListCtrl = {
					type: 'listbox',
					label: 'Link list',
					values: buildListItems(linkList, function (item) {
						item.value = editor.convertURL(item.value || item.url, 'href');
					}, [{
						text: 'None',
						value: ''
					}]),
					onselect: linkListChangeHandler,
					value: editor.convertURL(data.href, 'href'),
					onPostRender: function () {
						linkListCtrl = this;
					}
			};
		}
		if (shouldShowTargetList(editor.settings)) {
			if (getTargetList(editor.settings) === undefined) {
				setTargetList(editor, [{
						text: 'None',
						value: ''
					},{
						text: 'New window',
						value: '_blank'
					}]);
			}
			targetListCtrl = {
					name: 'target',
					type: 'listbox',
					label: 'Target',
					values: buildListItems(getTargetList(editor.settings))
			};
		}
		if (hasRelList(editor.settings)) {
			relListCtrl = {
					name: 'rel',
					type: 'listbox',
					label: 'Rel',
					values: buildListItems(getRelList(editor.settings), function (item) {
						if (allowUnsafeLinkTarget(editor.settings) === false) {
							item.value = toggleTargetRules(item.value, data.target === '_blank');
						}
					})
			};
		}
		if (hasLinkClassList(editor.settings)) {
			classListCtrl = {
					name: 'class',
					type: 'listbox',
					label: 'Class',
					values: buildListItems(getLinkClassList(editor.settings), function (item) {
						if (item.value) {
							item.textStyle = function () {
								return editor.formatter.getCssText({
									inline: 'a',
									classes: [item.value]
								});
							};
						}
					})
			};
		}
		if (shouldShowLinkTitle(editor.settings)) {
			linkTitleCtrl = {
					name: 'title',
					type: 'textbox',
					label: 'Title',
					value: data.title
			};
		}
		win = editor.windowManager.open({
			title: 'Insert link',
			data: data,
			body: [
				{
					name: 'href',
					type: 'filepicker',
					filetype: 'file',
					size: 40,
					autofocus: true,
					label: 'Url',
					onchange: urlChange,
					onkeyup: updateText,
					onpaste: updateText,
					onbeforecall: onBeforeCall
				},
				textListCtrl,
				linkTitleCtrl,
				buildAnchorListControl(data.href),
				linkListCtrl,
				relListCtrl,
				targetListCtrl,
				classListCtrl
				],
				onSubmit: function (e) {
					var assumeExternalTargetsResult = assumeExternalTargets(editor.settings);
					var insertLink = link(editor, attachState);
					var removeLink = unlink(editor);
					var resultData = global$4.extend({}, data, e.data);
					var href = resultData.href;
					if (!href) {
						removeLink();
						return;
					}
					if (!onlyText || resultData.text === initialText) {
						delete resultData.text;
					}
					if (href.indexOf('@') > 0 && href.indexOf('//') === -1 && href.indexOf('mailto:') === -1) {
						delayedConfirm(editor, 'The URL you entered seems to be an email address. Do you want to add the required mailto: prefix?', function (state) {
							if (state) {
								resultData.href = 'mailto:' + href;
							}
							insertLink(resultData);
						});
						return;
					}
					if (assumeExternalTargetsResult === true && !/^\w+:/i.test(href) || assumeExternalTargetsResult === false && /^\s*www[\.|\d\.]/i.test(href)) {
						delayedConfirm(editor, 'The URL you entered seems to be an external link. Do you want to add the required http:// prefix?', function (state) {
							if (state) {
								resultData.href = 'http://' + href;
							}
							insertLink(resultData);
						});
						return;
					}
					insertLink(resultData);
				}
		});
	};
	


	var gotoLink = function (a) {
		var editor = this.getEditor();
		if (a) {
			var href = getHref(a);
			if (/^#/.test(href)) {
				var targetEl = editor.$(href);
				if (targetEl.length) {
					editor.selection.scrollIntoView(targetEl[0], true);
				}
			} else {
				var url = a.href;
				if (!global$3.ie || global$3.ie > 10) {
					var link = document.createElement('a');
					link.target = '_blank';
					link.href = url;
					link.rel = 'noreferrer noopener';
					var evt = document.createEvent('MouseEvents');
					evt.initMouseEvent('click', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
					appendClickRemove(link, evt);
				} else {
					var win = window.open('', '_blank');
					if (win) {
						win.opener = null;
						var doc = win.document;
						doc.open();
						doc.write('<meta http-equiv="refresh" content="0; url=' + global$2.DOM.encode(url) + '">');
						doc.close();
					}
				}
			}
		}
	};

	return tinymcePluginLink;
});











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
.factory('AbstractWidgetLocator', function ($rootElement, $widget) {

    /**
     * Creates new instance of the widget locator
     * 
     * @memberof AbstractWidgetLocator
     */
    function abstractWidgetLocator() {
        this.callbacks = [];
        this.elements = [];
        this.observedWidgets = [];

        // Creates listeners
        var ctrl = this;
        this.widgetListeners = {
                'select' : function ($event) {
                    ctrl.addClass('selected');
                    ctrl.removeClass('mouseover');
                },
                'unselect' : function ($event) {
                    ctrl.removeClass('selected');
                    if (ctrl.mouseover) {
                        ctrl.addClass('mouseover');
                    }
                },
                'mouseover' : function ($event) {
                    ctrl.addClass('mouseover');
                    ctrl.mouseover = true;
                },
                'mouseout' : function ($event) {
                    ctrl.removeClass('mouseover');
                    ctrl.mouseover = false;
                },
        };
    }

    /**
     * Defines anchor 
     */
    abstractWidgetLocator.prototype.setAnchor = function (anchor) {
        this.anchor = anchor;
    };

    /**
     * Update the view
     */
    abstractWidgetLocator.prototype.setAnchor = function (anchor) {
        this.anchor = anchor;
    };

    abstractWidgetLocator.prototype.getAnchor = function (auncher) {
        // find custom anchor
        if(this.anchor){
            if(angular.isFunction(this.anchor)){
                return this.anchor();
            }
            if(angular.isString(this.anchor)){
                var list = $rootElement.find(this.anchor);
                if(list){
                    return list[0];
                }
            }
        }
        // find parent
        var widget = this.getWidget();
        if(widget && widget.getParent()){
            return widget.getParent().getElement();
        }
        // return root
        return $rootElement;
    };


    /**
     * Sets new widget
     */
    abstractWidgetLocator.prototype.setWidget = function (widget) {
        this.widget = widget;
    };

    abstractWidgetLocator.prototype.getWidget = function () {
        return this.widget;
    };

    abstractWidgetLocator.prototype.setElements = function (elements) {
        this.elements = elements;
    };

    abstractWidgetLocator.prototype.getElements = function () {
        return this.elements;
    };

    abstractWidgetLocator.prototype.addClass = function (value) {
        var elements = this.getElements();
        for (var i = 0; i < elements.length; i++) {
            elements[i].addClass(value);
        }
    };

    abstractWidgetLocator.prototype.removeClass = function (value) {
        var elements = this.getElements();
        for (var i = 0; i < elements.length; i++) {
            elements[i].removeClass(value);
        }
    };

    /**
     * Remove connection the the current widget
     */
    abstractWidgetLocator.prototype.disconnect = function () {
        this.connect(null);
        this.connected = false;
    };

    abstractWidgetLocator.prototype.connect = function (widget) {
        this.connected = true;
        if (this.widget !==  widget) {
            var elements = this.getElements();
            if(this.widget){
                var oldWidget = this.widget;
                angular.forEach(this.widgetListeners, function (listener, type) {
                    oldWidget.off(type, listener);
                });
                for (var i = 0; i < elements.length; i++) {
                    elements[i].detach();
                }
            }
            this.setWidget(widget);
            if(widget){
                angular.forEach(this.widgetListeners, function (listener, type) {
                    widget.on(type, listener);
                });
                var anchor = this.getAnchor();
                angular.forEach(elements, function (element) {
                    anchor.append(element);
                });
            }
        }
        if(this.getWidget()){
            this.updateView();
        }
    };


    abstractWidgetLocator.prototype.isConnected = function () {
        return this.connected;
    };

    return abstractWidgetLocator;
});

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
 * @name BoundWidgetLocator
 * @description Locates a widget bound
 * 
 */
.factory('BoundWidgetLocator', function (AbstractWidgetLocator, $rootScope) {

	var boundWidgetLocator = function (options) {
		options = options || {};
		AbstractWidgetLocator.apply(this, options);

        // set anchor
        this.setAnchor(options.anchor);

		// load templates
		var template = options.template 
		|| '<div class="wb-widget-locator bound"></div>';

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
	};
	boundWidgetLocator.prototype = new AbstractWidgetLocator();

	boundWidgetLocator.prototype.updateView = function () {
        var widget = this.getWidget();
	    var bound = widget.getBoundingClientRect();
	    var space = 2;
		this.topElement.css({
			top: bound.top + space,
			left: bound.left + space,
			width: bound.width - 2*space
		});
		this.rightElement.css({
			top: bound.top + space,
			left: bound.left + bound.width - 2*space,
			height: bound.height - 2*space
		});
		this.buttomElement.css({
			top: bound.top + bound.height - space,
			left: bound.left + space,
			width: bound.width - 2*space
		});
		this.leftElement.css({
			top: bound.top + space,
			left: bound.left + space,
			height: bound.height - 2*space
		});

	};
	return boundWidgetLocator;
});

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

angular
.module('am-wb-core')


/**
 * @ngdoc Factories
 * @name CursorWidgetLocator
 * @description Manages list of locators
 * 
 * 
 * There are two type of widgets locator: selection and bound.
 * 
 * For each widget a bound locator will be created.
 * 
 * For each item in selection a selection locator will be created.
 */
.factory('WidgetLocatorManager',function ($widget, BoundWidgetLocator, SelectionWidgetLocator, $timeout) {

	/**
	 * Creates new instance of the manager
	 * 
	 * @memberof CursorWidgetLocator
	 */
	function WidgetLocatorManager(options) {
		var ctrl = this;

		this.intersectingWidget = [];
		this.selectedWidgets = [];

		this.boundLocatorMap = new Map();
		this.boundLocatorTrash = [];

		this.selectionLocatorMap = new Map();
		this.selectionLocatorTrash = [];


		// selection options
		this.selectionLocatorOption = options.selectionLocatorOption || {};
		this.selectionEnable = true;
		if (angular.isDefined(options.selectionEnable)) {
			this.selectionEnable = options.selectionEnable;
		}

		// bound options
		this.boundLocatorOption = options.boundLocatorOption || {};
		this.boundEnable = true;
		if (angular.isDefined(options.boundEnable)) {
			this.boundEnable = options.boundEnable;
		}

		this.widgetListeners = {
				'intersection' : function ($event) {
					var widget = $event.source;
					ctrl.widgetIntersectingChange(widget);
				},
				'resize': function($event){
					ctrl.updateLocators();
				},
				'loaded': function($event){
					var widget = $event.source;
					var children = $widget.getChildren(widget);
					for(var i = 0; i < children.length; i++){
						ctrl.widgetAdded(children[i]);
					}
				},
				'newchild': function($event) {
					var widget = $event.widget;
					ctrl.widgetAdded(widget);
				},
				'delete': function($event) {
					var widget = $event.source;
					ctrl.widgetDeleted(widget);
				},
				'modelUpdated': function($event) {
					ctrl.updateLocators();
				}
		};
	}


	WidgetLocatorManager.prototype.widgetDeleted = function(widget){
		// events
		angular.forEach(this.widgetListeners, function (callback, type) {
			widget.off(type, callback);
		});
		// locator
		var locator = this.getBoundLocatorOf(widget);
		locator.disconnect();
		this.boundLocatorMap.delete(widget);
		this.boundLocatorTrash.push(locator);

		// selection
		var index = this.selectedWidgets.indexOf(widget);
		if(index > -1){
			this.selectedWidgets.splice(index, 1);
			var selectionLocator = this.getSelectionLocatorOf(widget);
			selectionLocator.disconnect(widget);
			this.selectionLocatorMap.delete(widget);
			this.selectionLocatorTrash.push(selectionLocator);
		}
		// intersection
		index = this.intersectingWidget.indexOf(widget);
		if(index > -1){
			this.intersectingWidget.splice(index, 1);
		}
		// update view
		this.updateLocators();
	};

	WidgetLocatorManager.prototype.widgetAdded = function(widget){
		// add events
		angular.forEach(this.widgetListeners, function (callback, type) {
			widget.on(type, callback);
		});

		// update view
		$timeout(function(){
			widget.setIntersecting(true,{
				message: 'Load child in model'
			});
		}, 100);
	};

	/**
	 * Sets visibility of locators
	 * 
	 * @param visible
	 *            {boolean} defines the visibility of the
	 *            locators
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.setVisible = function (visible) {
		if (this.visible === visible) {
			return;
		}
		this.visible = visible;
		this.updateLocators();
	}

	/**
	 * Checks if the manager is in visible state
	 * 
	 * @return true if the manager is visible.
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.isVisible = function () {
		return this.visible;
	};


	WidgetLocatorManager.prototype.setEnable = function (enable) {
		if (this.enable === enable) {
			return;
		}
		this.enable = enable;

		var widgets = $widget.getChildren(this.getRootWidget());
		var intersectingWidget = [];
		// listeners
		for(var i = 0; i < widgets.length; i ++){
			var widget = widgets[i];
			if(widget.isIntersecting()){
				intersectingWidget.push(widget);
			}
			if(enable) {
				angular.forEach(this.widgetListeners, function (callback, type) {
					widget.on(type, callback);
				});
			} else {
				angular.forEach(this.widgetListeners, function (callback, type) {
					widget.off(type, callback);
				});
			}
		}
		// bound
		if(intersectingWidget.length) {
			this.intersectingWidget = intersectingWidget;
		} else {
			this.intersectingWidget = widgets;
		}
		for(var j = 0; j < intersectingWidget.length; j++){
			var locator = this.getBoundLocatorOf(intersectingWidget[j]);
			if(enable) {
				locator.connect(intersectingWidget[j]);
			} else {
				locator.disconnect();
			}
		}
		// XXX: maso, selection

		// ROOT
		var rootWidget = this.getRootWidget();
		if(enable) {
			angular.forEach(this.widgetListeners, function (callback, type) {
				rootWidget.on(type, callback);
			});
		} else {
			angular.forEach(this.widgetListeners, function (callback, type) {
				rootWidget.off(type, callback);
			});
		}

	};

	WidgetLocatorManager.prototype.isEnable = function () {
		return this.enable;
	};

	/**
	 * Sets widgets which are selected
	 * 
	 * @param widgets
	 *            {WbWidgetCtr} which are selected
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.setSelectedWidgets = function (widgets) {
		if(!this.isEnable()){
			return;
		}
		if(!angular.isArray(widgets)){
			widgets = [];
		}

		// remove old
		for(var i = 0; i < this.selectedWidgets.length; i++){
			var widget = this.selectedWidgets[i];
			if(widgets.indexOf(widget) < 0){
				var locator = this.getSelectionLocatorOf(widget);
				this.selectionLocatorTrash.push(locator);
				this.selectionLocatorMap.delete(widget);
				locator.disconnect();
			}
		}

		this.selectedWidgets = widgets;
		if(this.isEnable()){
			this.updateLocators();
		}
	};

	/**
	 * Gets selected widgets
	 * 
	 * @return widgets
	 * @memberof CursorWidgetLocator
	 */
	WidgetLocatorManager.prototype.getSelectedWidgets = function () {
		return this.selectedWidgets;
	};

	WidgetLocatorManager.prototype.isWidgetSelected = function(widget){
		return this.selectedWidgets.indexOf(widget) >= 0;
	};

	/**
	 * Sets the root widget
	 * 
	 * @param rootWidget
	 *            {WbWidgetCtrl} root widget
	 * @memberof WidgetLocatorManager
	 */
	WidgetLocatorManager.prototype.setRootWidget = function (rootWidget) {
		if(this.rootWidget) {
			this.destroy();
		}
		this.rootWidget = rootWidget;
		if(this.rootWidget && this.isEnable()) {
			angular.forEach(this.widgetListeners, function (callback, type) {
				rootWidget.on(type, callback);
			});
		}
		if (this.isEnable()) {
			this.updateLocators();
		}
	};

	/**
	 * Gets the root widget
	 * 
	 * @return the root widget
	 * @memberof WidgetLocatorManager
	 */
	WidgetLocatorManager.prototype.getRootWidget = function () {
		return this.rootWidget;
	};

	WidgetLocatorManager.prototype.directUpdateLocator = function(locator, widget) {
		try{
			if(this.isVisible()){
				locator.connect(widget);
			} else {
				locator.disconnect();
			}
		} catch(ex){
			console.error(ex, 'Fail to update the locator');
		}
	};

	/**
	 * Update all locators
	 * 
	 * @memberof WidgetLocatorManager
	 */
	WidgetLocatorManager.prototype.updateLocators = function () {
		if(!angular.isFunction(this.debounceUpdate)){
			this.debounceUpdate = $widget.debounce(function(){
				var widgets = this.getIntersectingWidgets();
				for(var i = 0; i < widgets.length; i++){
					var widget = widgets[i];

					// update bound
					this.directUpdateLocator(this.getBoundLocatorOf(widget), widget);

					// update selection
					if(this.isWidgetSelected(widget)){
						this.directUpdateLocator(this.getSelectionLocatorOf(widget), widget);
					}
				}
			}, 300, false);
		}
		this.debounceUpdate();
	};


	WidgetLocatorManager.prototype.getIntersectingWidgets = function(){
		return this.intersectingWidget;
	}

	WidgetLocatorManager.prototype.widgetIntersectingChange = function(widget){
		if(widget.isRoot() || !this.isVisible()){
			return;
		}
		var index = this.intersectingWidget.indexOf(widget);
		var locator = this.getBoundLocatorOf(widget);
		// widget intersects with view
		if(widget.isIntersecting()){
			locator.connect(widget);
			if(index < 0){
				this.intersectingWidget.push(widget);
				this.updateLocators();
			}
		} else {
			locator.disconnect();
			// widget is out of view
			if(index >= 0){
				this.intersectingWidget.splice(index, 1);
				this.updateLocators();
			}
		}
	}

	WidgetLocatorManager.prototype.getBoundLocatorOf = function (widget) {
		var map = this.boundLocatorMap;
		if(!map.has(widget)) {
			var locator;
			if(this.boundLocatorTrash.length > 0){
				locator = this.boundLocatorTrash.pop();
			} else {
				locator = new BoundWidgetLocator(this.boundLocatorOption);
			}
			map.set(widget, locator);
		}
		return map.get(widget);
	};

	WidgetLocatorManager.prototype.getSelectionLocatorOf = function(widget) {
		var map = this.selectionLocatorMap;
		if(!map.has(widget)) {
			var locator;
			if(this.selectionLocatorTrash.length > 0){
				locator = this.selectionLocatorTrash.pop();
			} else {
				locator = new SelectionWidgetLocator(this.selectionLocatorOption);
			}
			map.set(widget, locator);
		}
		return map.get(widget);
	};



	return WidgetLocatorManager;
});
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
.factory('SelectionWidgetLocator', function (AbstractWidgetLocator, $document) {

    var selectionWidgetLocator = function (options) {
        options = options || {};
        AbstractWidgetLocator.apply(this, options);

        // set anchor
        this.setAnchor(options.anchor);

        // load templates
        var template = options.template
        || '<div class="wb-widget-locator selection"></div>';

        this.titleElement = angular.element(template);
        this.titleElement.attr('id', 'header');

        // load elements
        this.topElement = angular.element(template);
        this.topElement.attr('id', 'top');

        this.rightElement = angular.element(template);
        this.rightElement.attr('id', 'right');

        this.buttomElement = angular.element(template);
        this.buttomElement.attr('id', 'buttom');

        this.leftElement = angular.element(template);
        this.leftElement.attr('id', 'left');

        this.sizeElement = angular.element('<img class="wb-widget-locator selection" src="resources/corner-handle.png">');
        this.sizeElement.attr('id', 'size');

        // init controller
        this.setElements([this.titleElement, this.topElement, this.rightElement,
            this.buttomElement, this.leftElement, this.sizeElement]);
        
        
        
        var position = {};
        var lock = false;
        var dimension = {};
        var ctrl = this;
        

        function mousemove($event) {
            var deltaWidth = dimension.width - (position.x - $event.clientX);
            var deltaHeight = dimension.height - (position.y - $event.clientY);
            var newDimensions = {
                    width: deltaWidth + 'px',
                    height: deltaHeight + 'px'
            };
            
            var widget = ctrl.getWidget();
            var model = widget.getModel();
            var $element = widget.getElement();
            var $scope = widget.getScope();
            
            if (model.style.size.height === 'auto') {
                newDimensions.height = 'auto';
            }
            $element.css(newDimensions);
            
            model.style.size.width = newDimensions.width;
            model.style.size.height = newDimensions.height;

            $scope.$apply();
            return false;
        }

        function mouseup() {
            $document.unbind('mousemove', mousemove);
            $document.unbind('mouseup', mouseup);
            lock = false;
        }

        function mousedown($event) {
            $event.stopImmediatePropagation();
            position.x = $event.clientX;
            position.y = $event.clientY;
            lock = true;
            var $element = ctrl.getWidget().getElement();
            dimension.width = $element.prop('offsetWidth');
            dimension.height = $element.prop('offsetHeight');
            $document.bind('mousemove', mousemove);
            $document.bind('mouseup', mouseup);
            return false;
        }


        this.sizeElement.on('mousedown', mousedown);
    };
    selectionWidgetLocator.prototype = new AbstractWidgetLocator();

    selectionWidgetLocator.prototype.updateView = function () {
        var widget = this.getWidget();
        var bound = widget.getBoundingClientRect();
        var space = 2;
        this.topElement.css({
            top: bound.top + space,
            left: bound.left + space,
            width: bound.width - 2*space
        });
        this.rightElement.css({
            top: bound.top + space,
            left: bound.left + bound.width - 2*space,
            height: bound.height - 2*space
        });
        this.buttomElement.css({
            top: bound.top + bound.height - space,
            left: bound.left + space,
            width: bound.width - 2*space
        });
        this.leftElement.css({
            top: bound.top + space,
            left: bound.left + space,
            height: bound.height - 2*space
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
        var widget = this.getWidget();
        this.titleElement[0].innerHTML = '<span>'+ (widget.getTitle() || widget.getId() || widget.getType()) + '</span>'
        
        
        this.sizeElement.css({

            top: bound.top + bound.height -13 ,
            left: bound.left + bound.width -15 ,

        })
    };
    return selectionWidgetLocator;
});


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

angular.module('am-wb-core')

/**
 * @ngdoc Filters
 * @name wbmd5
 * @function
 * @description Hash the input
 * 
 * @example 
 ```html 
 <span>{{ 'text to hash' | wbmd5 }}</span> 
 ```
 */
.filter('wbmd5', function ($wbCrypto) {
    return function (val) {
        return $wbCrypto.md5(val+'');
    };
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Filters
 * @name wbunsafe
 * @description # unsafe Filter
 */
.filter('wbunsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});

/*
 * angular-material-icons v0.7.1
 * (c) 2014 Klar Systems
 * License: MIT
 */

/* jshint -W097, -W101 */

angular.module('ngMdIcons', [])
.provider('wbIconService', function () {
	'use strict';
	var provider, service;

	var shapes = {};
	var viewBoxes = {};
	var size = 24;

	service = {
			getShape : getShape,
			getShapes: getShapes,
			getViewBox : getViewBox,
			getViewBoxes: getViewBoxes,
			getSize: getSize,
			setShape : addShape,
			setShapes: addShapes,
			setViewBox : addViewBox,
			setViewBoxes: addViewBoxes,
			setSize: setSize,
			addShape : addShape,
			addShapes: addShapes,
			addViewBox : addViewBox,
			addViewBoxes: addViewBoxes
	};

	provider = {
			$get     : wbIconServiceFactory,
			getShape : getShape,
			getShapes: getShapes,
			getViewBox : getViewBox,
			getViewBoxes: getViewBoxes,
			getSize: getSize,
			setShape : addShape,
			setShapes: addShapes,
			setViewBox : addViewBox,
			setViewBoxes: addViewBoxes,
			setSize: setSize,
			addShape : addShape,
			addShapes: addShapes,
			addViewBox : addViewBox,
			addViewBoxes: addViewBoxes
	};

	return provider;

	function addShape(name, shape) {
		shapes[name] = shape;

		return provider; // chainable function
	}

	function addShapes(newShapes) {
		shapes = angular.extend(shapes, newShapes);

		return provider; // chainable function
	}

	function addViewBox(name, viewBox) {
		viewBoxes[name] = viewBox;

		return provider; // chainable function
	}

	function addViewBoxes(newViewBoxes) {
		viewBoxes = angular.extend(viewBoxes, newViewBoxes);

		return provider; // chainable function
	}

	function getShape(name) {
		return shapes[name] || shapes['help'];
	}

	function getShapes() {
		return shapes;
	}

	function getViewBox(name) {
		return viewBoxes[name] || '0 0 24 24';
	}

	function getViewBoxes() {
		return viewBoxes;
	}
	
	function setSize(newSize) {
		size = newSize || 24;
	}

	function getSize() {
		return size;
	}

	function wbIconServiceFactory() {
		return service;
	}
});

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

angular.module('am-wb-core')

/**
 * Load default resources
 */
.run(function($resource) {
	$resource.newPage({
		type : 'wb-url',
		icon: 'link',
		label : 'URL',
		templateUrl : 'views/resources/wb-url.html',
		/*
		 * @ngInject
		 */
		controller : function($scope) {
			$scope.$watch('value', function(value) {
				$scope.$parent.setValue(value);
			});
		},
		controllerAs: 'ctrl',
		tags : [ 'file', 'image', 'vedio', 'audio', 'page', 'url','link']
	});
	$resource.newPage({
		type : 'wb-sheet',
		icon : 'border_all',
		label : 'Sheet',
		templateUrl : 'views/resources/wb-sheet.html',
		/*
		 * @ngInject
		 */
		controller : function($scope) {
			$scope.$watch('value', function(value) {
				if (angular.isDefined(value)) {
					$scope.$parent.setValue(value);
				} else {
					$scope.$parent.setValue({
						'key' : 'value',
						'values' : [ [ 1, 2 ], [ 1, 2 ] ]
					});
				}
			}, true);
		},
		controllerAs: 'ctrl',
		tags : [ 'data' ]
	});


	$resource.newPage({
		type : 'script',
		icon : 'script',
		label : 'Script',
		templateUrl : 'views/resources/wb-event-code-editor.html',
		/*
		 * @ngInject
		 */
		controller : function($scope, $wbLibs, $element) {
			var ctrl = this;
			this.value = $scope.value || {
				code: '',
				language: 'javascript',
				languages: [{
					text: 'HTML/XML',
					value: 'markup'
				},
				{
					text: 'JavaScript',
					value: 'javascript'
				},
				{
					text: 'CSS',
					value: 'css'
				}]
			};
			this.setCode = function(code) {
				this.value.code = code;
				$scope.$parent.setValue(this.value);
			};
			
			this.setLanguage = function(language){
				this.value.code = language;
				$scope.$parent.setValue(this.value);
			};
			
			this.setEditor = function(editor) {
				this.editor = editor;
				editor.setOptions({
					enableBasicAutocompletion: true, 
					enableLiveAutocompletion: true, 
					showPrintMargin: false, 
					maxLines: Infinity,
					fontSize: '100%'
				});
				$scope.editor = editor;
//				editor.setTheme('resources/libs/ace/theme/chrome');
//				editor.session.setMode('resources/libs/ace/mode/javascript');
				editor.setValue(ctrl.value.code || '');
				editor.on("change", function(){
					ctrl.setCode(editor.getValue());
				});
			};
			

			var ctrl = this;
			$wbLibs.load('resources/libs/ace.js')
			.then(function(){
				ctrl.setEditor(ace.edit($element.find('div#am-wb-resources-script-editor')[0]));
			});
		},
		controllerAs: 'ctrl',
		tags : [ 'code', 'script']
	});
});

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

angular.module('am-wb-core')

/**
 * Load widgets
 */
.run(function ($settings) {
	// utilities
	function setAllDim(dim, val) {
		dim.top = val;
		dim.right = val;
		dim.bottom = val;
		dim.left = val;
	}

	function createDimeStr(dim) {
		var output =
			dim.top + ' ' +
			dim.right + ' ' +
			dim.bottom + ' ' +
			dim.left;
		return output;
	}


	/*
	 * splite margin/padding to its components
	 * check different state Based on CSS rules. see for example:
	 * https://www.w3schools.com/cssref/pr_margin.asp
	 * https://www.w3schools.com/cssref/pr_padding.asp
	 */
	function fillDimFromString(dim, str) {
		str = str || '';
		var dimAll;
		var dimsArray = str.split(' ');

		// 0px is selected
		if (dimsArray.length === 1) {
			dimAll = str;
		}

		//All 4 items is equal
		else if (dimsArray.length === 4 && _.uniq(dimsArray).length === 1) {
			dimAll = dimsArray[0];
		}

		//Items are 4 and different
		else if (dimsArray.length === 4 && _.uniq(dimsArray).length > 1) {
			dim.top = dimsArray[0];
			dim.right = dimsArray[1];
			dim.bottom = dimsArray[2];
			dim.left = dimsArray[3];
		}

		//Items are 3
		else if (dimsArray.length === 3) {
			dim.top = dimsArray[0];
			dim.right = dimsArray[1];
			dim.left = dimsArray[1];
			dim.bottom = dimsArray[2];
		}

		//Items are 2
		else if (dimsArray.length === 2) {
			dim.top = dimsArray[0];
			dim.bottom = dimsArray[0];
			dim.right = dimsArray[1];
			dim.left = dimsArray[1];
		}

		//Items are 1
		else if (dimsArray.length === 1) {
			dim.top = dimsArray[0];
			dim.right = dimsArray[0];
			dim.bottom = dimsArray[0];
			dim.left = dimsArray[0];
		}

		//All items are undefined. In this case default value is 0px.
		else if (!dimsArray.length) {
			dimAll = '0px';
		}

		// check dimAll
		if (dimAll) {
			setAllDim(dim, dimAll);
		}
	}

	function setAllCorner(dim, val) {
		dim.topLeft = val;
		dim.topRight = val;
		dim.bottomRight = val;
		dim.bottomLeft = val;
	}

	function createCornerStr(dim) {
		return dim.topLeft + ' ' + dim.topRight + ' ' + dim.bottomRight + ' ' + dim.bottomLeft;
	}

	/*
	 * splite 'radius' to its components
	 * check different state Based on CSS rules. see for example:
	 * https://www.w3schools.com/CSSref/css3_pr_border-radius.asp
	 */
	function fillCornerFromString(dim, str) {
		var newDom = {};
		fillDimFromString(newDom, str);

		dim.topLeft = newDom.topLeft;
		dim.topRight = newDom.topRight;
		dim.bottomRight = newDom.bottomRight;
		dim.bottomLeft = newDom.bottomLeft;
	}

	$settings.newPage({
		type: 'general',
		label: 'General',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-general.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function () {
			// TODO: maso, 2019: move to the view
			this.cursors = [{
				title: 'Alias',
				value: 'alias'
			}, {
				title: 'All scroll',
				value: 'all-scroll'
			}, {
				title: 'Auto',
				value: 'auto'
			}, {
				title: 'Cell',
				value: 'cell'
			}, {
				title: 'Context menu',
				value: 'context-menu'
			}, {
				title: 'Col resize',
				value: 'col-resize'
			}, {
				title: 'Copy',
				value: 'copy'
			}, {
				title: 'Default',
				value: 'default'
			}, {
				title: 'Grab',
				value: 'grab'
			}, {
				title: 'Pointer',
				value: 'pointer'
			}, {
				title: 'Move',
				value: 'move'
			}];

			this.init = function () {
				this.direction = this.getStyle('direction') || 'ltr';
				this.color = this.getStyle('color');

				this.cursor = this.getStyle('cursor');

				this.visibility = this.getStyle('visibility') || 'visible';
				this.opacity = this.getStyle('opacity');

				// overflow
				this.overflowX = this.getStyle('overflow.x') || 'visible';
				this.overflowY = this.getStyle('overflow.y') || 'visible';
			};

			this.updateOverflowX = function () {
				this.setStyle('overflow.x', this.overflowX);
			};
			this.updateOverflowY = function () {
				this.setStyle('overflow.y', this.overflowY);
			};
		}
	});

	$settings.newPage({
		type: 'background',
		label: 'Background',
		icon: 'image',
		description: '',
		templateUrl: 'views/settings/wb-background.html',
		controllerAs: 'ctrl',

		/*
		 * @ngInject
		 * @description This controller controls the background attribute. If the user choose an image for 
		 * the background then sets a default values to the background property. These values are used to show 
		 * the image in a suitable form; and if the user remove the background image then remove those values 
		 * from the background.
		 */
		controller: function () {
			this.init = function (newWidget, oldWidget) {
				this.image = this.getStyleBackground('image');
				this.color = this.getStyleBackground('color');
				this.size = this.getStyleBackground('size');
				this.repeat = this.getStyleBackground('repeat');
				this.position = this.getStyleBackground('position');
			};

			this.setBackgroundImage = function (image) {
				this.image = image;
				if (!this.size) {
					this.size = 'cover';
				}
				if (!this.repeat) {
					this.repeat = 'no-repeat';
				}
				if (!this.position) {
					this.position = 'center center';
				}
				this.updateBackground();
			};

			this.updateBackground = function () {
				this.setStyleBackground('image', this.image);
				this.setStyleBackground('color', this.color);
				this.setStyleBackground('size', this.size);
				this.setStyleBackground('repeat', this.image);
				this.setStyleBackground('position', this.position);
			};
		}
	});

	$settings.newPage({
		type: 'SEO',
		label: 'SEO',
		templateUrl: 'views/settings/wb-seo.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function ($translate) {
			/*
			 * Supported Schema Types:
			 * Article, Book, Image, Person, Product, Service, Text, Thing, WebPage
			 */
			this.schemaTypes = [
				{
					key: 'Article',
					value: 'http://schema.org/Article'

				}, {
					key: 'Book',
					value: 'http://schema.org/Book'

				}, {
					key: 'Image',
					value: 'http://schema.org/ImageObject'

				}, {
					key: 'Movie',
					value: 'http://schema.org/Movie'
				}, {
					key: 'Person',
					value: 'http://schema.org/Person'
				}, {
					key: 'Product',
					value: 'http://schema.org/Product'

				}, {
					key: 'Service',
					value: 'http://schema.org/Service'

				}, {
					key: 'Text',
					value: 'http://schema.org/Text'
				}, {
					key: 'Thing',
					value: 'http://schema.org/Thing'
				}, {
					key: 'WebPage',
					value: 'http://schema.org/WebPage'

				}
				];
			this.init = function () {
				// load data from model
				this.id = this.getProperty('id');
				this.label = this.getProperty('label');
				this.description = this.getProperty('description');
				this.category = this.getProperty('category');
				this.type = this.getProperty('type');
				this.property = this.getProperty('property');
				this.alert = null;
				this.getParentCategory();
				// NOTE: cover is removed from weburger
			};

			this.getParentCategory = function () {
				var widget = this.getWidget();
				while (!widget.isRoot() && !widget.getModelProperty('category')) {
					widget = widget.getParent();
				}
				this.parentCategory = widget.getModelProperty('category');
			};

			this.setProperties = function () {
				if (!this.parentCategory) {
					this.alert = 'No parent type is defined.';
				} else {
					this.setType(this.parentCategory);
				}
			};

			this.setType = function (type) {
				switch (type) {
				case 'http://schema.org/Article':
					this.properties =
						[
							'articleBody', 'articleSection', 'about', 'author', 'comment',
							'commentCount', 'contributor', 'creator', 'description', 'editor',
							'genre', 'headline', 'keywords', 'publisher', 'text', 'translator',
							'video'
							];
					break;

				case 'http://schema.org/Book':
					this.properties =
						[
							'about', 'author', 'bookFormat', 'comment', 'creator', 'genre',
							'headline', 'image', 'keywords', 'name', 'publisher', 'text',
							'translator', 'video'
							];
					break;

				case 'http://schema.org/Image':
					this.properties =
						[
							'about', 'description', 'caption', 'comment', 'thumbnail',
							'keywords', 'image', 'name', 'url'
							];
					break;

				case 'http://schema.org/Movie':
					this.properties =
						[
							'about', 'actor', 'comment', 'commentCount', 'copyrightYear',
							'countryOfOrigin', 'creator', 'dateCreated', 'description',
							'director', 'duration', 'genre', 'headline', 'isBasedOn',
							'image', 'keywords', 'musicBy', 'name', 'provider', 'productionCompany',
							'sponsor', 'subtitleLanguage', 'text', 'thumbnailUrl', 'trailer'
							];
					break;

				case 'http://schema.org/Person':
					this.properties =
						[
							'additionalName', 'address', 'birthDate', 'birthPlace',
							'children', 'deathDate', 'daethPlace', 'email', 'familyName',
							'gender', 'homeLocation', 'parent', 'telephone', 'description',
							'image', 'spouse'
							];
					break;

				case 'http://schema.org/Product':
					this.properties =
						[
							'brand', 'category', 'color', 'description', 'height',
							'isConsumableFor', 'genre', 'headline', 'image', 'name'
							];
					break;

				case 'http://schema.org/Service':
					this.properties =
						[
							'areaServed', 'brand', 'category', 'logo', 'serviceType',
							'description', 'image', 'name'
							];
					break;

				case 'http://schema.org/Thing':
					this.properties = ['description', 'image', 'name'];
					break;

				case 'http://schema.org/Text':
					this.properties = ['description', 'image', 'keywords', 'name'];
					break;

				case 'http://schema.org/WebPage':
					this.properties =
						[
							'about', 'author', 'comment', 'description', 'image', 'headline',
							'keywords', 'commentCount', 'mainContentOfPage', 'primaryImageOfPage',
							'video'
							];
					break;
				}
			};
		}
	});

	$settings.newPage({
		type: 'border',
		label: 'Border',
		icon: 'border_all',
		templateUrl: 'views/settings/wb-border.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function () {
			this.width = {};
			this.radius = {};

			this.styles = [{
				title: 'None',
				value: 'none'
			}, {
				title: 'Solid',
				value: 'solid'
			}, {
				title: 'Dotted',
				value: 'dotted'
			}, {
				title: 'Dashed',
				value: 'dashed'
			}, {
				title: 'Double',
				value: 'double'
			}, {
				title: 'Groove',
				value: 'groove'
			}, {
				title: 'Ridge',
				value: 'ridge'
			}, {
				title: 'Inset',
				value: 'inset'
			}, {
				title: 'Outset',
				value: 'outset'
			}];

			/*
			 * watch 'wbModel' and apply the changes into setting panel
			 */
			this.init = function () {
				this.style = this.getStyleBorder('style');
				this.color = this.getStyleBorder('color');
				/*
				 * Set width
				 * width is a string such as '10px 25% 2vh 4px'
				 */
				fillDimFromString(this.width, this.getStyleBorder('width') || 'medium');
				/*
				 * Set radius
				 * radius is a string such as '10px 25% 2vh 4px'
				 */
				fillCornerFromString(this.radius, this.getStyleBorder('radius') || '0px');
			};

			/*
			 * Settings about border width
			 */
			this.widthAllChanged = function (val) {
				//medium is default value of width
				setAllDim(this.width, val || 'medium');
				this.widthChanged();
			};

			this.widthChanged = function () {
				this.setStyleBorder('width', createDimeStr(this.width));
			};

			/*
			 * Settings about border radius
			 */
			this.radiusAllChanged = function (val) {
				//0px is default value of radius
				setAllCorner(this.radius, val || '0px');
				this.radiusChanged();
			};

			this.radiusChanged = function () {
				this.setStyleBorder('radius', createCornerStr(this.radius))
			};
		}
	});

	/**
	 * @ngdoc Widget Settings
	 * @name layout
	 * @description Manages element layout
	 * 
	 * Layout is consists of the following attributes for a group:
	 * 
	 * <ul>
	 *     <li>direction</li>
	 *     <li>direction-inverse</li>
	 *     <li>wrap</li>
	 *     <li>wrap-inverse</li>
	 *     <li>align</li>
	 *     <li>justify</li>
	 * </ul>
	 * 
	 * and following ones for a widget (or group):
	 * 
	 * <ul>
	 *     <li>grow</li>
	 *     <li>shrink</li>
	 *     <li>order</li>
	 * </ul>
	 * 
	 * See the layout documents for more details.
	 * 
	 * @see wb-layout
	 */
	$settings.newPage({
		type: 'layout',
		label: 'Layout',
		icon: 'dashboard',
		description: 'Manages layout of the current item.',
		templateUrl: 'views/settings/wb-layout.html',
		controllerAs: 'ctrl',
		/*
		 * Manages setting page 
		 * 
		 * @ngInject
		 */
		controller: function () {
			this.direction_ = [{
				title: 'column',
				icon: 'wb-horizontal-boxes',
				value: 'column'
			}, {
				title: 'row',
				icon: 'wb-vertical-boxes',
				value: 'row'
			}];

			this.justify_ = {
					'row': [{
						title: 'Start',
						icon: 'sort_start_horiz',
						value: 'start'
					}, {
						title: 'End',
						icon: 'sort_end_horiz',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'sort_center_horiz',
						value: 'center'
					}, {
						title: 'Space Around',
						icon: 'sort_space_around_horiz',
						value: 'space-around'
					}, {
						title: 'Space Between',
						icon: 'sort_space_between_horiz',
						value: 'space-between'
					}],
					'column': [{
						title: 'Start',
						icon: 'sort_start_vert',
						value: 'start'
					}, {
						title: 'End',
						icon: 'sort_end_vert',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'sort_center_vert',
						value: 'center'
					}, {
						title: 'Space Around',
						icon: 'sort_space_around_vert',
						value: 'space-around'
					}, {
						title: 'Space Between',
						icon: 'sort_space_between_vert',
						value: 'space-between'
					}]
			};

			this.align_ = {
					'column': [{
						title: 'Stretch',
						icon: 'format_align_justify',
						value: 'stretch'
					}, {
						title: 'Start',
						icon: 'format_align_left',
						value: 'start'
					}, {
						title: 'End',
						icon: 'format_align_right',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'format_align_center',
						value: 'center'
					}],
					'row': [{
						title: 'Stretch',
						icon: 'align_justify_vertical',
						value: 'stretch'
					}, {
						title: 'Start',
						icon: 'align_start_vertical',
						value: 'start'
					}, {
						title: 'End',
						icon: 'align_end_vertical',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'align_center_vertical',
						value: 'center'
					}]
			};
			/*
			 * watch 'wbModel' and apply the changes in setting panel
			 */
			this.init = function () {
				this.direction = this.getStyleLayout('direction') || 'column';
				this.align = this.getStyleLayout('align');
				this.wrap = this.getStyleLayout('wrap');
				this.justify = this.getStyleLayout('justify');
			};

			/*
			 * This part updates the wbModel whenever the layout properties are changed in view
			 */
			this.directionChanged = function () {
				this.setStyleLayout('direction', this.direction);
			};

			this.wrapChanged = function () {
				this.setStyleLayout('wrap', this.wrap);
			};

			this.alignChanged = function () {
				this.setStyleLayout('align', this.align);
			};

			this.justifyChanged = function () {
				this.setStyleLayout('justify', this.justify);
			};
		}
	});

	$settings.newPage({
		type: 'layout-self',
		label: 'Self Layout',
		icon: 'dashboard',
		description: 'Manages layout of the current item.',
		templateUrl: 'views/settings/wb-layout-self.html',
		controllerAs: 'ctrl',
		/*
		 * Manages setting page 
		 * 
		 * @ngInject
		 */
		controller: function () {
			this.selfAlign_ = {
					'column': [{
						title: 'Stretch',
						icon: 'format_align_justify',
						value: 'stretch'
					}, {
						title: 'Start',
						icon: 'format_align_left',
						value: 'start'
					}, {
						title: 'End',
						icon: 'format_align_right',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'format_align_center',
						value: 'center'
					}, {
						title: 'Automatic',
						icon: 'brightness_auto',
						value: 'auto'
					}],
					'row': [{
						title: 'Stretch',
						icon: 'align_justify_vertical',
						value: 'stretch'
					}, {
						title: 'Start',
						icon: 'align_start_vertical',
						value: 'start'
					}, {
						title: 'End',
						icon: 'align_end_vertical',
						value: 'end'
					}, {
						title: 'Center',
						icon: 'align_center_vertical',
						value: 'center'
					}, {
						title: 'Automatic',
						icon: 'brightness_auto',
						value: 'auto'
					}]
			};

			/*
			 * watch 'wbModel' and apply the changes in setting panel
			 */
			this.init = function () {
				this.alignSelf = this.getStyleLayout('align_self', 'auto');
				this.order = this.getStyleLayout('order', 0);
				// SEE: https://www.w3schools.com/cssreF/css3_pr_flex-basis.asp
				this.basis = this.getStyleLayout('basis', 'auto');
				this.grow = this.getStyleLayout('grow', 0);
				this.shrink = this.getStyleLayout('shrink', 1);
			};

			/*
			 * Fetchs parent direction
			 */
			this.getParentDirection = function () {
				var widget = this.getWidget();
				if (!widget || !widget.getParent()) {
					return;
				}
				return widget.getParent().getDirection();
			};

			/*
			 * This part updates the wbModel whenever the layout-self property is changed in view
			 */
			this.alignSelfChanged = function () {
				this.setStyleLayout('align_self', this.alignSelf);
			};
			this.updateOrder = function (order) {
				this.setStyleLayout('order', order);
			};
			this.updateBasis = function (basis) {
				this.setStyleLayout('basis', basis);
			};
			this.updateGrow = function (grow) {
				this.setStyleLayout('grow', grow);
			};
			this.updateShrink = function (shrink) {
				this.setStyleLayout('shrink', shrink);
			};
		}
	});

	//TODO: Masood, 2018: Move this controller to a separated controller.
	$settings.newPage({
		type: 'marginPadding',
		label: 'Margin/Padding',
		icon: 'border_clear',
		templateUrl: 'views/settings/wb-margin-padding.html',
		controllerAs: 'ctrl',
		/** 
		 * @ngInject
		 * @ngDoc Controllers
		 * @name marginPaddingCtrl
		 * @description manages settings view of margin and padding
		 * 
		 * Manage view with multiple editor of margin elements.
		 */
		controller: function () {
			this.margin = {};
			this.padding = {};

			/**
			 * All settings about margin and padding
			 * 
			 * Note: we normally add JSDoc to the global functions.
			 * 
			 * @memberof marginPaddingCtrl
			 */
			this.updateAllMargin = function (val) {
				// default value of margin is 0px
				setAllDim(this.margin, val || '0px');
				this.updateMargin(this.margin);
			};

			/**
			 * Sets all padding to the equal value
			 * 
			 * @memberof marginPaddingCtrl
			 */
			this.updateAllPadding = function (val) {
				//default value of padding is 0px
				setAllDim(this.padding, val);
				this.updatePadding(this.padding)
			};

			this.updateMargin = function (newMargin) {
				this.setStyle('margin', createDimeStr(newMargin));
			};

			this.updatePadding = function (newPadding) {
				this.setStyle('padding', createDimeStr(newPadding));
			};

			this.init = function () {
				//margin is a string such as '10px 25% 2vh 4px'
				fillDimFromString(this.margin, this.getStyle('margin'));
				fillDimFromString(this.padding, this.getStyle('padding'));
			};
		}
	});

	$settings.newPage({
		type: 'size',
		label: 'Size',
		icon: 'photo_size_select_large',
		templateUrl: 'views/settings/wb-size.html',
		controllerAs: 'ctrl',

		/*
		 * @ngInject
		 */
		controller: function () {
			/*
			 * watch 'wbModel' and apply the changes in setting panel
			 */
			this.init = function () {
				this.width = this.getStyleSize('width');
				this.height = this.getStyleSize('height');
				this.minWidth = this.getStyleSize('minWidth');
				this.minHeight = this.getStyleSize('minHeight');
				this.maxWidth = this.getStyleSize('maxWidth');
				this.maxHeight = this.getStyleSize('maxHeight');
			};

			/*
			 * This part updates the wbModel whenever the size properties are changed in view
			 */
			this.widthChanged = function () {
				this.setStyleSize('width', this.width);
			};

			this.heightChanged = function () {
				this.setStyleSize('height', this.height);
			};

			this.minWidthChanged = function () {
				this.setStyleSize('minWidth', this.minWidth);
			};

			this.minHeightChanged = function () {
				this.setStyleSize('minHeight', this.minHeight);
			};

			this.maxWidthChanged = function () {
				this.setStyleSize('maxWidth', this.maxWidth);
			};

			this.maxHeightChanged = function () {
				this.setStyleSize('maxHeight', this.maxHeight);
			};
		}
	});

	$settings.newPage({
		type: 'shadow',
		label: 'Shadow',
		icon: 'brightness_low',
		description: 'Show different shadows (zero or more) around the widget',
		templateUrl: 'views/settings/wb-shadow.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function () {

			/*
			 * watch 'wbModel' and apply the changes in setting panel
			 */
			this.init = function () {
				var shadows = this.getProperty('style.shadows');
				// this is an object we have to make a clone.
				this.shadows = _.cloneDeep(shadows);
			};

			this.updateShadows = function () {
				this.setProperty('style.shadows', this.shadows);
				this.init();
			};

			this.remove = function (index) {
				this.shadows.splice(index, 1);
				this.updateShadows();
			};

			this.addShadow = function () {
				if (!this.shadows) {
					this.shadows = [];
				}
				this.shadows.push({
					hShift: '0px',
					vShift: '0px',
					blur: '0px',
					spread: '0px',
					color: 'rgb(0,0,0)'
				});
				this.updateShadows();
			};

		}
	});
	$settings.newPage({
		type: 'transform',
		label: 'Transform',
		icon: 'brightness_low',
		description: 'Transform widget shape',
		templateUrl: 'views/settings/wb-transform.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function () {

			/*
			 * watch 'wbModel' and apply the changes in setting panel
			 */
			this.init = function () {
				this.origin = this.getProperty('style.transform.origin');
				this.style = this.getProperty('style.transform.style');
				this.perspective = this.getProperty('style.transform.perspective');

				// X:2D
				this.translateX = this.getProperty('style.transform.x.translate');
				this.scaleX = this.getProperty('style.transform.x.scale');
				this.rotateX = this.getProperty('style.transform.x.rotate');
				this.skewX = this.getProperty('style.transform.x.skew');

				// Y:2D
				this.translateY = this.getProperty('style.transform.y.translate');
				this.scaleY = this.getProperty('style.transform.y.scale');
				this.rotateY = this.getProperty('style.transform.y.rotate');
				this.skewY = this.getProperty('style.transform.y.skew');

				// Z:3D
				this.translateZ = this.getProperty('style.transform.z.translate');
				this.scaleZ = this.getProperty('style.transform.z.scale');
				this.rotateZ = this.getProperty('style.transform.z.rotate');
			};

			this.updateOrigin = function () {
				this.setProperty('style.transform.origin', this.origin);
			};

//			flat: Specifies that child elements will NOT preserve its 3D position. This is default
//			preserve-3d: Specifies that child elements will preserve its 3D position
//			initial: Sets this property to its default value. Read about initial
//			inherit: Inherits this property from its parent element. Read about inherit
			this.updateStyle = function () {
				this.setProperty('style.transform.style', this.style);
			};
			this.updatePerspective = function () {
				this.setProperty('style.transform.perspective', this.perspective);
			};

			// X
			this.updateTranslateX = function () {
				this.setProperty('style.transform.x.translate', this.translateX);
			};
			this.updateScaleX = function () {
				this.setProperty('style.transform.x.scale', this.scaleX);
			};
			this.updateRotateX = function () {
				this.setProperty('style.transform.x.rotate', this.rotateX);
			};
			this.updateSkewX = function () {
				this.setProperty('style.transform.x.skew', this.skewX);
			};

			// Y
			this.updateTranslateY = function () {
				this.setProperty('style.transform.y.translate', this.translateY);
			};
			this.updateScaleY = function () {
				this.setProperty('style.transform.y.scale', this.scaleY);
			};
			this.updateRotateY = function () {
				this.setProperty('style.transform.y.rotate', this.rotateY);
			};
			this.updateSkewY = function () {
				this.setProperty('style.transform.y.skew', this.skewY);
			};

			// Z
			this.updateTranslateZ = function () {
				this.setProperty('style.transform.z.translate', this.translateZ);
			};
			this.updateScaleZ = function () {
				this.setProperty('style.transform.z.scale', this.scaleZ);
			};
			this.updateRotateZ = function () {
				this.setProperty('style.transform.z.rotate', this.rotateZ);
			};
		}
	});
});

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
angular.module('am-wb-core')

/*
 * Load default resources
 */
.run(function($resource, TinymcePluginImageTool, TinymcePluginCodesample, TinymcePluginLink) {
	var pluginManager = tinymce.PluginManager;
	pluginManager.add('codesample', TinymcePluginCodesample);
	pluginManager.add('image', TinymcePluginImageTool);
	pluginManager.add('link', TinymcePluginLink);
});

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

angular.module('am-wb-core')

/*
 * Load widgets
 */
.run(function ($widget) {

    /**
     * @ngdoc Widgets
     * @name Group
     * @description Parent widget of other widgets
     * 
     * default setting:
     * - margin: '1px'
     */
    $widget.newWidget({
        // widget description
        type: 'Group',
        title: 'Group',
        description: 'Panel contains list of widgets.',
        icon: 'wb-widget-group',
        groups: ['basic'],
        model: {
            style: {
                margin: '1px',
                padding: '1px',
                layout: {
                    direction: 'column'
                },
                size: {
                    minHeight: '16px',
                    minWidth: '16px'
                }
            }
        },
        // functional properties
        templateUrl: 'views/widgets/wb-group.html',
        help: 'http://dpq.co.ir/more-information-link',
        helpId: 'wb-widget-group'
    });
    /**
     * @ngdoc Widgets
     * @name Text
     * @description Add rich text to page
     * 
     * This is a RTF to add to a page.
     * 
     */
    $widget.newWidget({
        // widget description
        type: 'HtmlText',
        title: 'Text',
        description: 'An text block.',
        icon: 'wb-widget-html',
        groups: ['basic'],
        model: {
            text: '<h2>Text element</h2><p>Click on the text box to edit.</p>',
            style: {
            	padding: '8px'
            }
        },
        // help id
        help: 'http://dpq.co.ir',
        helpId: 'wb-widget-html',
        // functional properties
        templateUrl: 'views/widgets/wb-html.html',
        controller: function(){
        	this.text = '';
        	this.setText = function(text){
        		this.text = text;
        	};
        	this.initWidget = function(){
        		var ctrl = this;
        		this.on('modelUpdated', function($event){
        			if($event.key === 'text'){
        				ctrl.setText($event.newValue);
        			}
        		});
        		this.setText(this.getModelProperty('text'));
        	};
        },
        controllerAs: 'ctrl'
    });
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $$wbCrypto
 * @description Crypto services
 * 
 * 
 */
.service('$wbCrypto', function() {

    function md5cycle(x, k) {
        var a = x[0], b = x[1], c = x[2], d = x[3];

        a = ff(a, b, c, d, k[0], 7, -680876936);
        d = ff(d, a, b, c, k[1], 12, -389564586);
        c = ff(c, d, a, b, k[2], 17, 606105819);
        b = ff(b, c, d, a, k[3], 22, -1044525330);
        a = ff(a, b, c, d, k[4], 7, -176418897);
        d = ff(d, a, b, c, k[5], 12, 1200080426);
        c = ff(c, d, a, b, k[6], 17, -1473231341);
        b = ff(b, c, d, a, k[7], 22, -45705983);
        a = ff(a, b, c, d, k[8], 7, 1770035416);
        d = ff(d, a, b, c, k[9], 12, -1958414417);
        c = ff(c, d, a, b, k[10], 17, -42063);
        b = ff(b, c, d, a, k[11], 22, -1990404162);
        a = ff(a, b, c, d, k[12], 7, 1804603682);
        d = ff(d, a, b, c, k[13], 12, -40341101);
        c = ff(c, d, a, b, k[14], 17, -1502002290);
        b = ff(b, c, d, a, k[15], 22, 1236535329);

        a = gg(a, b, c, d, k[1], 5, -165796510);
        d = gg(d, a, b, c, k[6], 9, -1069501632);
        c = gg(c, d, a, b, k[11], 14, 643717713);
        b = gg(b, c, d, a, k[0], 20, -373897302);
        a = gg(a, b, c, d, k[5], 5, -701558691);
        d = gg(d, a, b, c, k[10], 9, 38016083);
        c = gg(c, d, a, b, k[15], 14, -660478335);
        b = gg(b, c, d, a, k[4], 20, -405537848);
        a = gg(a, b, c, d, k[9], 5, 568446438);
        d = gg(d, a, b, c, k[14], 9, -1019803690);
        c = gg(c, d, a, b, k[3], 14, -187363961);
        b = gg(b, c, d, a, k[8], 20, 1163531501);
        a = gg(a, b, c, d, k[13], 5, -1444681467);
        d = gg(d, a, b, c, k[2], 9, -51403784);
        c = gg(c, d, a, b, k[7], 14, 1735328473);
        b = gg(b, c, d, a, k[12], 20, -1926607734);

        a = hh(a, b, c, d, k[5], 4, -378558);
        d = hh(d, a, b, c, k[8], 11, -2022574463);
        c = hh(c, d, a, b, k[11], 16, 1839030562);
        b = hh(b, c, d, a, k[14], 23, -35309556);
        a = hh(a, b, c, d, k[1], 4, -1530992060);
        d = hh(d, a, b, c, k[4], 11, 1272893353);
        c = hh(c, d, a, b, k[7], 16, -155497632);
        b = hh(b, c, d, a, k[10], 23, -1094730640);
        a = hh(a, b, c, d, k[13], 4, 681279174);
        d = hh(d, a, b, c, k[0], 11, -358537222);
        c = hh(c, d, a, b, k[3], 16, -722521979);
        b = hh(b, c, d, a, k[6], 23, 76029189);
        a = hh(a, b, c, d, k[9], 4, -640364487);
        d = hh(d, a, b, c, k[12], 11, -421815835);
        c = hh(c, d, a, b, k[15], 16, 530742520);
        b = hh(b, c, d, a, k[2], 23, -995338651);

        a = ii(a, b, c, d, k[0], 6, -198630844);
        d = ii(d, a, b, c, k[7], 10, 1126891415);
        c = ii(c, d, a, b, k[14], 15, -1416354905);
        b = ii(b, c, d, a, k[5], 21, -57434055);
        a = ii(a, b, c, d, k[12], 6, 1700485571);
        d = ii(d, a, b, c, k[3], 10, -1894986606);
        c = ii(c, d, a, b, k[10], 15, -1051523);
        b = ii(b, c, d, a, k[1], 21, -2054922799);
        a = ii(a, b, c, d, k[8], 6, 1873313359);
        d = ii(d, a, b, c, k[15], 10, -30611744);
        c = ii(c, d, a, b, k[6], 15, -1560198380);
        b = ii(b, c, d, a, k[13], 21, 1309151649);
        a = ii(a, b, c, d, k[4], 6, -145523070);
        d = ii(d, a, b, c, k[11], 10, -1120210379);
        c = ii(c, d, a, b, k[2], 15, 718787259);
        b = ii(b, c, d, a, k[9], 21, -343485551);

        x[0] = add32(a, x[0]);
        x[1] = add32(b, x[1]);
        x[2] = add32(c, x[2]);
        x[3] = add32(d, x[3]);

    }

    function cmn(q, a, b, x, s, t) {
        a = add32(add32(a, q), add32(x, t));
        return add32((a << s) | (a >>> (32 - s)), b);
    }

    function ff(a, b, c, d, x, s, t) {
        return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
        return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
        return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
        return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }

    function md51(s) {
        var txt = '';
        var n = s.length, state = [ 1732584193, -271733879,
            -1732584194, 271733878 ], i;
        for (i = 64; i <= s.length; i += 64) {
            md5cycle(state, md5blk(s.substring(i - 64, i)));
        }
        s = s.substring(i - 64);
        var tail = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0 ];
        for (i = 0; i < s.length; i++)
            tail[i >> 2] |= s.charCodeAt(i) << ((i % 4) << 3);
        tail[i >> 2] |= 0x80 << ((i % 4) << 3);
        if (i > 55) {
            md5cycle(state, tail);
            for (i = 0; i < 16; i++)
                tail[i] = 0;
        }
        tail[14] = n * 8;
        md5cycle(state, tail);
        return state;
    }

    /*
     * there needs to be support for Unicode here, unless we
     * pretend that we can redefine the MD-5 algorithm for
     * multi-byte characters (perhaps by adding every four
     * 16-bit characters and shortening the sum to 32 bits).
     * Otherwise I suggest performing MD-5 as if every
     * character was two bytes--e.g., 0040 0025 = @%--but
     * then how will an ordinary MD-5 sum be matched? There
     * is no way to standardize text to something like UTF-8
     * before transformation; speed cost is utterly
     * prohibitive. The JavaScript standard itself needs to
     * look at this: it should start providing access to
     * strings as preformed UTF-8 8-bit unsigned value
     * arrays.
     */
    function md5blk(s) { /* I figured global was faster. */
        var md5blks = [], i;
        /*
         * Andy King said do it this
         * way.
         */
        for (i = 0; i < 64; i += 4) {
            md5blks[i >> 2] = s.charCodeAt(i)
            + (s.charCodeAt(i + 1) << 8)
            + (s.charCodeAt(i + 2) << 16)
            + (s.charCodeAt(i + 3) << 24);
        }
        return md5blks;
    }

    var hex_chr = '0123456789abcdef'.split('');

    function rhex(n) {
        var s = '', j = 0;
        for (; j < 4; j++)
            s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
        + hex_chr[(n >> (j * 8)) & 0x0F];
        return s;
    }

    function hex(x) {
        for (var i = 0; i < x.length; i++)
            x[i] = rhex(x[i]);
        return x.join('');
    }

    function md5(s) {
        return hex(md51(s));
    }

    /*
     * this function is much faster, so if possible we use
     * it. Some IEs are the only ones I know of that need
     * the idiotic second function, generated by an if
     * clause.
     */

    function add32(a, b) {
        return (a + b) & 0xFFFFFFFF;
    }

    if (md5('hello') != '5d41402abc4b2a76b9719d911017c592') {
        function add32(x, y) {
            var lsw = (x & 0xFFFF) + (y & 0xFFFF), msw = (x >> 16)
            + (y >> 16) + (lsw >> 16);
            return (msw << 16) | (lsw & 0xFFFF);
        }
    }

    this.md5 = md5;
    return this;
});

/*
 * Copyright (c) 2015-2025 Phoinex Scholars Co. http://dpq.co.ir
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
angular.module('am-wb-core') //

/**
 * @ngdoc Services
 * @name $dispatcher
 * @description a wrapper of FLUX
 * 
 * 
 * Dispatcher is used to broadcast payloads to registered callbacks. This is
 * different from generic pub-sub systems in two ways: - Callbacks are not
 * subscribed to particular events. Every payload is dispatched to every
 * registered callback. - Callbacks can be deferred in whole or part until other
 * callbacks have been executed.
 * 
 */
.service('$dispatcher', function() {
	'use strict';

	/*
	 * List of all dispatcher
	 */
	var dispatchers = {};

	/*
	 * Finds dispatcher for the type
	 */
	function getDispatcherFor(type) {
		if (!dispatchers[type]) {
			dispatchers[type] = new Flux.Dispatcher();
		}
		return dispatchers[type];
	}

	/**
	 * Registers a callback to be invoked with every dispatched payload. Returns
	 * a token that can be used with `waitFor()`.
	 * 
	 * This payload is digested by both stores:
	 * 
	 * @example 
	 * dispatchToken = $ispatcher.register('action.type', function(payload) { 
	 * 	if (payload.actionType === 'country-update') { 
	 * 		CountryStore.country = payload.selectedCountry; 
	 * 	} 
	 * });
	 * 
	 * @param callback function to add 
	 */
	this.on = function(type, callback) {
		return getDispatcherFor(type).register(callback);
	};

	/** 
	 * Removes a callback based on its token. 
	 */
	this.off = function(type, id) {
		return getDispatcherFor(type).unregister(id);
	};

	/**
	 * Waits for the callbacks specified to be invoked before continuing
	 * execution of the current callback. This method should only be used by a
	 * callback in response to a dispatched payload.
	 */
	this.waitFor = function(type, ids) {
		return getDispatcherFor(type).waitFor(ids);
	};

	/**
	 * Dispatches a payload to all registered callbacks.
	 * 
	 *  Payload contains key and values. You may add extra values to the 
	 * payload.
	 * 
	 */
	this.dispatch = function(type, payload) {
		return getDispatcherFor(type).dispatch(payload);
	};

	/**
	 * Is this Dispatcher currently dispatching.
	 */
	this.isDispatching = function(type) {
		return getDispatcherFor(type).isDispatching();
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $wbFloat
 * @description Open and manage float panels
 * 
 * 
 * The base of this implementation is https://jspanel.de/api.html
 */
.service('$wbFloat', function($q, $wbUtil, $rootScope, $compile, $controller) {
	'use strict';

	/**
	 * @ngdoc Factory
	 * @name InternalDialog
	 * @description The internal dialog
	 * 
	 * Manage an internal dialog
	 */
	function InternalDialog(optionsOrPreset){
		this.setUserOptions(optionsOrPreset);
		var dialog = this;
		this.callback = function() {
			var element = angular.element(this.content);
			dialog.setElement(element);
		};
		this.onclosed = function(){
			/*
			 * Remove scope
			 * 
			 * NOTE: if there is a $watch, then this return an error
			 */
			if(dialog.scope){
				dialog.scope.$destroy();
				delete dialog.scope;
			}
		};
	}

	InternalDialog.prototype.setUserOptions = function(optionsOrPreset) {
		this._userOptions = optionsOrPreset;
		this.theme = 'primary';

		this.closeOnEscape =  optionsOrPreset.closeOnEscape;

		this.header = optionsOrPreset.header;
		this.headerTitle = optionsOrPreset.headerTitle || 'my panel #1';
		this.headerControls = optionsOrPreset.headerControls || 'all';

		this.position = optionsOrPreset.position || 'center-top 0 0';
		this.panelSize = optionsOrPreset.panelSize || '400 400';
		this.contentSize = optionsOrPreset.contentSize || '450 250';
	};

	InternalDialog.prototype.getUserOptions = function() {
		return this._userOptions;
	};

	InternalDialog.prototype.setRootElement = function(element){
		this._rootElement = element;
		element.css('visibility', this._isVisible ? 'visible' : 'hidden');
	};

	InternalDialog.prototype.getRootElement = function(){
		return this._rootElement;
	};

	InternalDialog.prototype.setElement = function(element){
		this._element = element;
		if(this._element){
			if(this._elementPromise){
				this._elementPromise.resolve(element);
			}
		}
	};

	InternalDialog.prototype.getElement = function(){
		if(!this._element){
			if(!this._elementPromise){
				this._elementPromise = $q.defer();
			}
			this._elementPromise.promise;
		}
		return $q.when(this._element);
	};

	InternalDialog.prototype.setScope = function(scope){
		this._scope = scope;
	};

	InternalDialog.prototype.getScope = function(){
		return this._scope;
	};

	InternalDialog.prototype.setVisible = function(flag){
		this._isVisible = flag;
		var element = this.getRootElement();
		if(element){
			element.css('visibility', this._isVisible ? 'visible' : 'hidden');
		}
	};
	
	InternalDialog.prototype.hide = function(){
		this.setVisible(false);
	};

	InternalDialog.prototype.isVisible = function(){
		return this._isVisible;
	};
	
	InternalDialog.prototype.setPanel = function(panel){
		this._panel = panel;
	};
	
	InternalDialog.prototype.getPanel = function(){
		return this._panel;
	};
	
	/**
	 * Changes size of the panel
	 * 
	 * @memberof InternalDialog
	 * @params w {String|Integer} the width of the panel
	 * @params h {String|Integer} the height of the panel
	 */
	InternalDialog.prototype.resize = function(w, h){
		var panel = this.getPanel();
		panel.resize({
			width: w,
			height: h
		});
	};
	
	InternalDialog.prototype.setView = function(optionsOrPreset){
		var dialog = this;
		var contentElement = null;
		var template = null;
		/*
		 * Create view
		 */
		function createView() {
			// TODO: maso, 2018: check contentElement
			// TODO: maso, 2019: check template
			var parenScope = optionsOrPreset.parent || $rootScope;
			var childScope = optionsOrPreset.scope || parenScope.$new(false, parenScope);

			// 3- bind controller
			var element = angular.element(template);
			var link = $compile(element);
			if (angular.isDefined(optionsOrPreset.controller)) {
				var controller = $controller(optionsOrPreset.controller, {
					$scope: childScope,
					$element: element,
					$wbFloat: dialog
				});
				if (optionsOrPreset.controllerAs) {
					childScope[optionsOrPreset.controllerAs] = controller;
				}
				element.data('$ngControllerController', controller);
			}
			link(childScope);

			contentElement.empty();
			contentElement.append(element);
		}

		// 2- create element
		return this.getElement()
		.then(function(element){
			contentElement = element;
			return $wbUtil.getTemplateFor(optionsOrPreset)//
		})
		.then(function(templateL){
			template = templateL;
			return createView();
		});
	};
	
	

	/**
	 * Hide an existing float and resolve the promise returned from
	 * $wbFloat.show()
	 * 
	 * @name hide
	 * @memberof $wbFloat
	 * @param response
	 *            An argument for the resolved promise.
	 * @return promise A promise that is resolved when the float has been
	 *         closed.
	 */
	/**
	 * Hide an existing float and reject the promise returned from
	 * $wbFloat.show().
	 * 
	 * @name hide
	 * @memberof $wbFloat
	 * @param response
	 *            An argument for the rejected promise.
	 * @return promise A promise that is resolved when the float has been
	 *         closed.
	 */
	/**
	 * Display an element with a float dialog
	 * 
	 * @name show
	 * @memberof $wbFloat
	 * @param optionsOrPreset
	 *            {object}
	 *            <ul>
	 *            <li>title - {=string}: title of the float</li>
	 *            <li></li>
	 *            <li></li>
	 *            
	 *            
	 *            <li>templateUrl - {string=}: The URL of a template that will
	 *            be used as the content of the dialog.</li>
	 *            <li>template- {string=}: HTML template to show in the dialog.
	 *            This must be trusted HTML with respect to Angular's $sce
	 *            service. This template should never be constructed with any
	 *            kind of user input or user data.</li>
	 *            <li>contentElement:</li>
	 *            <li>scope - {object=}: the scope to link the template
	 *            controller to. If none is specified, it will create a new
	 *            isolate scope. This scope will be destroyed when the dialog is
	 *            removed unless preserveScope is set to true.</li>
	 *            <li>controller - {function|string=}: The controller to
	 *            associate with the dialog. The controller will be injected
	 *            with the local $mdDialog, which passes along a scope for the
	 *            dialog.</li>
	 *            <li>controllerAs - {string=}: An alias to assign the
	 *            controller to on the scope.</li>
	 *            <li>parent - {element=}: The element to append the dialog to.
	 *            Defaults to appending to the root element of the application.</li>
	 *            </ul>
	 * @return promise A promise that can be resolved with $mdFloat.hide() or
	 *         rejected with $mdFloat.cancel().
	 */
	this.show = function(optionsOrPreset) {
		return $q.resolve(this.create(optionsOrPreset))
		.then(function(dialog){
			dialog.setView(optionsOrPreset);
			return dialog;
		});
	};

	/**
	 * Creates and return a dialog
	 * 
	 * @memberof $wbFloat
	 */
	this.create = function(optionsOrPreset) {
		var dialog = new InternalDialog(optionsOrPreset);
		var panel = jsPanel.create(dialog);
		dialog.setPanel(panel);
		dialog.setRootElement(angular.element(panel));
		return dialog;
	};
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $$wbCrypto
 * @description Crypto services
 * 
 * Deprecated : use $wbWindow
 */
.service('$wbLibs', function($wbWindow) {
	this.load = function(path){
		return $wbWindow.loadLibrary(path);
	}
    return this;
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $wbLocal
 * @description manage localization of widgets
 * 
 * Deprecated : use $wbWindow
 */
.service('$wbLocal', function($wbWindow) {
	var defaultDateFormat = 'YYYY-MM-DD hh:mm:ss';
	
	/**
	 * Gets current data of the system.
	 * 
	 * @memberof $wbLocal
	 */
	this.getDate = function(){
		return new Date();
	};
	
	/**
	 * Formats the input date based on the format
	 * 
	 * NOTE: default format is 'YYYY-MM-DD hh:mm:ss'
	 * 
	 * @params data {String | Date} to format
	 * @params format {String} of the output
	 * @memberof $wbLocal
	 */
	this.formatDate = function(date, format){
		try {
            var mf = format || defaultDateFormat;
            var localDate = moment //
	            .utc(date) //
	            .local();
            return localDate.format(mf);
        } catch (ex) {
            return '-' + ex.message;
        }
	};
	
	/**
	 * Get currency of the system
	 * 
	 * @return currency ISO code
	 * @memberof $wbLocal
	 */
	this.getCurrency = function(){
		return this.currency || 'USD';
	};
	
	/**
	 * Sets currency of the system
	 * 
	 * @param currency {String} ISO code
	 * @memberof $wbLocal
	 */
	this.setCurrency = function(currency){
		this.currency = currency;
	};
	
	/**
	 * Get language of the system
	 * 
	 * @return language ISO code
	 * @memberof $wbLocal
	 */
	this.getLanguage = function(){
		return  this.language || 'en';
	};

	/**
	 * Sets language of the system
	 * 
	 * @params language {String} ISO code
	 * @memberof $wbLocal
	 */
	this.setLanguage = function(language) {
		this.language = language;
	};
	
	
    return this;
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $resource
 * @description Resource management system
 * 
 * This is a service to get resources. 
 * 
 */
.service('$resource', function($wbUi, $rootScope) {
	var CHILDREN_AUNCHOR = 'wb-select-resource-children';
	var resourcePages = {};
	/*
	 * Manages resource dialog
	 * @ngInject
	 */
	function wbResourceCtrl($scope,  $mdDialog, $wbUtil,
			$q, $controller, $compile, pages, style, data, $element, $window) {

		$scope.value = angular.copy(data);
		$scope.style = style;
		var currentScope = null;

		function hide() {
			$mdDialog.hide();
		}

		function cancel() {
			return $mdDialog.cancel();
		}

		/**
		 * Answer the dialog
		 * 
		 * If there is an answer function in the current page controller
		 * then the result of the answer function will be returned as 
		 * the main result.
		 * 
		 * @memberof WbResourceCtrl
		 */
		function answer() {
			$scope.loadingAnswer = true;
			var res = null;
			if(currentScope && angular.isFunction(currentScope.answer)){
				res =  $q.when(currentScope.answer())
				.then($mdDialog.hide);
			} else {
				res = $mdDialog.hide($scope.value);
			}
			return res.finally(function(){
				$scope.loadingAnswer = false;
			});
		}

		/*
		 * Sets value to the real var
		 */
		this.setValue = function(value){
			$scope.value = value;
		}

		/*
		 * Gets current value
		 */
		this.getValue = function(){
			return $scope.value;
		};
		
		/**
		 * encapsulate template srce with panel widget template.
		 * 
		 * @param page
		 *            setting page config
		 * @param tempateSrc
		 *            setting page html template
		 * @returns encapsulate html template
		 */
		function _encapsulatePanel(page, template) {
			// TODO: maso, 2017: pass all paramter to the setting
			// panel.
			return template;
		}

		/**
		 * تنظیمات را به عنوان تنظیم‌های جاری سیستم لود می‌کند.
		 * 
		 * @returns
		 */
		function loadPage(page) {
			var jobs = [];
			var pages2 = [];

			$scope._selectedIndex = pages.indexOf(page);

			// 1- Find element
			var target = $element.find('#' + CHILDREN_AUNCHOR);

			// 2- Clear childrens
			target.empty();
			currentScope = null;


			// 3- load pages
//			var page = pages[index];
			var template = $wbUtil.getTemplateFor(page);
			if (angular.isDefined(template)) {
				jobs.push($q.when(template).then(function(templateSrc) {
					templateSrc = _encapsulatePanel(page, templateSrc);
					var element = angular.element(templateSrc);
					var scope = $rootScope.$new(false, $scope);
					currentScope = scope;
					scope.page = page;
					scope.value = $scope.value;
					if (angular.isDefined(page.controller)) {
						var controller = $controller(page.controller, {
							$scope : scope,
							$element : element
						});
						if (page.controllerAs) {
							scope[page.controllerAs] = controller;
						}
					}
					$compile(element)(scope);
					pages2.push(element);
				}));
			}

			$q.all(jobs).then(function() {
				angular.forEach(pages2, function(element) {
					target.append(element);
				});
			});
		}

		if(angular.isFunction($window.openHelp)){
			$scope.openHelp = function($event){
				cancel().then(function(){
					$window.openHelp(pages[$scope._selectedIndex], $event);
				});
			};
		}

		$scope.pages = pages;

		$scope.loadPage = loadPage;

		$scope.hide = hide;
		$scope.cancel = cancel;
		$scope.answer = answer;

		if(pages.length){
			loadPage(pages[0]);
		}
		
		var ctrl = this;
		$scope.setValue = function(value){
			return ctrl.setValue(value);
		}
	}


	/**
	 * Fetches a page.
	 * 
	 * @param model
	 * @returns
	 */
	function page(type) {
		// TODO: maso, 2018: replace with not found resource
		var widget = null;
		if (type in resourcePages) {
			widget = resourcePages[type];
		}
		return widget;
	}

	/**
	 * Adds new page.
	 * 
	 * @returns
	 */
	function newPage(page) {
		resourcePages[page.type] = page;
	}

	/**
	 * Finds and lists all pages.
	 * 
	 * @returns
	 */
	function pages() {
		// TODO: maso, 1395:
	}

	/**
	 * Get a resource 
	 * 
	 * - option.data: current value of the date
	 * - option.style: style of the dialog (title, descritpion, image, ..)
	 * 
	 * @param tags
	 * @returns
	 */
	function get(tag, option){
		if(!option){
			option = {};
		}
		var pages = [];
		if(tag){
			angular.forEach(resourcePages, function(page) {
				if(angular.isArray(page.tags) && page.tags.includes(tag)){
					this.push(page);
				}
			}, pages);
		} else {
			pages = resourcePages;
		}
		var tmplUrl = pages.length > 1 ? 'views/dialogs/wb-select-resource.html' : 'views/dialogs/wb-select-resource-single-page.html';
		return $wbUi.openDialog({
			controller : wbResourceCtrl,
			templateUrl : tmplUrl,
			parent : angular.element(document.body),
			clickOutsideToClose : true,
			fullscreen : true,
			multiple:true,
			locals : {
				'pages' : pages,
				'style' : option.style || {
					title: tag
				},
				'data' : option.data
			}
		});
	}


	this.get = get;
	this.newPage = newPage;
	this.page = page;
	this.pages = pages;
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $widget
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$settings',function() {
	/*
	 * Default settings
	 */
	var WB_SETTINGS_GROUP_DEFAULT = [ 'general', 'transform', 'border',
		'background', 'layout', 'layout-self', 'marginPadding', 'size', 'shadow', 'SEO' ];
	var WB_SETTINGS_WIDGET_DEFAULT = [ 'general', 'transform', 'border',
		'background', 'marginPadding', 'layout-self', 'size', 'shadow', 'SEO' ];

	/**
	 * Setting page storage
	 * 
	 */
	var settingPages = {};
	var notFound = {
			label : 'Settings not found',
			templateUrl : 'views/settings/wb-notfound.html'
	};

	/**
	 * Fetchs a setting page.
	 * 
	 * @param model
	 * @returns
	 */
	function page(type) {
		var pageResult = notFound;
		if (type in settingPages) {
			pageResult = settingPages[type];
		}
		return pageResult;
	}

	/**
	 * Adds new setting page.
	 * 
	 * @returns
	 */
	function newPage(page) {
		settingPages[page.type] = page;
	}

	/**
	 * Finds and lists all setting pages.
	 * 
	 * @returns
	 */
	function pages() {
		// TODO: maso, 1395:
	}

	/**
	 * Defines default settings for widget
	 * 
	 * @param widget
	 * @returns
	 */
	function getSettingsFor(widget) {
		var widgetSettings = [];
		if (widget.type === 'Group') {
			widgetSettings = widgetSettings
			.concat(WB_SETTINGS_GROUP_DEFAULT);
		} else {
			widgetSettings = widgetSettings
			.concat(WB_SETTINGS_WIDGET_DEFAULT);
		}

		if (angular.isArray(widget.setting)) {
			widgetSettings = widgetSettings
			.concat(widget.setting);
		}
		return widgetSettings;
	}


	// تعیین سرویس‌ها
	this.page = page;
	this.getPage = page;
	this.getPages = pages;
	this.newPage = newPage;
	this.getSettingsFor = getSettingsFor;
});

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
 * @ngdoc Services
 * @name $wbUi
 * @description UI utilities management
 * 
 */
angular.module('am-wb-core')
.service('$wbUi', function($mdDialog, $q, $http) {

	var _templates = [];
	var service = this;


	/**
	 * Opens dialog
	 * @returns
	 */
	function openDialog(dialogData){
		return $mdDialog.show(dialogData);
	}


	/**
	 * Get list of registered templates
	 * 
	 * @memberof $wbUi
	 */
	function templates(){
		return $q.when({
			items: _templates
		});
	}

	/**
	 * Gets list of templates
	 */
	function getTemplates(){
		return _templates;
	}

	/**
	 * Adds new template
	 * 
	 * @memberof $wbUi
	 */
	function newTemplate(template){
		_templates.push(template);
		return service;
	}


	/**
	 * Load a template
	 * 
	 * @memberof $wbUi
	 */
	function loadTemplate(template){
		// TODO: maso, 2018: check if template is a function
		if(angular.isDefined(_templates.template)){
			return $q.when(JSON.parse(_templates.template));
		}
		return $http.get(template.templateUrl)
		.then(function(res){
			return res.data;
		});
	}
	
	service.openDialog = openDialog;
	service.templates = templates;
	service.getTemplates = getTemplates;
	service.newTemplate = newTemplate;
	service.loadTemplate = loadTemplate;
});

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
 * Utility class of WB
 */
angular.module('am-wb-core')
.service('$wbUtil', function ($q, $templateRequest, $sce) {
	'use strict';
	var REGEX_BACKGROUND_IMAGE_SPEC = RegExp('(repeating\-)?(linear|radial)\-(gradient)');
	var service = this;

	function cleanMap(oldStyle, newStyle, map) {
		for (var i = 0; i < map.length; i++) {
			if (oldStyle[map[i][0]]) {
				newStyle[map[i][1]] = oldStyle[map[i][0]];
				delete oldStyle[map[i][0]];
			}
		}
	}

	function getTemplateOf(page)
	{
		var template;
		var templateUrl;
		if (angular.isDefined(template = page.template)) {
			if (angular.isFunction(template)) {
				template = template(page.params);
			}
		} else if (angular
				.isDefined(templateUrl = page.templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(page.params);
			}
			if (angular.isDefined(templateUrl)) {
				page.loadedTemplateUrl = $sce.valueOf(templateUrl);
				template = $templateRequest(templateUrl);
			}
		}
		return template;
	}

	/**
	 * Loading template of the page
	 * 
	 * @name getTemplateFor
	 * @memberof $wbUtil
	 * @param page
	 *            {object} properties of a page, widget , ..
	 * @return promise to load template on resolve.
	 */
	function getTemplateFor(page)
	{
		return $q.when(getTemplateOf(page));
	}

	/**
	 * Converts data into a valid CSS attributes
	 */
	function convertToWidgetCss(style) {
		var style = style || {};
		var css = {};

		// layout
		if(style.visibility === 'hidden'){
			css.display = 'none';
		} else {
			css = _.merge(css, convertToWidgetCssLayout(style.layout || {}));
		}

		css = _.merge(css, 
				// size
				convertToWidgetCssSize(style.size || {}),
				// background
				convertToWidgetCssBackground(style.background || {}),
				// border
				convertToWidgetCssBoarder(style.border || {}),
				// shadows
				convertToWidgetCssShadows(style.shadows || {}),
				// transform
				convertToWidgetCssTransfrom(style.transform || {}),
				// Overflow
				convertToWidgetCssOverflow(style.overflow || {}),
				// color, cursor, opacity, direction
				{
					padding: style.padding,
					margin: style.margin,
					direction: style.direction || 'ltr',
					color: style.color || 'initial',
					cursor: style.cursor || 'auto',
					opacity: style.opacity || '1',
				});

		return css;
	}

	function convertToWidgetCssOverflow(overflowOption) {
		return {
			'overflow-x': overflowOption.x || 'visible',
			'overflow-y': overflowOption.y || 'visible'
		};
	}

	function convertToWidgetCssTransfrom(transformOptions) {
		var transform = '';

		if(transformOptions.x){
			var x = transformOptions.x;
			if(x.rotate){
				transform += ' rotateX('+x.rotate+')';
			}
			if(x.translate){
				transform  += ' translateX('+x.translate+')';
			}
			if(x.scale){
				transform += ' scaleX('+ x.scale+')';
			}
			if(x.skew){
				transform += ' skewX('+ x.skew+')';
			}
		}
		if(transformOptions.y){
			var y = transformOptions.y;
			if(y.rotate){
				transform += ' rotateY('+y.rotate+')';
			}
			if(y.translate){
				transform += ' translateY('+y.translate+')';
			}
			if(y.scale){
				transform += ' scaleY('+y.scale+')';
			}
			if(y.skew){
				transform += ' skewY('+y.skew+')';
			}
		}
		if(transformOptions.z){
			var z = transformOptions.z;
			if(z.rotate){
				transform += ' rotateZ('+z.rotate+')';
			}
			if(z.translate){
				transform += ' translateZ('+z.translate+')';
			}
			if(z.scale){
				transform += ' scaleZ('+z.scale+')';
			}
		}

		if(transformOptions.perspective){
			transform += ' perspective('+transformOptions.perspective+')';
		}

		if(!transform) {
			return {
				transform: 'none'
			};
		}

		return {
			transform: transform,
			'transform-origin': transformOptions.origin || 'center',
			'transform-style': transformOptions.style || 'flat'
		};
	};

	function createShadowStr(shadow) {
		var hShift = shadow.hShift || '0px';
		var vShift = shadow.vShift || '0px';
		var blur = shadow.blur || '0px';
		var spread = shadow.spread || '0px';
		var color = shadow.color || 'black';

		var boxShadow = hShift + ' ' + vShift + ' ' + blur + ' ' + spread + ' ' + color;

		if(shadow.inset) {
			boxShadow = boxShadow.concat(' ' + 'inset');
		}

		return boxShadow;
	}

	function convertToWidgetCssShadows(shadows) {
		var shadowStr = '';

		if (!angular.isArray(shadows) || shadows.length === 0) {
			shadowStr = 'none';
		} else {
			angular.forEach(shadows, function (shadow, index) {
				shadowStr += createShadowStr(shadow);
				if(index + 1 < shadows.length){
					shadowStr += ', ';
				}
			});
		}

		return {
			'box-shadow': shadowStr
		};
	}

	function convertToWidgetCssBoarder(style) {
		var conf = {};
		if (style.style) {
			conf['border-style'] = style.style;
		}
		if (style.width) {
			conf['border-width'] = style.width;
		}
		if (style.color) {
			conf['border-color'] = style.color;
		}
		if (style.radius) {
			conf['border-radius'] = style.radius;
		}

		return conf;
	}

	function convertToWidgetCssBackground(style){
		var cssValue = {};
		if(style.background){
			cssValue.background = style.background;
			return;
		}
		// image
		var image = 'none';
		if(style.image){
			if(REGEX_BACKGROUND_IMAGE_SPEC.test(style.image)){
				image = style.image;
			} else {
				image = 'url(\''+style.image+'\')';
			}
		}

		cssValue['background-image'] = image;
		cssValue['background-color'] = style.color || 'initial';
		cssValue['background-size'] = style.size || 'auto';
		cssValue['background-repeat'] = style.repeat || 'repeat';
		cssValue['background-position'] = style.position || '0px 0px';
		cssValue['background-attachment'] = style.attachment || 'scroll';
		cssValue['background-origin'] = style.origin || 'padding-box';
		cssValue['background-clip'] = style.clip || 'border-box';

		return cssValue;
	}

	/**
	 * Converts data into a layout CSS3
	 */
	function convertToWidgetCssLayout(layout){
		var flexLayout = {};
		/*
		 * Group
		 * 
		 * check if is group apply flex flow
		 */
		{
			flexLayout.display = 'flex';
			// row
			if (layout.direction === 'row') {
				flexLayout['flex-direction'] = layout.direction_reverse ? 'row-reverse' : 'row';
				flexLayout['overflow-x'] = layout.wrap ? 'visible' : 'auto';
				flexLayout['overflow-y'] = 'visible';
			} else {
				flexLayout['flex-direction'] = layout.direction_reverse ? 'column-reverse' : 'column';
				flexLayout['overflow-x'] = 'visible';
				flexLayout['overflow-y'] = layout.wrap ? 'visible' : 'auto';
			}


			// wrap
			if (layout.wrap) {
				flexLayout['flex-wrap'] = layout.wrap_reverse ? 'wrap-reverse' : 'wrap';
				// wrap align
				var alignContent;
				switch (layout.wrap_align) {
				case 'start':
					alignContent = 'flex-start';
					break;
				case 'end':
					alignContent = 'flex-end';
					break;
				case 'center':
					alignContent = 'center';
					break;
				case 'space-between':
					alignContent = 'space-between';
					break;
				case 'space-around':
					alignContent = 'space-around';
					break;
				case 'stretch':
					alignContent = 'stretch';
					break;
				default:
					alignContent = 'stretch';
				}
				flexLayout['align-content'] = alignContent;
			} else {
				flexLayout['flex-wrap'] = 'nowrap';
			}


			// justify
			var justify;
			switch (layout.justify) {
			case 'start':
				justify = 'flex-start';
				break;
			case 'end':
				justify = 'flex-end';
				break;
			case 'center':
				justify = 'center';
				break;
			case 'space-between':
				justify = 'space-between';
				break;
			case 'space-around':
				justify = 'space-around';
				break;
			case 'space-evenly':
				justify = 'space-evenly';
				break;
			default:
				justify = 'flex-start';
			}
			flexLayout['justify-content'] = justify;

			// align
			var align;
			switch (layout.align) {
			case 'start':
				align = 'flex-start';
				break;
			case 'end':
				align = 'flex-end';
				break;
			case 'center':
				align = 'center';
				break;
			case 'baseline':
				align = 'baseline';
				break;
			case 'stretch':
				align = 'stretch';
				break;
			default:
				align = 'stretch';
			}
			flexLayout['align-items'] = align;
		}

		/*
		 * Widget
		 */
		{
			flexLayout.order = layout.order >= 0 ? layout.order : 0;
			flexLayout['flex-grow'] = layout.grow >= 0 ? layout.grow : 0;
			flexLayout['flex-shrink'] = layout.shrink >= 0 ? layout.shrink : 1;
			flexLayout['flex-basis'] = layout.basis || 'auto';

			// align-self
			// auto | flex-start | flex-end | center | baseline | stretch;
			var alignSelf;
			switch (layout.align_self) {
			case 'start':
				alignSelf = 'flex-start';
				break;
			case 'end':
				alignSelf = 'flex-end';
				break;
			case 'center':
				alignSelf = 'center';
				break;
			case 'baseline':
				alignSelf = 'baseline';
				break;
			case 'stretch':
				alignSelf = 'stretch';
				break;
			default:
				alignSelf = 'auto';
			}
			flexLayout['align-self'] = alignSelf;
		}

		return flexLayout;
	}
	
	/*
	 * Convert size object to valid CSS size
	 */
	function convertToWidgetCssSize(size) {
	    return {
	        'width': size.width || 'auto',
	        'min-width': size.minWidth || '0',
	        'max-width': size.maxWidth || 'none',
	        
	        'height': size.height || 'auto',
	        'min-height': size.minHeight || '0',
	        'max-height': size.maxHeight || 'none',
	    };
	}

	function cleanEvetns(model)
	{
		// event
		if (!model.event) {
			model.event = {};
		}
	}

	function cleanLayout(model)
	{
		if (!model.style.layout) {
			model.style.layout = {};
		}
		if (model.type === 'Group' || model.type === 'Page') {
			// convert
			var newStyle = model.style.layout;
			var oldStyle = model.style;

			if (oldStyle.flexDirection) {
				if (oldStyle.flexDirection === 'wb-flex-row') {
					newStyle.direction = 'row';
				} else {
					newStyle.direction = 'column';
				}
				delete oldStyle.flexDirection;
			}
			if (!newStyle.direction) {
				newStyle.direction = 'column';
			}

			switch (oldStyle.flexAlignItem) {
			case 'wb-flex-align-items-center':
				newStyle.align = 'center';
				break;
			case 'wb-flex-align-items-end':
				newStyle.align = 'end';
				break;
			case 'wb-flex-align-items-start':
				newStyle.align = 'start';
				break;
			case 'wb-flex-align-items-stretch':
				newStyle.align = 'stretch';
				break;
			default:
				newStyle.align = 'stretch';
			}
			delete oldStyle.flexAlignItem;

			switch (oldStyle.justifyContent) {
			case 'wb-flex-justify-content-center':
				newStyle.justify = 'center';
				break;
			case 'wb-flex-justify-content-end':
				newStyle.justify = 'end';
				break;
			case 'wb-flex-justify-content-start':
				newStyle.justify = 'start';
				break;
			case 'wb-flex-justify-content-space-between':
				newStyle.justify = 'space-between';
				break;
			case 'wb-flex-justify-content-space-around':
				newStyle.justify = 'space-around';
				break;
			default:
				newStyle.justify = 'center';
			}
			delete oldStyle.justifyContent;
		}
	}

	function cleanSize(model)
	{
		if (!model.style.size) {
			model.style.size = {};
		}
		var newStyle = model.style.size;
		var oldStyle = model.style;
		var map = [['width', 'width'],
			['height', 'height']];
		cleanMap(oldStyle, newStyle, map);
	}

	function cleanBackground(model)
	{
		if (!model.style.background) {
			model.style.background = {};
		}
		var newStyle = model.style.background;
		var oldStyle = model.style;
		var map = [['backgroundImage', 'image'],
			['backgroundColor', 'color'],
			['backgroundSize', 'size'],
			['backgroundRepeat', 'repeat'],
			['backgroundPosition', 'position']];
		cleanMap(oldStyle, newStyle, map);
	}

	function cleanBorder(model)
	{
		if (!model.style.border) {
			model.style.border = {};
		}
		var oldStyle = model.style;
		var newStyle = model.style.border;

		if (oldStyle.borderRadius) {
			if (oldStyle.borderRadius.uniform) {
				newStyle.radius = oldStyle.borderRadius.all + 'px';
			}
			// TODO: maso, 2018: support other models
		}
		// delete old values
		delete model.style.borderColor;
		delete model.style.borderRadius;
		delete model.style.borderStyleColorWidth;
		delete model.style.borderStyle;
		delete model.style.borderWidth;
	}

	function cleanSpace(model)
	{
		// Margin and padding
		if (model.style.padding && angular.isObject(model.style.padding)) {
			var padding = '';
			if (model.style.padding.isUniform) {
				padding = model.style.padding.uniform;
			} else {
				padding = model.style.padding.top || '0px' + ' ' +
				model.style.padding.right || '0px' + ' ' +
				model.style.padding.bottom || '0px' + ' ' +
				model.style.padding.left || '0px' + ' ';
			}
			model.style.padding = padding;
		}

		if (model.style.margin && angular.isObject(model.style.margin)) {
			var margin = '';
			if (model.style.margin.isUniform) {
				margin = model.style.margin.uniform;
			} else {
				margin = model.style.margin.top || '0px' + ' ' +
				model.style.margin.right || '0px' + ' ' +
				model.style.margin.bottom || '0px' + ' ' +
				model.style.margin.left || '0px' + ' ';
			}
			model.style.margin = margin;
		}

	}

	function cleanAlign(model)
	{
		if (!model.style.align) {
			model.style.align = {};
		}
	}

	function cleanStyle(model)
	{
		if (!model.style) {
			model.style = {};
		}
		cleanLayout(model);
		cleanSize(model);
		cleanBackground(model);
		cleanBorder(model);
		cleanSpace(model);
		cleanAlign(model);
	}

	function cleanInternal(model)
	{
		cleanEvetns(model);
		cleanStyle(model);
		if (model.type === 'Group' || model.type === 'Page') {
			if (!model.contents) {
				model.contents = [];
			}
			if (model.contents.length) {
				for (var i = 0; i < model.contents.length; i++) {
					cleanInternal(model.contents[i]);
				}
			}
		}
		return model;
	}

	/**
	 * Clean data model
	 * @name clean 
	 * @param {object} model 
	 * @param {type} force
	 */
	function clean(model, force)
	{
		if (!model.type || model.type === 'Page') {
			model.type = 'Group';
		}
		if (model.version === 'wb1' && !force) {
			return model;
		}
		var newModel = cleanInternal(model);
		newModel.version = 'wb1';
		return newModel;
	}

	service.cleanMap = cleanMap;
	service.clean = clean;
	service.cleanInternal = cleanInternal;
	service.cleanStyle = cleanStyle;
	service.cleanAlign = cleanAlign;
	service.cleanSpace = cleanSpace;
	service.cleanBorder = cleanBorder;
	service.cleanBackground = cleanBackground;
	service.cleanSize = cleanSize;
	service.cleanLayout = cleanLayout;
	service.cleanEvetns = cleanEvetns;

	service.getTemplateFor = getTemplateFor;
	service.getTemplateOf = getTemplateOf;
	service.convertToWidgetCss = convertToWidgetCss;
	service.convertToWidgetCssLayout = convertToWidgetCssLayout;
});

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

angular.module('am-wb-core')

/**
 * @ngdoc Services
 * @name $widget
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
.service('$widget', function(
        $wbUtil, $rootScope,
        $q, $sce, $templateRequest, $compile, $controller, $mdTheming) {


    this.providers =  {};
    var _group_repo = [];
    var contentElementAsso = [];
    var elementKey = [];
    var service = this;

    var notFoundWidget = {
            templateUrl : 'views/widgets/wb-notfound.html',
            label : 'Not found',
            description : 'Element not found'
    };
    var container = {
            type : 'Page',
            label : 'Page',
            description : 'Panel contains list of widgets.',
            image : 'images/wb/content.svg'
    };

    function _group(groupId){
        for(var i = 0; i < _group_repo.length; i++){
            if(_group_repo[i].id === groupId){
                return _group_repo[i];
            }
        }
        var group = {
                id: groupId
        };
        _group_repo.push(group);
        return group;
    }

    function _newGroup(group){
        var g = _group(group.id);
        angular.extend(g, group);
    }

    function _groups(){
        return _group_repo;
    }

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
     * @memberof $widget
     * @param model to find a widget
     * @returns promise to find a widget
     */
    function widget(model) {
        return $q.when(_widget(model));
    }

    /**
     * Returns list of all registerd widgets.
     * 
     * @memberof $widget
     * @returns promise to load all widgets
     */
    function widgets() {
        var widgets = {};
        // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
        widgets.items = [];
        elementKey.forEach(function(type) {
            widgets.items.push(contentElementAsso[type]);
        });
        return $q.when(widgets);
    }

    /**
     * List of all registered widgets
     * 
     * @memberof $widget
     * @returns keys {array} list of all keys
     */
    function getWidgetsKey(){
        return elementKey;
    }

    /**
     * Registers new widget
     * 
     * The old widget will be override if a new widget with the same type is registered.
     * 
     * @See the following page for more information:
     * 
     *    https://gitlab.com/weburger/angular-material-weburger/wikis/create-new-widget
     *    
     * 
     * @memberof $widget
     * @param widget to add
     * @return the service
     */
    function newWidget(widget) {
        if (widget.type in contentElementAsso) {
            // TODO: maso, 2017: Add log for duplication
        }
        // fix widget data
        widget.model = widget.model || {style:{}};
        widget.model.type = widget.type;
        widget.model.name = widget.model.name || widget.title; 

        contentElementAsso[widget.type] = widget;
        elementKey.push(widget.type);
        return service;
    }

    /**
     * Compile element 
     * 
     * @name show
     * @memberof $widget
     * @param model
     *            {object}
     *            <ul>
     *            <li>templateUrl - {string=}: The URL of a template that will
     *            be used as the content of the dialog.</li>
     *            <li>template- {string=}: HTML template to show in the dialog.
     *            This must be trusted HTML with respect to Angular's $sce
     *            service. This template should never be constructed with any
     *            kind of user input or user data.</li>
     *            <li>contentElement:</li>
     *            <li>scope - {object=}: the scope to link the template
     *            controller to. If none is specified, it will create a new
     *            isolate scope. This scope will be destroyed when the dialog is
     *            removed unless preserveScope is set to true.</li>
     *            <li>controller - {function|string=}: The controller to
     *            associate with the dialog. The controller will be injected
     *            with the local $mdDialog, which passes along a scope for the
     *            dialog.</li>
     *            <li>controllerAs - {string=}: An alias to assign the
     *            controller to on the scope.</li>
     *            <li>parent - {element=}: The element to append the dialog to.
     *            Defaults to appending to the root element of the application.</li>
     *            </ul>
     * @param parentWidget
     *     {WbWidget} the parent
     * @param preElement {Element} pre build element
     * @return promise A promise that resolve created element
     */
    function compile(model, parentWidget, preElement){
        var widget = _widget(model);
        var childScope = null;

        // 1- create scope
        var parentScope;
        if(parentWidget){
            parentScope = parentWidget.getScope()
        } else {
            // this is a root widget
            parentScope = $rootScope;
        }
        childScope = parentScope.$new(false, parentScope);

        // 2- create element
        var service = this;

        var gettingTemplatePromisse;
        if(preElement){
            gettingTemplatePromisse = $q.resolve(preElement);
        } else {
            gettingTemplatePromisse = $wbUtil.getTemplateFor(widget)
            .then(function(template) {
                if (model.type !== 'Group') {
                    template = '<div class="wb-widget" name="{{wbModel.name}}" '+

                    'dnd-disable-if="!ctrl.isEditable()" '+
                    'dnd-draggable="wbModel" '+
                    'dnd-type="wbModel.type" '+
                    'dnd-effect-allowed="copyMove" '+
                    'dnd-callback="1" '+

                    'dnd-moved="ctrl.delete()" '+

                    'md-theme-watch="true">' + template + '</div>';
                }

                // 3- bind controller
                return angular.element(template);
            });
        }
        return gettingTemplatePromisse.then(function(element){
            var link = $compile(element);
            var wlocals = _.merge({
                $scope : childScope,
                $element : element,
            }, service.providers);
            var ctrl;
            if (model.type !== 'Group') {
                ctrl = $controller('WbWidgetCtrl', wlocals);
            } else {
                ctrl = $controller('WbWidgetGroupCtrl', wlocals);
            }
            ctrl.setParent(parentWidget);

            // NOTE: can inject widget controller as WidgetCtrl
            wlocals.WidgetCtrl = ctrl;
            wlocals.$parent = parentWidget;
            // extend element controller
            if (angular.isDefined(widget.controller)) {
                angular.extend(ctrl, $controller(widget.controller, wlocals));
            }

            ctrl.setModel(model);
            childScope[widget.controllerAs || 'ctrl'] = ctrl;

            // bind ctrl
            element.data('$ngControllerController', ctrl);
            link(childScope);
            $mdTheming(element);

            // return widget
            if(angular.isFunction(ctrl.initWidget)){
                ctrl.initWidget();
            }
            return ctrl;
        });
    }

    /**
     * Creates new serialized data of widget
     * 
     * @memberof $widget
     * @param widget
     * @returns
     */
    function widgetData(widget){
        return angular.copy(widget.model);
    }

    // widgets
    service.newWidget = newWidget;
    service.widget = widget;
    service.widgets = widgets;
    service.widgetData = widgetData;
    service.getWidgetsKey = getWidgetsKey;

    // new api
    service.getWidget = _widget;
    service.getWidgets =  function(){
        var widgets = {};
        // XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
        widgets.items = [];
        elementKey.forEach(function(type) {
            widgets.items.push(contentElementAsso[type]);
        });
        return widgets;
    };

    // widget groups
    service.group = _group;
    service.groups = _groups;
    service.newGroup = _newGroup;

    // utils
    service.compile = compile;

    /**
     * Gets list of all children from the widget
     * 
     * The list is consist of all children and sub-children from the given 
     * widget.
     * 
     * @params widget {AbstractWidgetCtrl} the widget
     * @return List of widgets
     * @memberof $widget
     */
    this.getChildren = function(widget) {
        // Check if it is group
        var widgets = [];
        if(!angular.isDefined(widget) || widget.getType() !== 'Group') {
            return widgets;
        }

        // load list of widgets
        var groups = [];
        groups.push(widget);
        while(groups.length) {
            widget = groups.pop();
            var children = widget.getChildren();
            for(var i = 0; i < children.length; i++) {
                var child = children[i];
                widgets.push(child);
                if(child.getType() === 'Group') {
                    groups.push(child);
                }
            }
        }

        //return the list
        return widgets;
    }


    this.addProvider = function(key, value) {
        this.providers[key] = value;
    };


    // Returns a function, that, as long as it continues to be invoked, will not
    // be triggered. The function will be called after it stops being called for
    // N milliseconds. If `immediate` is passed, trigger the function on the
    // leading edge, instead of the trailing.
    this.debounce = function (func, wait, immediate) {
        var timeout;
        return function() {
            var context = this;
            var args = arguments;
            var later = function() {
                timeout = null;
                if (!immediate) {
                    func.apply(context, args);
                }
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) {
                func.apply(context, args);
            }
        };
    };
});

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

angular.module('am-wb-core')
/**
 * @ngdoc Services
 * @name $wbWindow
 * @description The main window manager
 * 
 */
.service('$wbWindow', function($window, NativeWindowWrapper) {
    'use strict';
    var currentWindow = new NativeWindowWrapper($window);
    return currentWindow;
});

angular.module('am-wb-core').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/wb-select-resource-single-page.html',
    "<md-dialog aria-label=\"Select item/items\" style=\"width:50%; height:70%\"> <form ng-cloak layout=column flex> <md-dialog-content mb-preloading=loadingAnswer flex layout=row> <div layout=column flex> <div id=wb-select-resource-children style=\"margin: 0px; padding: 0px; overflow: auto\" layout=column flex> </div> </div> </md-dialog-content> <md-dialog-actions layout=row>       <span flex></span> <md-button ng-click=cancel() aria-label=Cancel> <span translate=\"\">Close</span> </md-button> <md-button class=md-primary aria-label=Done ng-click=answer()> <span translate=\"\">Ok</span> </md-button> </md-dialog-actions> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/wb-select-resource.html',
    "<md-dialog aria-label=\"Select item/items\" style=\"width:70%; height:70%\"> <form ng-cloak layout=column flex> <md-dialog-content mb-preloading=loadingAnswer flex layout=row> <md-sidenav class=md-sidenav-left md-component-id=left md-is-locked-open=true md-whiteframe=4 layout=column ng-hide=\"pages.length === 1\"> <div style=\"text-align: center\"> <wb-icon size=64px ng-if=style.icon>{{style.icon}}</wb-icon> <h2 style=\"text-align: center\" translate>{{style.title}}</h2> <p style=\"text-align: center\" translate>{{style.description}}</p> </div> <md-devider></md-devider> <md-content> <md-list style=\"padding:0px; margin: 0px\"> <md-list-item ng-repeat=\"page in pages | orderBy:priority\" ng-click=\"loadPage(page, $event);\" md-colors=\"_selectedIndex===$index ? {background:'accent'} : {}\"> <wb-icon>{{page.icon || 'attachment'}}</wb-icon> <p>{{page.label | translate}}</p> </md-list-item> </md-list> </md-content> </md-sidenav> <div layout=column flex> <div id=wb-select-resource-children style=\"margin: 0px; padding: 0px; overflow: auto\" layout=column flex> </div> </div> </md-dialog-content> <md-dialog-actions layout=row> <span flex></span> <md-button aria-label=Cancel ng-click=cancel()> <span translate=\"\">Close</span> </md-button> <md-button class=md-primary aria-label=Done ng-click=answer()> <span translate=\"\">Ok</span> </md-button> </md-dialog-actions> </form> </md-dialog>"
  );


  $templateCache.put('views/directives/wb-event-panel.html',
    "<table class=mb-table style=\"font-size: 10px\"> <thead> <tr md-colors=\"{color: 'primary-700'}\"> <td translate=\"\">Name</td> <td translate=\"\">Code</td> <td></td> </tr> </thead> <tbody> <tr ng-repeat=\"event in events track by $index\"> <td ng-click=\"ctrl.editEvent(event, $event)\" style=\"cursor: pointer\">{{event.title}} </td> <td style=\"cursor: pointer\">{{event.code| limitTo:13 }} ...</td> <td align=center style=\"cursor: pointer;min-height: 22px\"> <md-button style=\"min-height: 20px;height: 20px;margin: 0px;line-height: 20px;padding: 0px\" ng-if=event.code ng-click=\"ctrl.deleteEvent(event, $event)\" class=md-icon-button> <wb-icon>delete</wb-icon> </md-button> </td> </tr> </tbody> </table>"
  );


  $templateCache.put('views/directives/wb-setting-panel-expansion.html',
    "<div id=WB-SETTING-PANEL> <md-expansion-panel ng-repeat=\"setting in settings| orderBy:priority track by setting.type\" ng-show=setting.visible> <md-expansion-panel-collapsed> <div class=md-title>{{setting.label}}</div> </md-expansion-panel-collapsed> <md-expansion-panel-expanded> <md-expansion-panel-header ng-click=$panel.collapse()> <div class=md-title>{{setting.label}}</div> <div class=md-summary>{{setting.description}}</div> </md-expansion-panel-header> <md-expansion-panel-content layout=column style=\"padding: 2px\"> <wb-setting-page ng-model=wbModel wb-type={{setting.type}}> </wb-setting-page> </md-expansion-panel-content> </md-expansion-panel-expanded> </md-expansion-panel> </div>"
  );


  $templateCache.put('views/directives/wb-setting-panel-tabs.html',
    "<div id=am-wb-widget-setting> <md-tabs md-dynamic-height md-border-bottom> <md-tab ng-repeat=\"setting in settings| orderBy:priority track by setting.type\" ng-disabled=!setting.visible id={{setting.key}}> <md-tab-label> <span ng-if=!setting.icon translate=\"\">{{setting.label}}</span> <wb-icon ng-if=setting.icon>{{setting.icon}}</wb-icon> </md-tab-label> <md-tab-body layout-margin> <wb-setting-page ng-model=wbModel wb-type={{setting.type}}> </wb-setting-page> </md-tab-body> </md-tab> </md-tabs> </div>"
  );


  $templateCache.put('views/directives/wb-ui-choose.html',
    "<md-tabs class=wb-tab-as-choose-button md-selected=ctrl.selectedIndex ng-change=ctrl.tabChanged(selectedIndex)> <md-tab ng-repeat=\"item in items\"> <md-tab-label> <wb-icon>{{item.icon}}</wb-icon> </md-tab-label> </md-tab> </md-tabs>"
  );


  $templateCache.put('views/directives/wb-ui-setting-audio.html',
    "<md-list-item> <md-button class=md-icon-button aria-label=Edit ng-click=ctrl.editValue(value)> <wb-icon>wb-object-audio</wb-icon> </md-button> <md-input-container> <input ng-model=value ng-change=ctrl.updateValue(value)> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background-attachment.html',
    "<md-input-container> <label translate=\"\">Background attachment</label> <md-select ng-model=attachment ng-change=attachmentChanged(attachment)> <md-option ng-repeat=\"item in items\" value={{item.value}} translate=\"\">{{item.name}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background-origin.html',
    "<md-input-container> <label translate=\"\">Background origin</label> <md-select ng-model=origin ng-change=originChanged(origin)> <md-option ng-repeat=\"item in items\" value={{item.value}} translate=\"\">{{item.name}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background-position.html',
    "<md-input-container> <label translate=\"\">Background position</label> <md-select ng-model=position ng-change=positionChanged(position)> <md-option ng-repeat=\"item in items\" value={{item.value}} translate=\"\">{{item.title}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background-repeat.html',
    "<md-input-container> <label translate=\"\">Background repeat</label> <md-select ng-model=repeat ng-change=repeatChanged(repeat)> <md-option ng-repeat=\"item in items\" value={{item.value}} translate=\"\">{{item.name}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background-size.html',
    "<md-input-container> <label translate=\"\">Background Size</label> <md-select ng-model=size ng-change=sizeChanged(size)> <md-option ng-repeat=\"item in items\" value={{item.value}} translate=\"\">{{item.name}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-background.html',
    "<md-input-container> <label translate=\"\">Background Size</label> <md-select ng-model=value> <md-option ng-repeat=\"value in items\" value={{value.value}} translate=\"\">{{value.name}}</md-option> </md-select> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-choose.html',
    "<div layout=row> <div layout=row> <wb-icon ng-if=icon wb-icon-name={{::icon}}> </wb-icon> <p ng-if=title translate>{{::title}}</p> </div> <md-tabs flex class=wb-tab-as-choose-button md-selected=selectedIndex> <md-tab ng-repeat=\"item in ::xitems\" md-on-select=selectionChanged()> <md-tab-label> <md-tooltip ng-if=::item.title md-delay=1500> <span translate>{{::item.title}}</span> </md-tooltip> <wb-icon wb-icon-name={{::item.icon}}></wb-icon> </md-tab-label> </md-tab> </md-tabs> </div>"
  );


  $templateCache.put('views/directives/wb-ui-setting-color.html',
    "<div layout=row> <wb-icon ng-if=icon layout-padding>{{icon}} </wb-icon> <div md-color-picker ng-model=valueColor ng-change=colorChanged(valueColor) label={{title}} default random=true md-color-clear-button=true md-color-generic-palette=false md-color-history=false flex> </div> </div>"
  );


  $templateCache.put('views/directives/wb-ui-setting-data.html',
    "<md-list-item> <md-button class=md-icon-button aria-label=Edit ng-click=edit(value)> <wb-icon>{{icon || 'wb-object-data'}}</wb-icon> </md-button> <md-input-container> <input ng-model=value.key> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-dropdown-value.html',
    " <md-list-item> <wb-icon ng-hide=\"icon===undefined || icon===null || icon===''\">{{icon}}</wb-icon> <p ng-hide=\"title===undefined || title===null || title===''\">{{title}}</p> <md-select style=\"margin: 0px\" ng-model=value> <md-option ng-repeat=\"item in items\" ng-value=item.value> {{item.title}} </md-option> </md-select> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-dropdown.html',
    "<div layout=row> <wb-icon ng-show=icon>{{::icon}}</wb-icon> <p style=\"margin: 0px 4px\" ng-show=title>{{::title}}</p> <md-select style=\"margin: 0px\" ng-model=value ng-change=valueChanged(value) flex> <md-option ng-repeat=\"item in items track by $index\" value={{::item.value}}> <span translate>{{::item.title}}</span> </md-option> </md-select> </div>"
  );


  $templateCache.put('views/directives/wb-ui-setting-image.html',
    "<div class=\"wb-ui-setting-image wb-ui-setting-image-container\" layout=row> <div class=wb-ui-setting-image-preview ng-click=ctrl.showImagePicker($event) ng-if=wbUiSettingPreview> <img ng-if=ctrl.value class=wb-ui-setting-image-result ng-src=\"{{ctrl.value}}\"> </div> <md-input-container class=md-icon-float flex> <label ng-if=title> <span translate=\"\">{{title}}</span> </label> <input type=input ng-model=ctrl.value ng-change=ctrl.setValue(ctrl.value) class=wb-ui-setting-image-input ng-mousedown=\"(openOnInput || !wbUiSettingPreview) && ctrl.showImagePicker($event)\"> </md-input-container> <md-button class=\"md-icon-button wb-ui-setting-image-clear\" ng-if=\"wbUiSettingClearButton && ctrl.value\" ng-click=ctrl.clearValue($event) aria-label=\"Clear image\"> <md-icon md-svg-icon=clear.svg></md-icon> </md-button> </div>"
  );


  $templateCache.put('views/directives/wb-ui-setting-length.html',
    " <div layout=row layout-align=\"end center\"> <wb-icon ng-if=icon>{{icon}}</wb-icon> <md-tooltip ng-if=description md-delay=1500> <span translate>{{::description}}</span> </md-tooltip> <span flex ng-if=title translate>{{::title}}</span> <md-input-container ng-show=ctrl.isNumerical() style=\"margin:0px; padding:0px; width:60px; height:30px\"> <input type=number ng-model=internalValue ng-change=\"updateLength(internalUnit, internalValue)\"> </md-input-container> <md-input-container style=\"margin:0px; padding:0px; width:80px; height:30px\"> <md-select style=max-width:75px ng-model=internalUnit ng-change=\"updateLength(internalUnit, internalValue)\"> <md-option ng-repeat=\"type in ::types track by $index\" value={{::type}}> <span translate>{{::type}}</span> </md-option> </md-select> </md-input-container> </div>             "
  );


  $templateCache.put('views/directives/wb-ui-setting-link.html',
    "<md-input-container class=md-icon-float> <lable ng-if=title translate>{{::title}}</lable> <input ng-model=url ng-change=urlChanged(url)> <wb-icon ng-click=ctrl.selectlink()>more_horiz</wb-icon> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-ui-setting-number.html',
    "<md-list-item ng-show=\"slider==undefined\"> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null  || title==''\">{{title}}</p> <md-input-container style=\"margin: 0px\"> <input style=\"width: 50px\" type=number ng-model=value ng-change=valueChanged(value) flex> </md-input-container> </md-list-item> <md-list-item ng-show=\"slider!=undefined\"> <wb-icon ng-hide=\"icon==undefined || icon==null || icon=='' || icon=='wb-blank'\">{{icon}}</wb-icon> <div ng-show=\"icon=='wb-blank'\" style=\"display: inline-block; width: 32px; opacity: 0.0\"></div> <p ng-hide=\"title==undefined || title==null || title==''\">{{title}}</p> <md-slider min=0 max=100 ng-model=value ng-change=valueChanged(value) flex></md-slider> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-on-off-switch.html',
    "<md-list-item> <wb-icon ng-show=icon>{{icon}}</wb-icon> <p ng-show=title>{{title}}</p> <md-switch class=md-secondary ng-model=value ng-change=valueChanged(value)> </md-switch> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-text.html',
    "<md-list-item> <wb-icon ng-hide=\"icon==undefined || icon==null || icon==''\">{{icon}}</wb-icon> <p ng-hide=\"title==undefined || title==null  || title==''\">{{title}}</p> <md-input-container style=\"margin: 0px\"> <input style=\"width: 200px\" ng-model=value flex> </md-input-container> </md-list-item>"
  );


  $templateCache.put('views/directives/wb-ui-setting-video.html',
    "<md-input-container class=\"md-icon-float md-icon-right md-block\"> <label>{{::title}}</label> <wb-icon ng-click=ctrl.selectValue()>wb-object-video</wb-icon> <input ng-model=value ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.changeValue(value)> <wb-icon ng-click=ctrl.clearValue()>close</wb-icon> </md-input-container>"
  );


  $templateCache.put('views/directives/wb-widgets-explorer.html',
    "<div layout=column>  <md-toolbar ng-show=!(showSearch||showSort||showState)> <div class=md-toolbar-tools> <h3 flex translate>Widgets</h3> <md-button class=md-icon-button aria-label=Search ng-click=\"showSearch = !showSearch\"> <wb-icon>search</wb-icon> </md-button> <md-divider></md-divider> <md-button ng-click=\"wbWidgetExplorer._view_list=!wbWidgetExplorer._view_list\" class=md-icon-button aria-label=\"View mode\"> <wb-icon>{{wbWidgetExplorer._view_list ? 'view_module' : 'view_list'}}</wb-icon> </md-button> <md-button ng-click=\"wbWidgetExplorer._tree_mode=!wbWidgetExplorer._tree_mode\" class=md-icon-button aria-label=\"Tree mode\"> <wb-icon>{{wbWidgetExplorer._tree_mode? 'list' : 'list_tree'}}</wb-icon> </md-button> </div> </md-toolbar>  <md-toolbar class=md-hue-1 ng-show=showSearch> <div class=md-toolbar-tools> <md-button class=md-icon-button ng-click=\"showSearch = !showSearch\" aria-label=Back> <wb-icon>arrow_back</wb-icon> </md-button> <md-input-container md-theme=input flex> <label>&nbsp;</label> <input ng-model=query ng-keyup=\"runQuery(query, $event)\"> </md-input-container> <md-button class=md-icon-button aria-label=Search ng-click=\"showSearch = !showSearch\"> <wb-icon>search</wb-icon> </md-button> </div> </md-toolbar> <md-content> <md-expansion-panel-group ng-if=wbWidgetExplorer._tree_mode> <md-expansion-panel ng-repeat=\"group in groups\"> <md-expansion-panel-collapsed> <span translate>{{group.title || group.id}}</span> </md-expansion-panel-collapsed> <md-expansion-panel-expanded> <md-expansion-panel-header> <span translate>{{group.title || group.id}}</span> </md-expansion-panel-header> <md-expansion-panel-content style=\"padding: 0px; margin: 0px\"> <wb-widgets-list ng-if=wbWidgetExplorer._view_list widgets=group.widgets> </wb-widgets-list> <wb-widgets-module ng-if=!wbWidgetExplorer._view_list widgets=group.widgets> </wb-widgets-module> </md-expansion-panel-content> </md-expansion-panel-expanded> </md-expansion-panel> </md-expansion-panel-group> <wb-widgets-list ng-if=\"!wbWidgetExplorer._tree_mode &amp;&amp; wbWidgetExplorer._view_list\" widgets=widgets> </wb-widgets-list> <wb-widgets-module ng-if=\"!wbWidgetExplorer._tree_mode &amp;&amp; !wbWidgetExplorer._view_list\" widgets=widgets> </wb-widgets-module> </md-content> </div>"
  );


  $templateCache.put('views/directives/wb-widgets-list.html',
    "<md-list flex> <md-list-item class=md-2-line ng-repeat=\"widget in widgets\" dnd-draggable=\"widget.model || {}\" dnd-type=widget.type dnd-effect-allowed=copy> <wb-icon>{{widget.icon}}</wb-icon> <div class=md-list-item-text layout=column> <h3 translate>{{widget.title}}</h3> <p translate>{{widget.description}}</p> </div> <wb-icon ng-if=openHelp class=md-secondary ng-click=\"openHelp(widget, $event)\" aria-label=\"Show help\">help</wb-icon> </md-list-item> </md-list>"
  );


  $templateCache.put('views/directives/wb-widgets-module.html',
    "<div layout=column layout-gt-sm=row layout-align=space-around layout-wrap> <div class=\"wb-widgets-module md-whiteframe-1dp\" ng-repeat=\"widget in widgets\" dnd-draggable=\"widget.model || {}\" dnd-type=widget.type dnd-effect-allowed=copy flex=none flex-gt-sm=30 layout=column layout-align=\"start center\" layout-padding> <wb-icon size=32px wb-icon-name={{widget.icon}}></wb-icon> <p flex class=wb-text-truncate translate=\"\">{{widget.title}}</p> <md-tooltip md-delay=1500>{{widget.description | translate}}</md-tooltip> </div> </div>"
  );


  $templateCache.put('views/partials/wb-widget-options.html',
    ""
  );


  $templateCache.put('views/resources/wb-event-code-editor.html',
    "<div layout=column layout-fill> <md-toolbar> <div class=md-toolbar-tools layout=row> <span flex></span> <md-select ng-model=value.language ng-change=ctrl.setLanguage(value.language) class=md-no-underline> <md-option ng-repeat=\"l in value.languages track by $index\" ng-value=l.value> {{l.text}} </md-option> </md-select> </div> </md-toolbar> <md-content flex> <div style=\"min-height: 100%; min-width: 100%\" index=0 id=am-wb-resources-script-editor> </div> </md-content> </div>"
  );


  $templateCache.put('views/resources/wb-sheet.html',
    "<hot-table settings=\"{\n" +
    "\t \tcolHeaders: true, \n" +
    "\t \tcontextMenu: ['row_above', 'row_below', 'remove_row', 'hsep1', 'col_left', 'col_right', 'hsep2', 'remove_row', 'remove_col', 'hsep3', 'undo', 'redo', 'make_read_only', 'alignment', 'borders'], \n" +
    "\t \tafterChange: true\n" +
    "\t }\" row-headers=true min-spare-rows=minSpareRows datarows=value.values height=300 width=500 flex> </hot-table>"
  );


  $templateCache.put('views/resources/wb-url.html',
    "<div layout=column layout-padding flex> <p translate>Insert a valid URL, please.</p> <md-input-container class=\"md-icon-float md-block\"> <label translate>URL</label> <input ng-model=value> </md-input-container> </div>"
  );


  $templateCache.put('views/settings/wb-background.html',
    " <wb-ui-setting-image title=\"Background image\" wb-ui-setting-clear-button=true wb-ui-setting-preview=true ng-model=ctrl.image ng-change=\"ctrl.setStyleBackground('image', ctrl.image)\"> </wb-ui-setting-image> <wb-ui-setting-color title=\"Background Color\" wb-ui-setting-clear-button=true wb-ui-setting-preview=true ng-model=ctrl.color ng-change=\"ctrl.setStyleBackground('color', ctrl.color)\"> </wb-ui-setting-color> <wb-ui-setting-background-size ng-model=ctrl.size ng-change=\"ctrl.setStyleBackground('size', ctrl.size)\"> </wb-ui-setting-background-size> <wb-ui-setting-background-repeat ng-model=ctrl.repeat ng-change=\"ctrl.setStyleBackground('repeat', ctrl.repeat)\"> </wb-ui-setting-background-repeat> <wb-ui-setting-background-attachment ng-model=ctrl.attachment ng-change=\"ctrl.setStyleBackground('attachment', ctrl.attachment)\"> </wb-ui-setting-background-attachment> <wb-ui-setting-background-origin ng-model=ctrl.origin ng-change=\"ctrl.setStyleBackground('origin', ctrl.origin)\"> </wb-ui-setting-background-origin> <wb-ui-setting-background-position ng-model=ctrl.position ng-change=\"ctrl.setStyleBackground('position', ctrl.position)\"> </wb-ui-setting-background-position>"
  );


  $templateCache.put('views/settings/wb-border.html',
    " <fieldset layout=column> <legend translate>Style and Color</legend>  <md-input-container class=md-block> <label translate>Style</label> <md-select ng-model=ctrl.style ng-change=\"ctrl.setStyleBorder('style', ctrl.style)\"> <md-option ng-repeat=\"style in ::ctrl.styles\" value={{::style.value}}> <span translate>{{::style.title}}</span> </md-option> </md-select> </md-input-container>  <wb-ui-setting-color title=Color wb-ui-setting-clear-button=true wb-ui-setting-preview=true wb-ui-setting-icon=format_color_fill ng-model=ctrl.color ng-change=\"ctrl.setStyleBorder('color', ctrl.color)\"> </wb-ui-setting-color> </fieldset>  <fieldset layout=column> <legend translate>Width</legend> <wb-ui-setting-length title=All icon=border_all description=\"Set all sides width\" ng-model=ctrl.widthAll ng-change=ctrl.widthAllChanged(ctrl.widthAll) extra-values=\"['medium', 'thin', 'thick', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <md-divider></md-divider> <wb-ui-setting-length title=Top icon=border_top ng-model=ctrl.width.top ng-change=ctrl.widthChanged() extra-values=\"['medium', 'thin', 'thick', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=Right icon=border_right ng-model=ctrl.width.right ng-change=ctrl.widthChanged() extra-values=\"['medium', 'thin', 'thick', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=Bottom icon=border_bottom ng-model=ctrl.width.bottom ng-change=ctrl.widthChanged() extra-values=\"['medium', 'thin', 'thick', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=Left icon=border_left ng-model=ctrl.width.left ng-change=ctrl.widthChanged() extra-values=\"['medium', 'thin', 'thick', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> </fieldset>  <fieldset layout=column> <legend translate>Radius</legend> <wb-ui-setting-length title=All icon=full_rounded description=\"Set all sides radius\" ng-model=ctrl.radiusAll ng-change=ctrl.radiusAllChanged(ctrl.radiusAll) extra-values=\"['length', 'initial', 'inherit']\"> </wb-ui-setting-length> <md-divider></md-divider> <wb-ui-setting-length title=\"Top left\" icon=corner_top_left ng-model=ctrl.radius.topLeft ng-change=ctrl.radiusChanged() extra-values=\"['length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Top right\" icon=corner_top_right ng-model=ctrl.radius.topRight ng-change=ctrl.radiusChanged() extra-values=\"['length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Bottom right\" icon=corner_bottom_right ng-model=ctrl.radius.bottomRight ng-change=ctrl.radiusChanged() extra-values=\"['length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Bottom left\" icon=corner_bottom_left ng-model=ctrl.radius.bottomLeft ng-change=ctrl.radiusChanged() extra-values=\"['length', 'initial', 'inherit']\"> </wb-ui-setting-length> </fieldset>"
  );


  $templateCache.put('views/settings/wb-general.html',
    " <fieldset layout=column> <legend translate>Text</legend> <md-input-container layout-align=\"end center\"> <md-select ng-model=ctrl.direction ng-change=\"ctrl.setStyle('direction', ctrl.direction)\" style=\"min-width: 200px\"> <md-option ng-value=\"'ltr'\"> <span translate>Left to right</span> </md-option> <md-option ng-value=\"'rtl'\"> <span translate>Right to left</span> </md-option> <md-option ng-value=\"'inherit'\"> <span translate>Inherit</span> </md-option> <md-option ng-value=\"'initial'\"> <span translate>Initial</span> </md-option> </md-select> </md-input-container>  <wb-ui-setting-color title=Color wb-ui-setting-clear-button=true wb-ui-setting-preview=true ng-model=ctrl.color ng-change=\"ctrl.setStyle('color', ctrl.color)\"> </wb-ui-setting-color> </fieldset>  <fieldset layout=column> <legend translate>Mouse</legend> <md-input-container> <wb-icon>mouse</wb-icon> <label translate>Cursor</label> <md-select style=max-width:75px ng-model=ctrl.cursor ng-change=\"ctrl.setStyle('cursor', ctrl.cursor)\"> <md-option ng-repeat=\"cursor in ::ctrl.cursors\" value={{::cursor.value}}> {{::cursor.title}} </md-option> </md-select> </md-input-container> </fieldset>  <fieldset layout=column> <legend translate>Visibility</legend> <md-input-container layout-align=\"end center\"> <label translate>Visibility</label> <md-select ng-model=ctrl.visibility ng-change=\"ctrl.setStyle('visibility', ctrl.visibility)\" style=\"min-width: 200px\" disabled> <md-option ng-value=\"'visible'\"> <span translate>Visible</span> </md-option> <md-option ng-value=\"'hidden'\"> <span translate>Hidden</span> </md-option> </md-select> </md-input-container> <md-input-container style=\"margin:0px; padding:0px; width:60px; height:30px\"> <wb-icon>opacity</wb-icon> <label translate>Opacity</label> <input ng-model=ctrl.opacity ng-change=\"ctrl.setStyle('opacity', ctrl.opacity)\"> </md-input-container> </fieldset>  <fieldset layout=column> <legend translate>Overflow</legend> <md-input-container layout-align=\"end center\"> <label translate>X</label> <md-select ng-model=ctrl.overflowX ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateOverflowX() style=\"min-width: 200px\"> <md-option ng-value=\"'visible'\"> <span translate>Visible</span> </md-option> <md-option ng-value=\"'hidden'\"> <span translate>Hidden</span> </md-option> <md-option ng-value=\"'scroll'\"> <span translate>Scroll</span> </md-option> <md-option ng-value=\"'auto'\"> <span translate>Auto</span> </md-option> <md-option ng-value=\"'initial'\"> <span translate>Initial</span> </md-option> <md-option ng-value=\"'inherit'\"> <span translate>Inherit</span> </md-option> </md-select> </md-input-container> <md-input-container layout-align=\"end center\"> <label translate>Y</label> <md-select ng-model=ctrl.overflowY ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateOverflowY() style=\"min-width: 200px\"> <md-option ng-value=\"'visible'\"> <span translate>Visible</span> </md-option> <md-option ng-value=\"'hidden'\"> <span translate>Hidden</span> </md-option> <md-option ng-value=\"'scroll'\"> <span translate>Scroll</span> </md-option> <md-option ng-value=\"'auto'\"> <span translate>Auto</span> </md-option> <md-option ng-value=\"'initial'\"> <span translate>Initial</span> </md-option> <md-option ng-value=\"'inherit'\"> <span translate>Inherit</span> </md-option> </md-select> </md-input-container> </fieldset>"
  );


  $templateCache.put('views/settings/wb-layout-self.html',
    " <fieldset layout=column> <legend translate>Align</legend> <wb-ui-setting-choose ng-if=\"ctrl.getParentDirection() === 'row'\" title=\"Self Vert.\" items=\"ctrl.selfAlign_['row']\" ng-model=ctrl.alignSelf ng-change=ctrl.alignSelfChanged()> </wb-ui-setting-choose> <wb-ui-setting-choose ng-if=\"ctrl.getParentDirection() !== 'row'\" title=\"Self Vert.\" items=\"ctrl.selfAlign_['column']\" ng-model=ctrl.alignSelf ng-change=ctrl.alignSelfChanged()> </wb-ui-setting-choose> </fieldset>  <fieldset layout=column> <legend translate>Box</legend> <md-input-container class=md-block> <label translate>Order</label> <input ng-model=ctrl.order ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=\"ctrl.updateOrder(ctrl.order, $event)\" type=number> </md-input-container> <md-input-container class=md-block> <label translate>Basis</label> <input ng-model=ctrl.basis ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=\"ctrl.updateBasis(ctrl.basis, $event)\"> </md-input-container> <md-input-container class=md-block> <label translate>Grow</label> <input ng-model=ctrl.grow ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=\"ctrl.updateGrow(ctrl.grow, $event)\" type=number> </md-input-container> <md-input-container class=md-block> <label translate>Shrink</label> <input ng-model=ctrl.shrink ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=\"ctrl.updateShrink(ctrl.shrink, $event)\" type=number> </md-input-container> </fieldset>"
  );


  $templateCache.put('views/settings/wb-layout.html',
    " <wb-ui-setting-choose title=Direction icon=wb-direction items=ctrl.direction_ ng-model=ctrl.direction ng-change=ctrl.directionChanged()> </wb-ui-setting-choose>  <md-switch ng-model=ctrl.wrap ng-change=ctrl.wrapChanged() aria-label=\"Layout wrap\"> <span ng-if=\"ctrl.direction === 'row'\" translate=\"\">Multi row</span> <span ng-if=\"ctrl.direction !== 'row'\" translate=\"\">Multi column</span> </md-switch>  <wb-ui-setting-choose ng-if=\"ctrl.direction==='row'\" title=Vert. items=\"ctrl.align_['row']\" ng-model=ctrl.align ng-change=ctrl.alignChanged()> </wb-ui-setting-choose> <wb-ui-setting-choose ng-if=\"ctrl.direction!=='row'\" title=Horz. items=\"ctrl.align_['column']\" ng-model=ctrl.align ng-change=ctrl.alignChanged()> </wb-ui-setting-choose>  <wb-ui-setting-choose ng-if=\"ctrl.direction==='row'\" title=\"Vert.'\" items=\"ctrl.justify_['row']\" ng-model=ctrl.justify ng-change=ctrl.justifyChanged()> </wb-ui-setting-choose> <wb-ui-setting-choose ng-if=\"ctrl.direction!=='row'\" title=Horz. items=\"ctrl.justify_['column']\" ng-model=ctrl.justify ng-change=ctrl.justifyChanged()> </wb-ui-setting-choose>"
  );


  $templateCache.put('views/settings/wb-margin-padding.html',
    " <fieldset layout=column> <legend translate>Margin</legend>  <wb-ui-setting-length title=All icon=select_all description=\"Set all margins\" ng-model=ctrl.marginAll ng-change=ctrl.updateAllMargin(ctrl.marginAll) extra-values=\"['length' , 'auto' , 'initial', 'inherit']\"> </wb-ui-setting-length> <md-divider></md-divider>  <wb-ui-setting-length title=Top icon=border_top ng-model=ctrl.margin.top ng-change=ctrl.updateMargin(ctrl.margin) extra-values=\"['length' , 'auto' , 'initial', 'inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Right icon=border_right ng-model=ctrl.margin.right ng-change=ctrl.updateMargin(ctrl.margin) extra-values=\"['length' , 'auto' , 'initial', 'inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Bottom icon=border_bottom ng-model=ctrl.margin.bottom ng-change=ctrl.updateMargin(ctrl.margin) extra-values=\"['length' , 'auto' , 'initial', 'inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Left icon=border_left ng-model=ctrl.margin.left ng-change=ctrl.updateMargin(ctrl.margin) extra-values=\"['length' , 'auto' , 'initial', 'inherit']\"> </wb-ui-setting-length> </fieldset> <fieldset layout=column> <legend translate>Padding</legend>  <wb-ui-setting-length title=All icon=select_all description=\"Set all paddings\" ng-model=ctrl.paddingAll ng-change=ctrl.updateAllPadding(ctrl.paddingAll) extra-values=\"['inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Top icon=border_top ng-model=ctrl.padding.top ng-change=ctrl.updatePadding(ctrl.padding) extra-values=\"['inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Right icon=border_right ng-model=ctrl.padding.right ng-change=ctrl.updatePadding(ctrl.padding) extra-values=\"['inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Bottom icon=border_bottom ng-model=ctrl.padding.bottom ng-change=ctrl.updatePadding(ctrl.padding) extra-values=\"['inherit']\"> </wb-ui-setting-length>  <wb-ui-setting-length title=Left icon=border_left ng-model=ctrl.padding.left ng-change=ctrl.updatePadding(ctrl.padding) extra-values=\"['inherit']\"> </wb-ui-setting-length> </fieldset>"
  );


  $templateCache.put('views/settings/wb-notfound.html',
    " <wb-icon>bug</wb-icon> <h2>Settings page not found</h2>"
  );


  $templateCache.put('views/settings/wb-seo.html',
    " <fieldset layout=column> <md-input-container style=\"margin: 0px;margin-top: 10px\"> <label translate=\"\">Id</label> <input ng-model=ctrl.id ng-change=\"ctrl.setProperty('id', ctrl.id)\"> </md-input-container> <md-input-container style=\"margin: 0px\"> <label translate=\"\">Label</label> <input ng-model=ctrl.label ng-change=\"ctrl.setProperty('label', ctrl.label)\"> </md-input-container> <md-input-container style=\"margin: 0px\"> <label translate=\"\">Description</label> <textarea name=description ng-model=ctrl.description ng-change=\"ctrl.setProperty('description', ctrl.description)\">\n" +
    "        </textarea> </md-input-container> </fieldset> <fieldset layout=column style=\"padding: 0px\"> <legend translate=\"\">Schema</legend> <md-input-container flex=100 style=\"padding-left: 8px;padding-right: 8px\"> <label translate=\"\">Type</label> <md-select ng-model=ctrl.category ng-change=\"ctrl.setProperty('category', ctrl.category)\"> <md-option ng-repeat=\"type in ctrl.schemaTypes\" value={{type.value}}> {{type.key}} </md-option> </md-select> </md-input-container> <div layout=row layout-align=\"center center\" ng-if=ctrl.alert style=\"padding-left: 8px; padding-right: 8px\"> <p style=\"color: red\">! <span translate=\"\">{{ctrl.alert}}</span></p> </div> <md-input-container ng-if=!ctrl.alert flex=100 style=\"padding-left: 8px;padding-right: 8px\"> <label translate=\"\">Property</label> <md-select md-on-open=ctrl.setProperties() ng-model=ctrl.property ng-change=\"ctrl.setProperty('property', ctrl.property)\"> <md-option ng-repeat=\"property in ctrl.properties\" value=property> {{property}} </md-option> </md-select> </md-input-container> </fieldset>"
  );


  $templateCache.put('views/settings/wb-shadow.html',
    " <div layout=row flex> <md-button class=\"md-raised md-primary\" ng-click=ctrl.addShadow()> <span translate>New shadow</span> </md-button> </div>  <fieldset ng-repeat=\"shadow in ctrl.shadows track by $index\" layout=column> <legend><span translate>Shadow</span>{{$index + 1}}</legend> <wb-ui-setting-length title=\"Horizontal Shift\" ng-model=shadow.hShift ng-change=ctrl.updateShadows()> </wb-ui-setting-length> <wb-ui-setting-length title=\"Vertical Shift\" ng-model=shadow.vShift ng-change=ctrl.updateShadows()> </wb-ui-setting-length> <wb-ui-setting-length title=Blur ng-model=shadow.blur ng-change=ctrl.updateShadows()> </wb-ui-setting-length> <wb-ui-setting-length title=Spread ng-model=shadow.spread ng-change=ctrl.updateShadows()> </wb-ui-setting-length> <wb-ui-setting-color title=Color wb-ui-setting-clear-button=true wb-ui-setting-preview=true ng-model=shadow.color ng-change=ctrl.updateShadows()> </wb-ui-setting-color> <md-checkbox ng-model=shadow.inset ng-change=ctrl.updateShadows() aria-label=Inset> <span translate=\"\">Inset</span> </md-checkbox> <div layout=row layout-align=\"end center\"> <p style=\"font-size: 14px\" flex tab-index=0></p> <md-button class=\"md-raised md-accent\" aria-label=\"Delete shadow\" ng-click=ctrl.remove($index)> <span translate>Delete</span> </md-button> </div> </fieldset>"
  );


  $templateCache.put('views/settings/wb-size.html',
    " <fieldset> <legend translate>Width</legend> <wb-ui-setting-length title=Width description=\"Set the width\" ng-model=ctrl.width ng-change=ctrl.widthChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Min width\" description=\"Set the minimum width\" ng-model=ctrl.minWidth ng-change=ctrl.minWidthChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Max width\" description=\"Set the maximum width\" ng-model=ctrl.maxWidth ng-change=ctrl.maxWidthChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> </fieldset> <fieldset> <legend translate>Height</legend> <wb-ui-setting-length title=Height description=\"Set the height\" ng-model=ctrl.height ng-change=ctrl.heightChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Min height\" description=\"Set the minimum height\" ng-model=ctrl.minHeight ng-change=ctrl.minHeightChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> <wb-ui-setting-length title=\"Max height\" description=\"Set the maximum height\" ng-model=ctrl.maxHeight ng-change=ctrl.maxHeightChanged() extra-values=\"['auto', 'length', 'initial', 'inherit']\"> </wb-ui-setting-length> </fieldset>"
  );


  $templateCache.put('views/settings/wb-transform.html',
    "<fieldset layout=column> <legend translate>General</legend> <md-input-container class=md-block> <label translate>Origin</label> <input ng-model=ctrl.origin ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateOrigin()> </md-input-container> <md-input-container class=md-block> <label translate>style</label> <input ng-model=ctrl.style ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateStyle()> </md-input-container> <md-input-container class=md-block> <label translate>Perspective</label> <input ng-model=ctrl.perspective ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updatePerspective()> </md-input-container> </fieldset> <fieldset layout=column> <legend translate>X</legend> <md-input-container class=md-block> <label translate>translate</label> <input ng-model=ctrl.translateX ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateTranslateX()> </md-input-container> <md-input-container class=md-block> <label translate>scale</label> <input ng-model=ctrl.scaleX ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateScaleX()> </md-input-container> <md-input-container class=md-block> <label translate>rotate</label> <input ng-model=ctrl.rotateX ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateRotateX()> </md-input-container> <md-input-container class=md-block> <label translate>skew</label> <input ng-model=ctrl.skewX ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateSkewX()> </md-input-container> </fieldset> <fieldset layout=column> <legend translate>Y</legend> <md-input-container class=md-block> <label translate>translate</label> <input ng-model=ctrl.translateY ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateTranslateY()> </md-input-container> <md-input-container class=md-block> <label translate>scale</label> <input ng-model=ctrl.scaleY ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateScaleY()> </md-input-container> <md-input-container class=md-block> <label translate>rotate</label> <input ng-model=ctrl.rotateY ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateRotateY()> </md-input-container> <md-input-container class=md-block> <label translate>skew</label> <input ng-model=ctrl.skewY ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateSkewY()> </md-input-container> </fieldset> <fieldset layout=column> <legend translate>Z</legend> <md-input-container class=md-block> <label translate>translate</label> <input ng-model=ctrl.translateZ ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateTranslatez()> </md-input-container> <md-input-container class=md-block> <label translate>scale</label> <input ng-model=ctrl.scaleZ ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateScaleZ()> </md-input-container> <md-input-container class=md-block> <label translate>rotate</label> <input ng-model=ctrl.rotateZ ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=ctrl.updateRotateZ()> </md-input-container> </fieldset>"
  );


  $templateCache.put('views/sheets/wb-themplates.html',
    "<md-bottom-sheet class=\"md-list md-has-header\" md-colors=\"{backgroundColor: 'background-900'}\"> <div style=\"padding: 16px\">  <div layout=row layout-align=\"start center\" style=\"padding: 0px 8px; margin: 0px\"> <span translate>Start a new page</span> <span flex></span> <span translate>Template gallery</span> <md-divider></md-divider> <md-button aria-label=\"Hide template sheet\" class=md-icon-button ng-click=hideTemplates($event)> <wb-icon>keyboard_arrow_down </wb-icon></md-button> <md-menu> <md-button aria-label=\"Open the interactions menu\" class=md-icon-button ng-click=$mdMenu.open($event)> <wb-icon>more_vert </wb-icon></md-button> <md-menu-content width=4 md-colors=\"{backgroundColor: 'background'}\"> <md-menu-item> <md-button ng-click=hideTemplates($event)> <span translate>Hide templates</span> </md-button> </md-menu-item> </md-menu-content> </md-menu> </div>  <md-content layout=row md-colors=\"{backgroundColor: 'background-900'}\"> <div layout=column ng-repeat=\"template in templates\" ng-click=loadTemplate(template) layout-padding style=\"cursor: pointer\"> <img width=215px height=152px ng-src={{template.thumbnail}} style=\"border-bottom-width: 1px; border: solid\"> {{template.name}} </div> </md-content> </div> </md-bottom-sheet>"
  );


  $templateCache.put('views/widgets/wb-group.html',
    "<div class=wb-group dir=\"{{wbModel.direction || wbModel.style.dir}}\" name={{wbModel.name}} id={{wbModel.id}} dnd-disable-if=!ctrl.isEditable() dnd-draggable=wbModel dnd-effect-allowed=copyMove dnd-type=\"'Group'\" dnd-moved=ctrl.delete() dnd-list=wbModel.contents dnd-allowed-types=ctrl.getAllowedTypes() dnd-external-sources=true dnd-drop=\"ctrl.addChild(index, item)\" dnd-horizontal-list=\"wbModel.style.layout.direction==='row'\" md-theme-watch=true></div>"
  );


  $templateCache.put('views/widgets/wb-html.html',
    " <div ng-if=!ctrl.isEditable() ng-bind-html=\"ctrl.text | wbunsafe\" class=\"wb-widget-fill wb-widget-text\"> </div> <div ng-if=ctrl.isEditable() ui-tinymce=\"{\n" +
    "        selector : 'div.tinymce', \n" +
    "        menubar: true,\n" +
    "        inline: true,\n" +
    "        theme: 'modern',\n" +
    "        plugins : [\n" +
    "            'advlist',\n" +
    "            'autolink',\n" +
    "            'autoresize',\n" +
    "            'autosave',\n" +
    "            'bbcode',\n" +
    "            'charmap',\n" +
    "            'code',\n" +
    "            'codesample',\n" +
    "            'colorpicker',\n" +
    "            'contextmenu',\n" +
    "            'directionality',\n" +
    "            'emoticons',\n" +
    "            'hr',\n" +
    "            'image',\n" +
    "            'imagetools',\n" +
    "            'importcss',\n" +
    "            'insertdatetime',\n" +
    "            'legacyoutput',\n" +
    "            'link',\n" +
    "            'lists',\n" +
    "            'media',\n" +
    "            'nonbreaking',\n" +
    "            'noneditable',\n" +
    "            'paste',\n" +
    "            'save',\n" +
    "            'searchreplace',\n" +
    "            'spellchecker',\n" +
    "            'tabfocus',\n" +
    "            'table',\n" +
    "            'template',\n" +
    "            'textcolor',\n" +
    "            'textpattern',\n" +
    "            'toc',\n" +
    "            'visualblocks'\n" +
    "        ],\n" +
    "        toolbar: [\n" +
    "            'fullscreen | undo redo | bold italic underline | formatselect fontselect fontsizeselect | visualblocks',\n" +
    "            'forecolor backcolor | ltr rtl | alignleft aligncenter alignjustify alignright alignfull | numlist bullist outdent indent'\n" +
    "        ],\n" +
    "        powerpaste_word_import: 'clean',\n" +
    "        powerpaste_html_import: 'clean',\n" +
    "        link_assume_external_targets: false,\n" +
    "        convert_urls: false,\n" +
    "        format: 'raw',\n" +
    "    }\" ng-model=ctrl.text ng-model-options=\"{debounce: { 'default': 500, 'blur': 0, '*': 1000 }, updateOn: 'default blur click'}\" ng-change=\"ctrl.setModelProperty('text', ctrl.text)\" class=\"wb-widget-fill tinymce wb-widget-text\" ng-keydown=$event.stopPropagation();> </div>"
  );


  $templateCache.put('views/widgets/wb-notfound.html',
    "<div ng-show=wbEditable> Unsuported widget?! </div>"
  );

}]);
