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

angular.module('am-wb-core', []);

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
 * @name WidgetEditor
 * @description Editor of a widget
 * 
 * 
 * ## Events
 * 
 * - Click    native  Fires when the editor is clicked.
 * - DblClick    native  Fires when the editor is double-clicked.
 * - MouseDown   native  Fires when the mouse button is pressed down inside the editor.
 * - MouseUp native  Fires when a mouse button is released inside the editor.
 * - MouseMove   native  Fires when the mouse is moved within the editor.
 * - MouseOver   native  Fires when a new element is being hovered within the editor.
 * - MouseOut    native  Fires when an element is no longer being hovered within the editor.
 * - MouseEnter  native  Fires when the mouse enters the editor.
 * - MouseLeave  native  Fires when the mouse leaves the editor.
 * - KeyDown native  Fires when a key is pressed within the editor.
 * - KeyPress    native  Fires when a key is pressed within the editor.
 * - KeyUp   native  Fires when a key is released within the editor.
 * - ContextMenu native  Fires when the context menu is invoked within the editor.
 * - Paste   native  Fires when a paste is done within the editor.
 * - Init    core    Fires when the editor is initialized.
 * - Focus   core    Fires when the editor is focused.
 * - Blur    core    Fires when the editor is blurred.
 * - BeforeSetContent    core    Fires before the content is set to the editor.
 * - SetContent  core    Fires after the content is set to the editor.
 * - GetContent  core    Fires after the content is extracted from the editor.
 * - PreProcess  core    Fires when the contents in the editor are being serialized.
 * - PostProcess core    Fires when the contents in the editor are being serialized.
 * - NodeChange  core    Fires when selection inside the editor is changed.
 * - Undo    core    Fires when the contents have been reverted to a previous state.
 * - Redo    core    Fires to revert the effects of an Undo event.
 * - Change  core    Fires when undo level is added to the editor.
 * - Dirty   core    Fires when editor contents are being considered dirty.
 * - Remove  core    Fires when the editor is removed.
 * - ExecCommand core    Fires after a command has been executed.
 * - PastePreProcess paste   Fires when contents are pasted into the editor.
 * - PastePostProcess    paste   Fires when contents are pasted into the editor.
 */



.factory('WidgetEditor', function () {

    /**
     * Creates new instace of an editor
     */
    function Editor(widget, options) {
        this.callbacks = [];
        this.widget = widget;
        this.options = options;
    }

    /**
     * Remove all resources
     * 
     * @mrmberof WidgetEditor
     */
    Editor.prototype.destroy = function(){
        this.callbacks = [];
        delete this.widget;
        delete this.options;
    };

    /**
     * Get the widget of the editor
     * 
     * @mrmberof WidgetEditor
     */
    Editor.prototype.getWidget = function(){
        return this.widget;
    };

    /**
     * Set the widget as dirty widget
     * 
     * @mrmberof WidgetEditor
     */
    Editor.prototype.setDirty = function(dirty){
        if(typeof(dirty) !== 'undefined'){
            this.dirty = dirty;
        } else {
            this.dirty = true;
        }
    };

    /**
     * Check if the widget is dirty
     * 
     * @mrmberof WidgetEditor
     */
    Editor.prototype.isDirty = function(){
        return this.dirty;
    };

    /**
     * Remove callbak from specific type
     * 
     * @param type {string} the event name
     * @param callback {function} the function
     * @mrmberof WidgetEditor
     */
    Editor.prototype.off = function(type, callback){
        if (!angular.isArray(this.callbacks[type])) {
            return;
        }
        var callbacks = this.callbacks[type];
        var index = callbacks.indexOf(callback);
        if (index > -1) {
            callbacks.splice(index, 1);
        }
    };

    /**
     * Add a callback function to the editor
     * 
     * @param type {string} the event name
     * @param callback {function} the function
     * @mrmberof WidgetEditor
     */
    Editor.prototype.on = function(type, callback){
        if (!angular.isArray(this.callbacks[type])) {
            this.callbacks[type] = [];
        }
        if(!_.includes(this.callbacks[type], callback)){
            this.callbacks[type].push(callback);
        }
    };

    /**
     * Fire the event
     * 
     * @param type {string} the event name
     * @param param {object} event params
     * @mrmberof WidgetEditor
     */
    Editor.prototype.fire = function(type, params){
        // TODO: maso, 2018: create event object
        var event = _.merge({
            source: this,
            type: type
        }, params || {});

        // fire
        var callbacks = this.callbacks[type] || [];
        for(var i = 0; i < callbacks.length; i++){
            // TODO: maso, 2018: check if the event is stopped to propagate
            try {
                callbacks[i](event);
            } catch (error) {
                // NOTE: remove on release
//                console.log(error);
            }
        }
    }; // internal





    Editor.prototype.setActive = function(){}; // focus|skipFocuse
    Editor.prototype.isActive = function(){};
    Editor.prototype.save = function(){};
    Editor.prototype.hide = function(){};
    Editor.prototype.show = function(){};
    Editor.prototype.isHidden = function(){};

    // the editor type
    return Editor;
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
angular.module('am-wb-core')

.factory('WbObservableObject', function() {

	function ObservableObject() {
		this.silent = false;
		this.callbacks = {};
	}

	/**
	 * Set widget silent
	 * 
	 * @memberof AmhObservableObject
	 */
	ObservableObject.prototype.setSilent = function(silent) {
		this.silent = silent;
	};

	/**
	 * Checks if the element is silent
	 * 
	 * @memberof AmhObservableObject
	 */
	ObservableObject.prototype.isSilent = function() {
		return this.silent;
	};

	/**
	 * Adds new callback of type
	 * 
	 * @param typeof
	 *            the event
	 * @param callback
	 *            to call on the event
	 * @memberof AmhObservableObject
	 */
	ObservableObject.prototype.on = function (type, callback) {
		if (!angular.isFunction(callback)) {
			throw {
				message: 'Callback must be a function'
			};
		}
		var callbacks = this.callbacks;
		if (!angular.isArray(callbacks[type])) {
			callbacks[type] = [];
		}
		if(callbacks[type].includes(callback)){
			return;
		}
		callbacks[type].push(callback);
	};

	/**
	 * Remove the callback
	 * 
	 * @param type
	 *            of the event
	 * @param callback
	 *            to remove
	 * @memberof AmhObservableObject
	 */
	ObservableObject.prototype.off = function (type, callback) {
		var callbacks = this.callbacks;
		if (!angular.isArray(callbacks[type])) {
			return;
		}
		var index = callbacks[type].indexOf(callback);
		if (index > -1) {
			callbacks[type].splice(index, 1);
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
	 * @memberof AmhObservableObject
	 */
	ObservableObject.prototype.fire = function (type, params) {
		// 1- Call processors
		var event = _.merge({
			source: this,
			type: type
		}, params || {});
		var callbacks = this.callbacks;

		// 2- call listeners
		if (this.isSilent() || !angular.isDefined(callbacks[type])) {
			return;
		}
		var cl = callbacks[type];
		for(var i = 0; i < cl.length; i++){
			// TODO: maso, 2018: check if the event is stopped to propagate
			try {
				cl[i].apply(cl[i], [event]);
			} catch (error) {
				log.error({
					source: 'ObservableObject',
					message: 'The listener throw an unexpected exception.',
					exception: error
				});
			}
		}
	};
	
	return ObservableObject;
});

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
.factory('$wbMedia', function (
        /* angularjs */ $rootScope, $window) {
    
    /**
     * As defined in core/style/variables.scss
     *
     * $layout-breakpoint-xs:     600px !default;
     * $layout-breakpoint-sm:     960px !default;
     * $layout-breakpoint-md:     1280px !default;
     * $layout-breakpoint-lg:     1920px !default;
     *
     */
    var MEDIA = {
      'xs'        : '(max-width: 599px)'                         ,
      'gt-xs'     : '(min-width: 600px)'                         ,
      'sm'        : '(min-width: 600px) and (max-width: 959px)'  ,
      'gt-sm'     : '(min-width: 960px)'                         ,
      'md'        : '(min-width: 960px) and (max-width: 1279px)' ,
      'gt-md'     : '(min-width: 1280px)'                        ,
      'lg'        : '(min-width: 1280px) and (max-width: 1919px)',
      'gt-lg'     : '(min-width: 1920px)'                        ,
      'xl'        : '(min-width: 1920px)'                        ,
      'landscape' : '(orientation: landscape)'                   ,
      'portrait'  : '(orientation: portrait)'                    ,
      'print' : 'print'
    };

    var MEDIA_PRIORITY = [
      'xl',
      'gt-lg',
      'lg',
      'gt-md',
      'md',
      'gt-sm',
      'sm',
      'gt-xs',
      'xs',
      'landscape',
      'portrait',
      'print'
    ];
    
    var queries = {};
    var mqls = {};
    var results = {};
    var normalizeCache = {};

    $mdMedia.getResponsiveAttribute = getResponsiveAttribute;
    $mdMedia.getQuery = getQuery;
    $mdMedia.watchResponsiveAttributes = watchResponsiveAttributes;

    return $mdMedia;

    function $mdMedia(query) {
        var validated = queries[query];
        if (angular.isUndefined(validated)) {
            validated = queries[query] = validate(query);
        }

        var result = results[validated];
        if (angular.isUndefined(result)) {
            result = add(validated);
        }

        return result;
    }

    function validate(query) {
        return MEDIA[query] ||
        ((query.charAt(0) !== '(') ? ('(' + query + ')') : query);
    }

    function add(query) {
        var result = mqls[query];
        if (!result) {
            result = mqls[query] = $window.matchMedia(query);
        }

        result.addListener(onQueryChange);
        return (results[result.media] = !!result.matches);
    }

    function onQueryChange(query) {
        $rootScope.$evalAsync(function() {
            results[query.media] = !!query.matches;
        });
    }

    function getQuery(name) {
        return mqls[name];
    }

    function getResponsiveAttribute(attrs, attrName) {
        for (var i = 0; i < MEDIA_PRIORITY.length; i++) {
            var mediaName = MEDIA_PRIORITY[i];
            if (!mqls[queries[mediaName]].matches) {
                continue;
            }

            var normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);
            if (attrs[normalizedName]) {
                return attrs[normalizedName];
            }
        }

        // fallback on unprefixed
        return attrs[getNormalizedName(attrs, attrName)];
    }

    function watchResponsiveAttributes(attrNames, attrs, watchFn) {
        var unwatchFns = [];
        attrNames.forEach(function(attrName) {
            var normalizedName = getNormalizedName(attrs, attrName);
            if (angular.isDefined(attrs[normalizedName])) {
                unwatchFns.push(
                        attrs.$observe(normalizedName, angular.bind(void 0, watchFn, null)));
            }

            for (var mediaName in MEDIA) {
                normalizedName = getNormalizedName(attrs, attrName + '-' + mediaName);
                if (angular.isDefined(attrs[normalizedName])) {
                    unwatchFns.push(
                            attrs.$observe(normalizedName, angular.bind(void 0, watchFn, mediaName)));
                }
            }
        });

        return function unwatch() {
            unwatchFns.forEach(function(fn) { fn(); });
        };
    }

    // Improves performance dramatically
    function getNormalizedName(attrs, attrName) {
        return normalizeCache[attrName] ||
        (normalizeCache[attrName] = attrs.$normalize(attrName));
    }
});
/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
//
//angular.module('am-wb-core')
//.factory('NativeWindowWrapper', function($q, $injector, $rootScope) {
//	
//
//	/**
//	 * @ngdoc Factory
//	 * @name WbDialogWindow
//	 * @description WbDialogWindow a dialog manager
//	 * 
//	 */
//	var nativeWindowWrapper = function(nativeWindow){
//		this.nw = nativeWindow;
//		this.location = nativeWindow.location;
//		this.libs = {};
//		this.styles = {};
//	};
//
//
//	/********************************************************************
//	 * Utilitiey
//	 ********************************************************************/
//	var WbDialogWindow;
//
//
//	/*
//	 * Open a float based on options
//	 */
//	function openFloatPanel(parent, options) {
//		if(!WbDialogWindow){
//			WbDialogWindow = $injector.get('WbDialogWindow');
//		}
//
//		var window = new WbDialogWindow(parent);
//		window.setTitle(options.name);
//		window.setLanguage(options.language);
//		if(options.position){
//			window.setPosition(options.position.x, options.position.y);
//		}
//		window.setCloseOnEscape(options.closeOnEscape);
//		if(angular.isDefined(options.showTitle)) {
//			window.setTitleVisible(options.showTitle);
//		}
//		if(angular.isDefined(options.size)) {
//			var size = options.size;
//			window.setWidth(size.width);
//			window.setHeight(size.height);
//		}
//		if(angular.isDefined(options.showTitle)){
//			window.setTitleVisible(options.showTitle);
//		}
//		window.setVisible(true);
//
//		if(angular.isString(options.url)){
//			// Open URL
//			window.write('<iframe style="width:100%; height: 100%;" src="'+options.url+'"></iframe>');
//		} else if(angular.isObject(options.url)){
//			var view = options.url;
//			if(view.type === 'view'){
//				window.setView(view);
//			}
//		} else {
//			throw {
//				message: 'Not supported type of URL',
//				url: options.url
//			};
//		}
//
//
//		return window;
//	}
//
//	/*
//	 * Convert to window option
//	 */
//	function convertToWindowOption(/*options*/) {
//		return '';
//	}
//
//	/*
//	 * Open window based on options
//	 */
//	function openWindow(window, options) {
//		// check input url
//		if(!angular.isString(options.url)){
//			throw {
//				message: 'Impossible to open window with weburger'
//			};
//		}
//		var windowNative = window.open(
//				options.url, 
//				options.name, 
//				convertToWindowOption(options), 
//				options.replace);
//		return new nativeWindowWrapper(windowNative);
//	}
//
//	/********************************************************************
//	 * 
//	 ********************************************************************/
//	/**
//	 * Gets parent of the window
//	 * 
//	 * @memberof NativeWindowWrapper
//	 * @return parent
//	 */
//	nativeWindowWrapper.prototype.getParent = function(){
//		return this.nw.parent;
//	};
//
//	nativeWindowWrapper.prototype.getDocument = function(){
//		return this.nw.document;
//	};
//
//	nativeWindowWrapper.prototype.getHeadElement = function(){
//		if(this._he) {
//			return this._he;
//		}
//		var document = this.getDocument();
//		this._he = angular.element(document.getElementsByTagName('head')[0]);
//		return this._he;
//	};
//
//	nativeWindowWrapper.prototype.getBodyElement = function(){
//		if(this._be) {
//			return this._be;
//		}
//		var document = this.getDocument();
//		this._be = angular.element(document.getElementsByTagName('body')[0]);
//		return this._be;
//	};
//
//	nativeWindowWrapper.prototype.getLocation = function(){
//		return this.nw.location;
//	};
//
//	/**
//	 * Sets title of the window
//	 * 
//	 * @memberof NativeWindowWrapper
//	 * @params title {string} the window title
//	 */
//	nativeWindowWrapper.prototype.setTitle = function(title){
//		var document = this.getDocument();
//		document.title = title;
//	};
//
//	/**
//	 * Sets title of the window
//	 * 
//	 * @memberof NativeWindowWrapper
//	 * @return {string} the window title
//	 */
//	nativeWindowWrapper.prototype.getTitle = function(){
//		var document = this.getDocument();
//		return document.title;
//	};
//
//
//	/**
//	 * Sets language of the window
//	 * 
//	 */
//	nativeWindowWrapper.prototype.setLanguage = function(language){
//		var bodyElement = this.getBodyElement();
//		bodyElement.attr('lang', language);
//	};
//
//	/**
//	 * Gets language of the window
//	 * 
//	 */
//	nativeWindowWrapper.prototype.getLanguage = function(){
//		var bodyElement = this.getBodyElement();
//		return bodyElement.attr('lang');
//	};
//
//
//	/**
//	 * 
//	 * The open() method opens a new browser window, or a new tab, depending 
//	 * on your browser settings.
//	 * 
//	 * Tip: Use the close() method to close the window.
//	 * 
//	 * @memberof NativeWindowWrapper
//	 * @return window object
//	 */
//	nativeWindowWrapper.prototype.open = function(url, name, options, replace){
//		// check options
//		options = options || {
//			internal: false
//		};
//		options.url = url;
//		options.name = name;
//		options.replace = replace;
//		//open
//		if(options.internal){
//			return openFloatPanel(this, options);
//		}
//		return openWindow(this.nw, options);
//	};
//
//	/**
//	 * Close current window
//	 * 
//	 * @memberof NativeWindowWrapper
//	 */
//	nativeWindowWrapper.prototype.close = function(){
//		this.nw.close();
//		// TODO: maso, 2019: remove all resources
//	};

//
//
//	nativeWindowWrapper.prototype.setWidth = function(width){
//		this.resizeTo(width, this.getHeight());
//	};
//
//	nativeWindowWrapper.prototype.getWidth = function(){
//		return this.nw.innerWidth;
//	};
//
//	nativeWindowWrapper.prototype.setHeight = function(height){
//		this.resizeTo(this.getWidth(), height);
//	};
//
//	nativeWindowWrapper.prototype.getHeight = function(){
//		return this.nw.innerHeight;
//	};
//
//	nativeWindowWrapper.prototype.resizeTo = function(width, height) {
//		this.nw.resizeTo(width, height);
//	};
//
//	/**
//	 * Sets position of the window
//	 */
//	nativeWindowWrapper.prototype.setPosition = function(x, y) {
//		this.x = x;
//		this.y = y;
//		// TODO: maso, 2019: set position of the window
//	};
//
//	/**
//	 * Gets current position of the window
//	 */
//	nativeWindowWrapper.prototype.getPosition = function() {
//		return {
//			x: this.x,
//			y: this.y
//		};
//		// TODO: maso, 2019: set position of the window
//	};
//
//	return nativeWindowWrapper;
//});

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

angular.module('am-wb-core')//

/**
 * @ngdoc Processor
 * @name WbProcessorAbstract
 * @description Abstract widget processor 
 * 
 */
.factory('WbProcessorAbstract', function (WbObservableObject) {

	function Processor(){
		WbObservableObject.apply(this, arguments);
	}
	Processor.prototype = new WbObservableObject();

	return Processor;
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

angular.module('am-wb-core')


/**
 * @ngdoc Processor
 * @name WbProcessorAttribute
 * @description Widget processor
 * 
 */
.factory('WbProcessorAttribute', function (WbProcessorAbstract) {

    function loadStyle(widget, keys) {
        var element = widget.getElement();

        var computedStyle = {};
        var style = widget.getModelProperty('style') || {};
        var runtimeModel = widget.getRuntimeModel() || {};
        if(!keys){
            element.attr('style', '');
            computedStyle = angular.merge({}, style, runtimeModel.style);
        } else {
            _.forEach(keys, function(key){
                computedStyle[key] = runtimeModel.style[key] || style[key] || '';
            });
        }
        element.css(computedStyle);
    }

    function setWidgetElementAttribute(widget, key, value){
        if(widget.isEditable() && (key === 'draggable' || key === 'dropzone')){
            // are handled by processors in edit mode
            return;
        }
        if(key === 'style'){
            return;
        }
        var $element = widget.getElement();
        if(value){
            $element.attr(key, value);
        } else {
            $element.removeAttr(key);
        }
        // NOTE: html is special value
        if(key === 'html'){
            $element.html(value);
        }
        if(key === 'text'){
            $element.text(value);
        }
        if(key === 'inputType'){
            widget.setElementAttribute('type', value);
        }
        if(key === 'value'){
            $element.val(value);
        }
    }

    function setWidgetElementAttributes(widget, elementAttributes) {
        for(var i =0; i < elementAttributes.length; i++){
            var key = elementAttributes[i];
            setWidgetElementAttribute(widget, key, widget.getProperty(key) || widget.getModelProperty(key));
        }
    }

    function Processor() {
        WbProcessorAbstract.apply(this);
//        this.devToolsCallback = new MutationObserver(function(mutationsList, observer) {
//            // Use traditional 'for loops' for IE 11
//            for(let mutation of mutationsList) {
//                if(mutation.attributeName === 'style'){
//                    var elementStyle = ctrl.getElement()[0].style;
//                    for (prop in elementStyle) {
//                        if (elementStyle.hasOwnProperty(prop)) {
//                            ctrl.setModelProperty('style.'+prop, elementStyle[prop]);
//                        }
//                    }
//                }
//            }
//        });
    }
    Processor.prototype = new WbProcessorAbstract();

    Processor.prototype.process = function (widget, event) {
//        if(event.type === 'stateChanged'){
//            if(event.value === 'edit'){
//                // Start observing the target node for configured mutations
//                this.devToolsCallback.observe(widget.getElement()[0], { 
//                    attributes: true, 
//                    childList: false, 
//                    subtree: false 
//                });
//            } else {
//                // Later, you can stop observing
//                this.devToolsCallback.disconnect();
//            }
//        } 
        if (event.type === 'modelChanged') {
            setWidgetElementAttributes(widget, widget.getElementAttributes());
            loadStyle(widget);
        } else if (event.type === 'modelUpdated') {
            var evKeys = event.keys || [event.key];
            var styleKeys = [];
            var attributeKeys = [];
            for(var i = 0; i < evKeys.length; i++){
                if(evKeys[i].startsWith('style.')){
                    styleKeys.push(evKeys[i].substring(6));
                } else {
                    attributeKeys.push(evKeys[i]);
                }
            }

            // attributes
            setWidgetElementAttributes(widget, _.intersection(attributeKeys, widget.getElementAttributes()));

            // style
            loadStyle(widget, styleKeys);
        }
    };
    return Processor;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Processor
 * @name WbProcessorEvent
 * @description Widget processor
 * 
 */
.factory('WbProcessorEvent', function (WbProcessorAbstract, $widget, $injector) {

    /**
     * Loads events for the widget
     * 
     * @param event
     *            {object} part of the widget data model
     * @memberof WbAbstractWidget
     */
    function evalWidgetEvent(widget, type, event) {
        var eventFunction;
        if (!widget.eventFunctions.hasOwnProperty(type)) {
            try{
                var ucode = widget.getEvent()[type];
                if(!ucode){
                    return;
                }
                ucode += '\n//@ sourceURL=wb-'+ widget.getId() + '-' + type + '.js';
                var params = _.join(_.concat(
                        ['$widget', '$event'], // dynamic data
                        $widget.getProvidersKey()));
                /*jslint evil: true */
                widget.eventFunctions[type] = new Function(params, ucode);// code
            }catch(ex){
//                console.error({
//                    message: 'Fail to load user function',
//                    original: ex
//                });
            }
        }
        eventFunction = widget.eventFunctions[type];
        if (eventFunction) {
            try{
                var locals = _.merge({
                    $event: event, // -> $event
                    $widget: widget, // -> $widget
                }, $widget.getProviders());
                return $injector.invoke(eventFunction, widget, locals);
            } catch(ex){
//                console.error({
//                    original: ex,
//                    message: 'faile to run the event code of the widget',
//                    type: type,
//                    event: event
//                });
            }
        }
    }

    function loadWidgetEventsHandlers(widget){
        widget.__eventListeners = {
                click: function ($event) {
                    return evalWidgetEvent(widget, 'click', $event);
                },
                dblclick: function ($event) {
                    return evalWidgetEvent(widget, 'dblclick', $event);
                },
                mouseout: function ($event) {
                    return evalWidgetEvent(widget, 'mouseout', $event);
                },
                mouseover: function ($event) {
                    return evalWidgetEvent(widget, 'mouseover', $event);
                },
                mousedown: function ($event) {
                    return evalWidgetEvent(widget, 'mousedown', $event);
                },
                mouseup: function ($event) {
                    return evalWidgetEvent(widget, 'mouseup', $event);
                },
                mouseenter: function ($event) {
                    return evalWidgetEvent(widget, 'mouseenter', $event);
                },
                mouseleave: function ($event) {
                    return evalWidgetEvent(widget, 'mouseleave', $event);
                },
                resize: function ($event) {
                    return evalWidgetEvent(widget, 'resize', $event);
                },
                intersection: function ($event) {
                    return evalWidgetEvent(widget, 'intersection', $event);
                },

                //
                // Common media events
                //
                success: function ($event) {
                    return evalWidgetEvent(widget, 'success', $event);
                },
                error: function ($event) {
                    return evalWidgetEvent(widget, 'error', $event);
                },
                abort: function ($event) {
                    return evalWidgetEvent(widget, 'abort', $event);
                },
                load: function ($event) {
                    return evalWidgetEvent(widget, 'load', $event);
                },
                beforeunload: function ($event) {
                    return evalWidgetEvent(widget, 'beforeunload', $event);
                },
                unload: function ($event) {
                    return evalWidgetEvent(widget, 'unload', $event);
                },
                
                
                change: function ($event) {
                    return evalWidgetEvent(widget, 'change', $event);
                },
                input: function ($event) {
                    return evalWidgetEvent(widget, 'input', $event);
                },

                /*
                 * Keyboard events
                 */
                keyup: function ($event) {
                    return evalWidgetEvent(widget, 'keyup', $event);
                },
                keydown: function ($event) {
                    return evalWidgetEvent(widget, 'keydown', $event);
                },
                keypress: function ($event) {
                    return evalWidgetEvent(widget, 'keypress', $event);
                },

        };
        angular.forEach(widget.__eventListeners, function (listener, key) {
            widget.on(key, listener);
        });
    }

    function removeWidgetEventsHandlers(widget){
        if(angular.isDefined(widget.__eventListeners)){
            angular.forEach(widget.__eventListeners, function (listener, key) {
                widget.off(key, listener);
            });
            delete widget.__eventListeners;
        }
        // clean all providers
        _.forEach($widget.getProviders(), function(provider){
            if(_.isFunction(provider.clean)){
                provider.clean();
            }
        });
    }

    function Processor(){
        WbProcessorAbstract.apply(this);
    }

    // extend functionality
    Processor.prototype = new WbProcessorAbstract();

    Processor.prototype.process = function (widget, event){
        if(event.type !== 'stateChanged') {
            return;
        }
        if(widget.state === 'ready') {
            loadWidgetEventsHandlers(widget);
            evalWidgetEvent(widget, 'stateChanged', event);
            // TODO: maso, 2019: remove in next major version
            // support legecy
            var newEvent = _.clone(event);
            newEvent.type = 'init';
            evalWidgetEvent(widget, newEvent.type, newEvent);
        } else {
            removeWidgetEventsHandlers(widget);
        }
    };

    return Processor;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Processor
 * @name WbProcessorMicrodata
 * @description Widget processor
 * 
 * @name microdata
 * @description Handle widget microdata specification
 * 
 * Widget microdata is an specification which makes the widget readable by
 * search engines. This processor just run in ready mode. 
 * 
 * @see document/widgets-microdata.md
 */
.factory('WbProcessorMicrodata', function (WbProcessorAbstract) {

    var microdataAttributes = [
        'itemscope', // groups list of item properties
        'itemtype', // can use if it is item scope
        'itemprop',
        'itemref',
        'itemid',
        // extera properties
        'content',
        'value',
        ];

    function loadWidgetAttributes(widget, attributes){
        var $element = widget.getElement();
        angular.forEach(attributes, function(key){
            var value = widget.getProperty(key) || widget.getModelProperty(key);
            if(value){
                $element.attr(key, value);
            } else {
                $element.removeAttr(key);
            }
        });
    }


    function Processor(){
        WbProcessorAbstract.apply(this);
    }

    // extend functionality
    Processor.prototype = new WbProcessorAbstract();

    Processor.prototype.process = function(widget, event){
        // 1- Handle model load
        if(event.type === 'modelChanged' || event.type === 'stateChanged'){
            loadWidgetAttributes(widget, microdataAttributes);
            return;
        }

        // 2- Handle model update
        if(event.type === 'modelUpdated'){
            loadWidgetAttributes(widget, _.intersection(microdataAttributes, event.keys || [event.key]));
            return;
        }
    };
    return Processor;
});


angular.module('am-wb-core') //

.run(function($window, $q, $rootScope){

	var libs = {};
	var styles = {};

	/**
	 * Loads a library
	 * 
	 * @memberof NativeWindowWrapper
	 * @path path of library
	 * @return promise to load the library
	 */
	$window.loadLibrary = function(path){
		if(libs[path]){
			return $q.resolve({
				message: 'isload'
			});
		}
		var defer = $q.defer();

//		var document = this.getDocument();
		var script = document.createElement('script');
		script.src = path;
		script.async=1;
		script.onload = function(){
			libs[path] = true;
			defer.resolve({
				path: path,
				message: 'loaded'
			});
			if (!$rootScope.$$phase) {
				$rootScope.$digest();
			}
		};
		script.onerror = function() {
			libs[path] = false;
			defer.reject({
				path: path,
				message: 'fail'
			});
			if (!$rootScope.$$phase) {
				$rootScope.$digest();
			}
		};
		document.getElementsByTagName('head')[0].appendChild(script);
		return defer.promise;
	};

	$window.removeLibrary = function(path){
		return $q.resolve({
			source: path
		});
	};

	/**
	 * Check if the library is loaded
	 * 
	 * @memberof NativeWindowWrapper
	 * @return true if the library is loaded
	 */
	$window.isLibraryLoaded = function(path){
		if(libs[path]){
			return true;
		}
		return false;
	};

	/**
	 * Loads a style
	 * 
	 * loads css 
	 * 
	 * @memberof NativeWindowWrapper
	 * @path path of library
	 * @return promise to load the library
	 */
	$window.loadStyle = function(path){
		if(styles[path]){
			return $q.resolve(styles[path]);
		}
		var defer = $q.defer();

//		var document = this.getDocument();
		var style = document.createElement('link');
		style.setAttribute('rel', 'stylesheet');
		style.setAttribute('type', 'text/css');
		style.setAttribute('href', path);
		style.onload = function(){
			styles[path] = {
					element: style,
					path: path
			};
			defer.resolve(styles[path]);
			if (!$rootScope.$$phase) {
				$rootScope.$digest();
			}
		};
		style.onerror = function() {
			styles[path] = undefined;
			defer.reject({
				path: path,
				message: 'fail'
			});
			if (!$rootScope.$$phase) {
				$rootScope.$digest();
			}
		};
		document.getElementsByTagName('head')[0].appendChild(style);
		styles[path] = defer.promise;
		return styles[path];
	};

	$window.removeStyle = function(path){
		if(!this.isStyleLoaded(path)){
			return $q.resolve({});
		}
		var item = styles[path];
		item.element.parentNode.removeChild(item.element);
		styles[path] = undefined;
		$q.resolve(item);
	};

	/**
	 * Check if the style is loaded
	 * 
	 * @memberof NativeWindowWrapper
	 * @return true if the library is loaded
	 */
	$window.isStyleLoaded = function(path){
		if(styles[path]){
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
	$window.setMeta = function (key, value){
		var searchkey = key.replace(new RegExp(':', 'g'), '\\:');
		var headElement = $('head');
		var elements = headElement.find('meta[name="'+searchkey+'"]');
		// remove element
		if(_.isUndefined(value)){
			if(elements.length){
				elements.remove();
			}
			return;
		}
		// update element
		var metaElement;
		if(elements.length === 0){
			// title element not found
			metaElement = angular.element('<meta name=\''+key+'\' content=\'\' />');
			headElement.append(metaElement);
		} else {
			metaElement = angular.element(elements[0]);
		}
		metaElement.attr('content', value) ;
	};
	
	$window.getMeta = function (key){
		var searchkey = key.replace(new RegExp(':', 'g'), '\\:');
		var headElement = $('head');
		var elements = headElement.find('meta[name="'+searchkey+'"]');
		if(elements.length === 0){
			return;
		}
		return elements.attr('content') ;
	};

	/**
	 * Set link
	 * 
	 * @memberof NativeWindowWrapper
	 * @params key {string} the key of meta
	 * @params data {string} the value of meta
	 */
	$window.setLink = function(key, data){
		var searchkey = key.replace(new RegExp(':', 'g'), '\\:');
		var headElement = $('head');
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




/***********************************************************************
 * Processors
 ***********************************************************************/
angular.module('am-wb-core').run(function($widget, WbProcessorMicrodata, WbProcessorEvent, WbProcessorAttribute) {
	$widget.setProcessor('microdata', new WbProcessorMicrodata());
	$widget.setProcessor('event', new WbProcessorEvent());
	$widget.setProcessor('attribut', new WbProcessorAttribute());
});
/***********************************************************************
 * Providers
 ***********************************************************************/
angular.module('am-wb-core').run(function(
		/* angularjs */ $anchorScroll, $animate, $cacheFactory,
	$document, $exceptionHandler, $filter, $http, $httpParamSerializer,
	$httpParamSerializerJQLike, $interpolate, $interval, $locale, $location,
	$log, $parse, $q, $rootElement, $sce, $templateCache, $templateRequest,
	$timeout, $window,
		/* WB        */ $widget, $wbMedia, $wbStorage, $wbDispatcher) {
	$widget//
		// AngularJS
		.setProvider('$anchorScroll', $anchorScroll)
		.setProvider('$animate', $animate)
		//	.setProvider('$animateCss', $animateCss)
		.setProvider('$cacheFactory', $cacheFactory)
		//	.setProvider('$compile', $window)
		//	.setProvider('$controller', $window)
		.setProvider('$document', $document)
		.setProvider('$exceptionHandler', $exceptionHandler)
		.setProvider('$filter', $filter)
		.setProvider('$http', $http)
		//	.setProvider('$httpBackend', $window)
		.setProvider('$httpParamSerializer', $httpParamSerializer)
		.setProvider('$httpParamSerializerJQLike', $httpParamSerializerJQLike)
		.setProvider('$interpolate', $interpolate)
		.setProvider('$interval', $interval)
		//	.setProvider('$jsonpCallbacks', $window)
		.setProvider('$locale', $locale)
		.setProvider('$location', $location)
		.setProvider('$log', $log)
		.setProvider('$parse', $parse)
		.setProvider('$q', $q)
		.setProvider('$rootElement', $rootElement)
		//	.setProvider('$rootScope', $window)
		.setProvider('$sce', $sce)
		//	.setProvider('$sceDelegate', $window)
		.setProvider('$templateCache', $templateCache)
		.setProvider('$templateRequest', $templateRequest)
		.setProvider('$timeout', $timeout)
		.setProvider('$window', $window)
		//	.setProvider('$xhrFactory', $window)

		// wb-core
		.setProvider('$dispatcher', $wbDispatcher)
		.setProvider('$storage', $wbStorage)
		.setProvider('$media', $wbMedia);
});

/***********************************************************************
 * Widgets
 ***********************************************************************/
angular.module('am-wb-core').run(function($widget) {
	$widget.newWidget({
		// widget description
		type: 'a',
		title: 'A link',
		description: 'A widget to add external link. It is used as block item.',
		icon: 'wb-widget-a',
		groups: ['basic'],
		// functional properties
		model: {
			html: 'Link title'
		},
		controller: 'WbWidgetA',
		isLeaf: true
	});
	$widget.newWidget({
		// widget description
		type: 'address',
		title: 'address',
		description: 'description.',
		icon: 'wb-widget-address',
		groups: ['basic'],
		// functional properties
		controller: 'WbWidgetAddress',
		isLeaf: false
	});
	$widget.newWidget({
		// widget description
		type: 'applet',
		title: 'applet',
		description: 'applet.',
		icon: 'wb-widget-applet',
		groups: ['basic'],
		// functional properties
		controller: 'WbWidgetApplet',
		isLeaf: true
	});
	$widget.newWidget({
		// widget description
		type: 'area',
		title: 'area',
		description: 'area',
		icon: 'wb-widget-area',
		groups: ['basic'],
		// functional properties
		controller: 'WbWidgetArea'
	});
	$widget.newWidget({
		// widget description
		type: 'article',
		title: 'article',
		description: 'article',
		icon: 'wb-widget-article',
		groups: ['basic'],
		// functional properties
		controller: 'WbWidgetArticle'
	});
	$widget.newWidget({
		// widget description
		type: 'aside',
		title: 'aside',
		description: 'aside',
		icon: 'wb-widget-aside',
		groups: ['basic'],
		// functional properties
		controller: 'WbWidgetAside'
	});
	$widget.newWidget({
		type: 'audio',
		title: 'Audio',
		label: 'audio',
		icon: 'wb-widget-audio',
		description: 'This widget is used to add audio in the document.',
		groups: ['basic'],
		model: {
			media: '(min-width: 650px)',
			src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
		},
		controller: 'WbWidgetAudio',
		isLeaf: false,
	});
	$widget.newWidget({
		type: 'blockquote',
		title: 'blockquote',
		label: 'blockquote',
		icon: 'wb-widget-blockquote',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetBlockquote',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'button',
		title: 'button',
		label: 'button',
		icon: 'wb-widget-button',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetButton',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'canvas',
		title: 'canvas',
		label: 'canvas',
		icon: 'wb-widget-canvas',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetCanvas',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'datalist',
		title: 'datalist',
		label: 'datalist',
		icon: 'wb-widget-datalist',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDatalist',
	});
	$widget.newWidget({
		type: 'dd',
		title: 'dd',
		label: 'dd',
		icon: 'wb-widget-dd',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDd',
	});
	$widget.newWidget({
		type: 'details',
		title: 'details',
		label: 'details',
		icon: 'wb-widget-details',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDetails',
	});
	$widget.newWidget({
		type: 'dialog',
		title: 'dialog',
		label: 'dialog',
		icon: 'wb-widget-dialog',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDialog',
	});
	$widget.newWidget({
		type: 'div',
		title: 'div',
		label: 'div',
		icon: 'wb-widget-div',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDiv',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'dl',
		title: 'dl',
		label: 'dl',
		icon: 'wb-widget-dl',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDl',
	});
	$widget.newWidget({
		type: 'dt',
		title: 'dt',
		label: 'dt',
		icon: 'wb-widget-dt',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetDt',
	});
	$widget.newWidget({
		type: 'embed',
		title: 'embed',
		label: 'embed',
		icon: 'wb-widget-embed',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-embed',
		controller: 'WbWidgetEmbed',
	});
	$widget.newWidget({
		type: 'fieldset',
		title: 'fieldset',
		label: 'fieldset',
		icon: 'wb-widget-fieldset',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-fieldset',
		controller: 'WbWidgetFieldset',
	});
	$widget.newWidget({
		type: 'figcaption',
		title: 'figcaption',
		label: 'figcaption',
		icon: 'wb-widget-figcaption',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-figcaption',
		controller: 'WbWidgetFigcaption',
	});
	$widget.newWidget({
		type: 'figure',
		title: 'figure',
		label: 'figure',
		icon: 'wb-widget-figure',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-figure',
		controller: 'WbWidgetFigure',
	});
	$widget.newWidget({
		type: 'footer',
		title: 'footer',
		label: 'footer',
		icon: 'wb-widget-footer',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-footer',
		controller: 'WbWidgetFooter',
	});
	$widget.newWidget({
		type: 'form',
		title: 'form',
		label: 'form',
		icon: 'wb-widget-form',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-form',
		controller: 'WbWidgetForm',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'frame',
		title: 'frame',
		label: 'frame',
		icon: 'wb-widget-form',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-frame',
		controller: 'WbWidgetFrame',
	});
	$widget.newWidget({
		type: 'frameset',
		title: 'frameset',
		label: 'frameset',
		icon: 'wb-widget-frameset',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-frameset',
		controller: 'WbWidgetFrameset',
		isLeaf: false
	});
	for (var i = 1; i < 7; i++) {
		var type = 'h' + i;
		$widget.newWidget({
			// widget description
			type: type,
			title: 'Header Level ' + i,
			description: 'A header widget',
			icon: 'wb-widget-h' + i,
			groups: ['basic'],
			model: {
				name: 'Header-' + i,
				style: {
					padding: '8px'
				}
			},
			// functional properties
			controller: 'WbWidgetH',
			isLeaf: true
		});
	}
	$widget.newWidget({
		type: 'header',
		title: 'header',
		label: 'header',
		icon: 'wb-widget-header',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetHeader',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'hr',
		title: 'hr',
		label: 'hr',
		icon: 'wb-widget-hr',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetHr',
		isLeaf: true,
	});
	$widget.newWidget({
		// widget description
		type: 'i',
		title: 'Italics',
		description: 'The widget defines a part of text in an alternate voice or mood.',
		icon: 'wb-widget-i',
		groups: ['basic'],
		model: {
			name: 'i',
			html: 'Text'
		},
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-i',
		// functional properties
		controllerAs: 'ctrl',
		controller: 'WbWidgetI',
		isLeaf: true,
	});
	$widget.newWidget({
		// widget description
		type: 'iframe',
		title: 'Inline Frame',
		description: 'Add inline frame to show another document within current one.',
		icon: 'wb-widget-iframe',
		groups: ['basic'],
		model: {
			name: 'iframe',
			sandbox: 'allow-same-origin allow-scripts',
			src: 'https://www.google.com',
			style: {
				padding: '8px'
			}
		},
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-iframe',
		// functional properties
		controllerAs: 'ctrl',
		controller: 'WbWidgetIframe',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'img',
		title: 'Image',
		label: 'image',
		icon: 'wb-widget-img',
		description: 'A widget to insert an link to page.',
		groups: ['basic'],
		model: {
			html: 'img',
			src: 'resources/wb-brand-3.0.png',
			style: {
				width: '80%',
				maxWidth: '500px'
			}
		},
		controllerAs: 'ctrl',
		controller: 'WbWidgetImg',
		isLeaf: true,
	});
	$widget.newWidget({
		// widget description
		type: 'input',
		title: 'Input field',
		description: 'A widget to get data from users.',
		icon: 'wb-widget-input',
		groups: ['basic'],
		model: {
			name: 'input',
			sandbox: 'allow-same-origin allow-scripts',
			src: 'https://www.google.com',
			style: {
				padding: '8px'
			}
		},
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-input',
		// functional properties
		controller: 'WbWidgetInput',
		controllerAs: 'ctrl',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'kbd',
		title: 'kbd',
		label: 'kbd',
		icon: 'wb-widget-kbd',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetKbd',
	});
	$widget.newWidget({
		type: 'label',
		title: 'label',
		label: 'label',
		icon: 'wb-widget-label',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetLabel',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'legend',
		title: 'legend',
		label: 'legend',
		icon: 'wb-widget-legend',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetLegend',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'li',
		title: 'li',
		label: 'li',
		icon: 'wb-widget-li',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetLi',
		isLeaf: false,
	});
	$widget.newWidget({
		type: 'link',
		title: 'Link',
		label: 'link',
		icon: 'wb-widget-link',
		description: 'A widget to insert an link to page.',
		groups: ['basic'],
		model: {
			html: 'Link',
			url: 'http://www.gitlab.com/am-wb/am-wb-common'
		},
		controllerAs: 'ctrl',
		controller: 'WbWidgetLink',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'main',
		title: 'main',
		label: 'main',
		icon: 'wb-widget-main',
		description: 'A widget to insert an link to page.',
		groups: ['basic'],
		controller: 'WbWidgetMain',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'map',
		title: 'map',
		label: 'map',
		icon: 'wb-widget-map',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetMap',
		isLeaf: false
	});
	$widget.newWidget({
		// widget description
		type: 'meta',
		title: 'Meta',
		description: 'A widget to add meta data.',
		icon: 'wb-widget-meta',
		groups: ['basic'],
		model: {
			name: 'name',
			content: 'content',
			style: {
				margin: '8px',
				background: {
					color: '#313131',
				},
				border: {
					style: 'dotted',
					color: '#afafaf'
				},
				color: '#ffffff',
				padding: '8px'
			}
		},
		// functional properties
		controllerAs: 'ctrl',
		controller: 'WbWidgetMeta'
	});
	$widget.newWidget({
		type: 'meter',
		title: 'meter',
		label: 'meter',
		icon: 'wb-widget-meter',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetMeter',
	});
	$widget.newWidget({
		type: 'nav',
		title: 'nav',
		label: 'nav',
		icon: 'wb-widget-nav',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetNav',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'noscript',
		title: 'noscript',
		label: 'noscript',
		icon: 'wb-widget-noscript',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetNoscript',
	});
	$widget.newWidget({
		type: 'object',
		title: 'object',
		label: 'object',
		icon: 'wb-widget-object',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetObject',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'ol',
		title: 'ol',
		label: 'ol',
		icon: 'wb-widget-ol',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetOl',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'optgroup',
		title: 'optgroup',
		label: 'optgroup',
		icon: 'wb-widget-optgroup',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetOptgroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'option',
		title: 'option',
		label: 'option',
		icon: 'wb-widget-option',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetOption',
	});
	$widget.newWidget({
		type: 'output',
		title: 'output',
		label: 'output',
		icon: 'wb-widget-output',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetOutput',
	});
	$widget.newWidget({
		// widget description
		type: 'p',
		title: 'Paragraph',
		description: 'A widget to add paragraph.',
		icon: 'wb-widget-p',
		groups: ['basic'],
		model: {
			name: 'Pragraph',
			style: {
				padding: '8px'
			}
		},
		// functional properties
		controllerAs: 'ctrl',
		controller: 'WbWidgetP',
		isLeaf: true
	});
	$widget.newWidget({
		type: 'param',
		title: 'param',
		label: 'param',
		icon: 'wb-widget-param',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetParam',
		isLeaf: true,
	});
	$widget.newWidget({
		type: 'picture',
		title: 'Picture',
		label: 'picture',
		icon: 'wb-widget-picture',
		description: 'This widget is used to add picture in the document.',
		groups: ['basic'],
		model: {
			media: '(min-width: 650px)',
			src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
		},
		controller: 'WbWidgetPicture',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'pre',
		title: 'Preformatted',
		label: 'preformatted',
		icon: 'wb-widget-pre',
		description: 'A widget to insert an Preformatted text to page.',
		groups: ['basic'],
		model: {
			html: 'class A {\n\tint a;\n}',
		},
		controller: 'WbWidgetPre',
		controllerAs: 'ctrl',
		isLeaf: true
	});
	$widget.newWidget({
		// widget description
		type: 'progress',
		title: 'Progress',
		description: 'A widget to add progress.',
		icon: 'wb-widget-progress',
		groups: ['basic'],
		model: {
			name: 'progress',
			style: {
				padding: '8px',
				margin: '8px',
				size: {
					height: '30px'
				}
			}
		},
		// functional properties
		controller: 'WbWidgetProgress'
	});
	$widget.newWidget({
		type: 'q',
		title: 'q',
		label: 'q',
		icon: 'wb-widget-q',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetQ',
	});
	$widget.newWidget({
		type: 's',
		title: 'S',
		icon: 'wb-widget-s',
		description: 'The widget is used to define text that is no longer correct.',
		groups: ['basic'],
		model: {
			html: 'Text'
		},
		controller: 'WbWidgetS',
	});
	$widget.newWidget({
		type: 'samp',
		title: 'Samp',
		icon: 'wb-widget-samp',
		description: 'It defines sample output from a computer program.',
		groups: ['basic'],
		model: {
			html: 'Text'
		},
		controller: 'WbWidgetSamp',
	});
	$widget.newWidget({
		type: 'script',
		title: 'script',
		label: 'script',
		icon: 'wb-widget-script',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetScript',
	});
	$widget.newWidget({
		type: 'section',
		title: 'section',
		label: 'section',
		icon: 'wb-widget-section',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetSection',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'select',
		title: 'select',
		label: 'select',
		icon: 'wb-widget-select',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetSelect',
	});
	$widget.newWidget({
		type: 'small',
		title: 'Small',
		icon: 'wb-widget-small',
		description: 'The widget defines smaller text.',
		groups: ['basic'],
		model: {
			html: 'Small text'
		},
		controller: 'WbWidgetSmall',
	});
	$widget.newWidget({
		type: 'source',
		title: 'Source',
		label: 'source',
		icon: 'wb-widget-source',
		description: 'This widget is used to add source in the document.',
		groups: ['basic'],
		model: {
			media: '(min-width: 650px)',
			src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
		},
		controller: 'WbWidgetSource',
	});
	$widget.newWidget({
		type: 'span',
		title: 'Span',
		icon: 'wb-widget-span',
		description: 'The widget is used to group inline-elements in a document.',
		groups: ['basic'],
		model: {
			html: 'Text'
		},
		controller: 'WbWidgetSpan',
	});
	$widget.newWidget({
		type: 'strong',
		title: 'Strong',
		icon: 'wb-widget-strong',
		description: 'The widget defines strong emphasized text.',
		groups: ['basic'],
		model: {
			html: 'Text'
		},
		controller: 'WbWidgetStrong',
	});
	$widget.newWidget({
		type: 'style',
		title: 'style',
		label: 'style',
		icon: 'wb-widget-style',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetStyle',
	});
	$widget.newWidget({
		type: 'summary',
		title: 'summary',
		label: 'summary',
		icon: 'wb-widget-summary',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetSummary',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'svg',
		title: 'svg',
		label: 'svg',
		icon: 'wb-widget-svg',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetSvg',
	});
	$widget.newWidget({
		type: 'template',
		title: 'template',
		label: 'template',
		icon: 'wb-widget-template',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetTemplate',
		isLeaf: false
	});
	$widget.newWidget({
		// widget description
		type: 'textarea',
		title: 'Text Area field',
		description: 'A widget to get data from users.',
		icon: 'wb-widget-textarea',
		groups: ['basic'],
		model: {
			name: 'textarea',
			style: {
				padding: '8px'
			}
		},
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-textarea',
		// functional properties
		controller: 'WbWidgetTextarea',
	});
	$widget.newWidget({
		type: 'track',
		title: 'track',
		label: 'track',
		icon: 'wb-widget-track',
		description: 'description',
		groups: ['basic'],
		help: 'http://dpq.co.ir/more-information-track',
		controller: 'WbWidgetTrack',
	});
	$widget.newWidget({
		type: 'ul',
		title: 'ul',
		label: 'ul',
		icon: 'wb-widget-ul',
		description: 'description',
		groups: ['basic'],
		controller: 'WbWidgetUl',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'video',
		title: 'Video',
		label: 'video',
		icon: 'wb-widget-video',
		description: 'This widget is used to add video in the document.',
		groups: ['basic'],
		model: {
			media: '(min-width: 650px)',
			src: 'http://www.gitlab.com/am-wb/am-wb-commonhttps://unsplash.com/photos/8emNXIvrCL8/download?force=true'
		},
		controller: 'WbWidgetVideo',
		isLeaf: false
	});


	$widget.newWidget({
		// widget description
		type: 'ObjectCollection',
		title: 'Object collection',
		description: 'A widget to show a collection of items',
		groups: ['seen'],
		icon: 'pages',
		model: '',
		// functional properties
		help: '',
		helpId: 'wb-seen-widget-collection',
		template: '<div></div>',
		controller: 'AmWbSeenCollectionWidget'
	});

	$widget.newWidget({
		type: 'import',
		title: 'Import',
		description: 'Import a part of other content',
		groups: ['commons'],
		icon: 'import_export',
		setting: ['import'],
		// help
		help: '',
		helpId: '',
		// functional (page)
		template: '<div></div>',
		controller: 'WbWidgetSeenImport'
	});
	
	//-----------------------------------------------------------------
	// Table
	//-----------------------------------------------------------------
	$widget.newWidget({
		type: 'table',
		controller: 'WbWidgetGroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'thead',
		controller: 'WbWidgetGroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'tbody',
		controller: 'WbWidgetGroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'th',
		controller: 'WbWidgetGroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'tr',
		controller: 'WbWidgetGroup',
		isLeaf: false
	});
	$widget.newWidget({
		type: 'td',
		controller: 'WbWidgetGroup',
		isLeaf: false
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


/**
 * @ngdoc Services
 * @name $wbDispatcher
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
function WbDispatcher() {
    

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
     *  if (payload.actionType === 'country-update') { 
     *      CountryStore.country = payload.selectedCountry; 
     *  } 
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
}

angular.module('am-wb-core')
.service('$dispatcher', WbDispatcher)
.service('$wbDispatcher', WbDispatcher);

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

/**
 * @ngdoc Service
 * @name $ObjectPath
 * 
 * Utility to access object properties
 */
angular.module('am-wb-core').service('$objectPath', function(){
	var _hasOwnProperty = Object.prototype.hasOwnProperty;
	var options = {
//			includeInheritedProps: false,
	};

	function getKey(key){
		var intKey = parseInt(key);
		if (intKey.toString() === key) {
			return intKey;
		}
		return key;
	}


	function getShallowProperty(obj, prop) {
		if(options.includeInheritedProps || (typeof prop === 'number' && _.isArray(obj)) || obj.hasOwnProperty(prop)) {
			return obj[prop];
		}
	}

	function set(obj, path, value, doNotReplace){
		if (typeof path === 'number') {
			path = [path];
		}
		if (!path || path.length === 0) {
			return obj;
		}
		if (typeof path === 'string') {
			return set(obj, path.split('.').map(getKey), value, doNotReplace);
		}
		var currentPath = path[0];
		var currentValue = getShallowProperty(obj, currentPath);
		if (path.length === 1) {
			if (currentValue === void 0 || !doNotReplace) {
				obj[currentPath] = value;
			}
			return currentValue;
		}

		if (currentValue === void 0) {
			//check if we assume an array
			if(typeof path[1] === 'number') {
				obj[currentPath] = [];
			} else {
				obj[currentPath] = {};
			}
		}

		return set(obj[currentPath], path.slice(1), value, doNotReplace);
	}

	/**
	 * @name has
	 * @memberof $ObjectPath
	 */
	this.has = function (obj, path) {
		if (obj == null) {
			return false;
		}

		if (typeof path === 'number') {
			path = [path];
		} else if (typeof path === 'string') {
			path = path.split('.');
		}

		if (!path || path.length === 0) {
			return false;
		}

		for (var i = 0; i < path.length; i++) {
			var j = getKey(path[i]);
			if((typeof j === 'number' && _.isArray(obj) && j < obj.length) ||
					(options.includeInheritedProps ? (j in Object(obj)) : _hasOwnProperty.call(obj, j))) {
				obj = obj[j];
			} else {
				return false;
			}
		}

		return true;
	};

	/**
	 * @name ensureExists
	 * @memberof $ObjectPath
	 */
	this.ensureExists = function (obj, path, value){
		return set(obj, path, value, true);
	};

	/**
	 * @name set
	 * @memberof $ObjectPath
	 */
	this.set = function (obj, path, value, doNotReplace){
		return set(obj, path, value, doNotReplace);
	};

	/**
	 * @name insert
	 * @memberof $ObjectPath
	 */
	this.insert = function (obj, path, value, at){
		var arr = this.get(obj, path);
		at = ~~at;
		if (!_.isArray(arr)) {
			arr = [];
			this.set(obj, path, arr);
		}
		arr.splice(at, 0, value);
	};


	/**
	 * @name haemptys
	 * @memberof $ObjectPath
	 * 
	 * empty a given path (but do not delete it) depending on their type,so it
	 * retains reference to objects and arrays.
	 * 
	 * functions that are not inherited from prototype are set to null.
	 * 
	 * object instances are considered objects and just own property names are
	 * deleted
	 */
	this.empty = function(obj, path) {
		if (_.isEmpty(path)) {
			return void 0;
		}
		if (obj == null) {
			return void 0;
		}

		var value, i;
		if (!(value = this.get(obj, path))) {
			return void 0;
		}

		if (typeof value === 'string') {
			return this.set(obj, path, '');
		} else if (_.isBoolean(value)) {
			return this.set(obj, path, false);
		} else if (typeof value === 'number') {
			return this.set(obj, path, 0);
		} else if (_.isArray(value)) {
			value.length = 0;
		} else if (_.isObject(value)) {
			for (i in value) {
				if (_hasOwnProperty.call(value, i)) {
					delete value[i];
				}
			}
		} else {
			return this.set(obj, path, null);
		}
	};


	/**
	 * @name push
	 * @memberof $ObjectPath
	 * 
	 * example:
	 * 
	 * $ObjectPath.push(obj, 'a.b', 'a', 'b', 'c', 'd');
	 */
	this.push = function (obj, path /*, values */){
		var arr = this.get(obj, path);
		if (!_.isArray(arr)) {
			arr = [];
			this.set(obj, path, arr);
		}

		arr.push.apply(arr, Array.prototype.slice.call(arguments, 2));
	};

	/**
	 * @name coalesce
	 * @memberof $ObjectPath
	 * 
	 * get the first non-undefined value
	 * 
	 * objectPath.coalesce(obj, ['a.z', 'a.d'], 'default');
	 */
	this.coalesce = function (obj, paths, defaultValue) {
		var value;

		for (var i = 0, len = paths.length; i < len; i++) {
			if ((value = this.get(obj, paths[i])) !== void 0) {
				return value;
			}
		}

		return defaultValue;
	};


	/**
	 * @name get
	 * @memberof $ObjectPath
	 * 
	 * get deep property
	 * 
	 * objectPath.get(obj, "a.b");  //returns "d"
	 * objectPath.get(obj, ["a", "dot.dot"]);  //returns "key"
	 * objectPath.get(obj, 'a.\u1200');  //returns "unicode key"
	 */
	this.get = function (obj, path, defaultValue){
		if (typeof path === 'number') {
			path = [path];
		}
		if (!path || path.length === 0) {
			return obj;
		}
		if (obj == null) {
			return defaultValue;
		}
		if (typeof path === 'string') {
			return this.get(obj, path.split('.'), defaultValue);
		}

		var currentPath = getKey(path[0]);
		var nextObj = getShallowProperty(obj, currentPath);
		if (nextObj === void 0) {
			return defaultValue;
		}

		if (path.length === 1) {
			return nextObj;
		}

		return this.get(obj[currentPath], path.slice(1), defaultValue);
	};

	/**
	 * @name del
	 * @memberof $ObjectPath
	 */
	this.del = function del(obj, path) {
		if (typeof path === 'number') {
			path = [path];
		}

		if (obj == null) {
			return obj;
		}

		if (_.isEmpty(path)) {
			return obj;
		}
		if(typeof path === 'string') {
			return this.del(obj, path.split('.'));
		}

		var currentPath = getKey(path[0]);
		var currentVal = getShallowProperty(obj, currentPath);
		if(currentVal == null) {
			return currentVal;
		}

		if(path.length === 1) {
			if (_.isArray(obj)) {
				obj.splice(currentPath, 1);
			} else {
				delete obj[currentPath];
			}
		} else {
			if (obj[currentPath] !== void 0) {
				return this.del(obj[currentPath], path.slice(1));
			}
		}

		return obj;
	};

	//
//		var objectPath = function(obj) {
//			return Object.keys(objectPath).reduce(function(proxy, prop) {
//				if(prop === 'create') {
//					return proxy;
//				}
	//
//				/*istanbul ignore else*/
//				if (typeof objectPath[prop] === 'function') {
//					proxy[prop] = objectPath[prop].bind(objectPath, obj);
//				}
	//
//				return proxy;
//			}, {});
//		};

});

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
.service('$wbStorage', function() {});
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
angular.module('am-wb-core').service('$wbUtil', function(
        /* AngularJS */ $q, $templateRequest, $sce
        /* mb-core   */) {

	//	var converterDom = new WbConverterDom();

	function getTemplateOf(page) {
		var template = page.template;
		var templateUrl = page.templateUrl;
		if (angular.isDefined(template)) {
			if (angular.isFunction(template)) {
				template = template(page.params || page);
			}
		} else if (angular.isDefined(templateUrl)) {
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
	function getTemplateFor(page) {
		return $q.when(getTemplateOf(page));
	}


	function cleanEvetns(model) {
		if (model.on) {
			delete model.event;
			return;
		}

		// event
		if (!model.event) {
			model.event = {};
		}

		// load legecy events
		if (model.event.failure) {
			model.event.error = model.event.failure;
			delete model.event.failure;
		}

		if (model.event) {
			model.on = model.event;
			delete model.event;
		}

		// add a note to all event 
		if (model.on) {
			_.forOwn(model.on, function(value, key) {
				model.on[key] = '/* code style is deprecated. see http://www.viraweb123.ir/amh-blog/content/wb-v4-release */ \n' + value;
			});
		}
	}

	function cleanLayout(model) {
		if (model.style.layout) {
			if (model.style.layout.align_self) {
				model.style.alignSelf = model.style.layout.align_self;
			}
			if (model.style.layout.direction) {
				model.style.display = 'flex';

				//				model.style.flex
				model.style.flexGrow = model.style.layout.grow;
				model.style.flexShrink = model.style.layout.shrink;
				model.style.flexBasis = model.style.layout.basis;

				//				model.style.flexFlow
				model.style.flexDirection = model.style.layout.direction;
				model.style.flexWrap = model.style.layout.wrap ? 'wrap' : 'no-wrap';
				model.style.justifyContent = model.style.layout.justify;
				if (model.style.justifyContent === 'end' || model.style.justifyContent === 'end') {
					model.style.justifyContent = 'flex-' + model.style.justifyContent;
				}
				//				alignContent = ??
				model.style.alignItems = model.style.layout.align;
				model.style.order = model.style.layout.order;
			}
			delete model.style.layout;
			return;
		}
	}

	function cleanSize(model) {
		// w1 style.size -> w4
		if (model.style.size) {
			model.style.width = model.style.size.width;
			model.style.minWidth = model.style.size.minWidth;
			model.style.maxWidth = model.style.size.maxWidth;

			model.style.height = model.style.size.height;
			model.style.minHeight = model.style.size.minHeight;
			model.style.maxHeight = model.style.size.maxHeight;
			delete model.style.size;
		}
	}

	function cleanBackground(model) {
		if (model.style.background) {
			if (model.style.background.image) {
				model.style.backgroundImage = 'url("' + model.style.background.image + '")';
			}
			model.style.backgroundColor = model.style.background.color;
			model.style.backgroundSize = model.style.background.size;
			model.style.backgroundRepeat = model.style.background.repeat;
			model.style.backgroundOrigin = model.style.background.origin;
			model.style.backgroundPosition = model.style.background.position;
			delete model.style.background;
			return;
		}
	}

	function cleanBorder(model) {
		// w1 border -> w4
		if (model.style.border) {
			model.style.borderStyle = model.style.border.style;
			model.style.borderColor = model.style.border.color;
			model.style.borderWidth = model.style.border.width;
			model.style.borderRadius = model.style.border.radius;
			delete model.style.border;
			return;
		}
	}

	function cleanSpace(model) {
		// Padding from W0 -> w4
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

		// Margin from W0 -> w4
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

	function cleanAlign(/*model*/) {
		//		if (!model.style.align) {
		//		model.style.align = {};
		//		}
	}

	function cleanOverflow(model) {
		if (model.style.overflow) {
			model.style.overflowX = model.style.overflow.x;
			model.style.overflowY = model.style.overflow.y;
		}
	}

	function cleanShadow(model) {
		//h-offset v-offset blur spread color
		if (model.style.shadows) {
			var boxShadows = [];
			_.forEach(model.style.shadows, function(shadow) {
				var sh = shadow.hShift + ' ' +
					shadow.vShift + ' ' +
					shadow.blur + ' ' +
					shadow.spread + ' ' +
					shadow.color;
				if (shadow.inset) {
					sh += ' ' + 'inset';
				}
				boxShadows.push(sh);
			});
			model.style.boxShadow = _.join(boxShadows);
			delete model.style.shadows;
			return;
		}
	}

	function cleanStyle(model) {
		if (!angular.isObject(model.style)) {
			model.style = {};
		}
		cleanLayout(model);
		cleanSize(model);
		cleanBackground(model);
		cleanBorder(model);
		cleanSpace(model);
		cleanAlign(model);
		cleanOverflow(model);
		cleanShadow(model);
	}

	function cleanType(model) {
		if (model.type === 'Group') {
			model.type = 'div';
		}
		if (model.type === 'Import') {
			model.type = 'import';
		}
		if (model.type === 'Link') {
			model.type = 'a';
			model.html = model.title;
			model.href = model.url;
			model.style.text = {
				align: 'center'
			};
			model.style.cursor = 'pointer';

			delete model.title;
			delete model.url;
		}
		if (model.type === 'Image') {
			model.type = 'img';
			model.src = model.url;

			delete model.url;
		}
		if (model.type === 'HtmlText') {
			model.html = model.text;
			delete model.text;
		}
		//		if(model.type === 'HtmlText'){
		//			model.type = 'section';
		//			model.children = converterDom.decode(model.html);
		//			delete model.html;
		//		}
	}

	function cleanInternal(model) {
		delete model.version;
		cleanEvetns(model);
		cleanStyle(model);
		if (_.isArray(model.contents)) {
			model.children = model.contents;
			delete model.contents;
		}
		if (_.isArray(model.children) && model.children.length) {
			_.forEach(model.children, cleanInternal);
		}
		cleanType(model);
		return model;
	}

	/**
	 * Clean data model
	 * @name clean 
	 * @param {object} model 
	 * @param {type} force
	 */
	function clean(model, force) {
		if (!model.type || model.type === 'Page' || model.type === 'Group') {
			model.type = 'div';
		}
		if (model.version === 'wb4' && !force) {
			return model;
		}
		var newModel = cleanInternal(model);
		newModel.version = 'wb4';
		return newModel;
	}

	this.clean = clean;

	this.getTemplateFor = getTemplateFor;
	this.getTemplateOf = getTemplateOf;

	this.findWidgetModelById = function(model, id) {
		if (model.id === id) {
			return model;
		}
		if (_.isArray(model.children)) {
			for (var i = 0; i < model.children.length; i++) {
				var child = this.findWidgetModelById(model.children[i], id);
				if (child) {
					return child;
				}
			}
		}
		return null;
	};

	this.replaceWidgetModelById = function(model, id, newModel) {
		if (!model || model.id == id) {
			return newModel;
		}
		if (_.isArray(model.children)) {
			for (var i = 0; i < model.children.length; i++) {
				if (model.children[i].id === id) {
					model.children[i] = newModel;
					return model;
				}
			}
			for (i = 0; i < model.children.length; i++) {
				var genModel = this.replaceWidgetModelById(model.children[i], id, newModel);
				if (genModel) {
					return model;
				}
			}
		}

		return;
	};

	this.downloadWidgetModel = function(url, id) {
		var ctrl = this;
		return $templateRequest(url)
			.then(function(template) {
				var obj = ctrl.clean(angular.fromJson(template));
				if (!id) {
					return obj;
				}
				return ctrl.findWidgetModelById(obj, id);
			});
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



/**
 * @ngdoc Services
 * @name $widget
 * @description مدیریت ویجت‌های سیستم
 * 
 * این سرویس تمام ویجت‌های قابل استفاده در سیستم را تعیین می‌کند.
 */
angular.module('am-wb-core').service('$widget', function(
        /* AngularJS */ $q, $injector, $log,
        /* wb-core */ WidgetEditor) {

	var _group_repo = [];
	var service = this;

	var contentElementAsso = [];
	var elementKey = [];

	var widgetDefinition = {};

	/*
	 * List of all widget processor
	 * 
	 * A processor is a function which accepts widget and event then 
	 * update widget based on the event. There are many predefined processor
	 * such as style, microdata, and DND processors.
	 * 
	 */
	var processors = {};

	/*
	 * List of converters
	 */
	var converters = [];

	var notFoundWidget = {
		template: '<div ng-show="wbEditable">Unsuported widget?!</div>',
		label: 'Not found',
		description: 'Element not found'
	};

	function _group(groupId) {
		for (var i = 0; i < _group_repo.length; i++) {
			if (_group_repo[i].id === groupId) {
				return _group_repo[i];
			}
		}
		var group = {
			id: groupId
		};
		_group_repo.push(group);
		return group;
	}

	function _newGroup(group) {
		var g = _group(group.id);
		angular.extend(g, group);
	}

	function _groups() {
		return _group_repo;
	}

	function _widget(model) {
		return widgetDefinition[model.type || model] || notFoundWidget;
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
		var list = { items: [] };
		// XXX: maso, 1395: تعیین خصوصیت‌ها به صورت دستی است
		_.forEach(widgetDefinition, function(widget) {
			list.items.push(widget);
		});
		return $q.when(list);
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
		if (hasWidget(widget.type)) {
			$log.warn('Widget is replaced', widget);
		}
		// fix widget data
		widget.model = widget.model || { style: {} };
		widget.model.type = widget.type;
		widget.model.name = widget.model.name || widget.title;

		widgetDefinition[widget.type] = widget;
		return service;
	}

	function hasWidget(type) {
		return !_.isUndefined(widgetDefinition[type]);
	}

	this.hasWidget = hasWidget;

	function isWidgetLeaf(type) {
		return widgetDefinition[type] && widgetDefinition.isLeaf;
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
	function compile(model, $parent, preElement) {
		var wd = _widget(model);
		var $element;
		if (preElement) {
			$element = preElement;
		} else {
			$element = angular.element('<' + model.type + '></' + model.type + '>');
		}
		var Widget = $injector.get(wd.controller || 'WbWidgetAbstract');
		var widget = new Widget($element, $parent);
		$element[0].$$wbController = widget;
		return $q.resolve(widget.setModel(model));
	}

	/**
	 * Creates new serialized data of widget
	 * 
	 * @memberof $widget
	 * @param widget
	 * @returns
	 */
	function widgetData(widget) {
		return angular.copy(widget.model);
	}

	// widgets
	service.newWidget = newWidget;
	service.widget = widget;
	service.widgets = widgets;
	service.widgetData = widgetData;
	service.isWidgetLeaf = isWidgetLeaf;

	// new api
	service.getWidget = _widget;
	service.getWidgets = function() {
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
		if (widget.isLeaf()) {
			return widgets;
		}

		// load list of widgets
		var groups = [];
		_.forEach(widget.getChildren(), function(child) {
			groups.push(child);
		});
		while (groups.length) {
			widget = groups.pop();
			widgets.push(widget);
			if (!widget.isLeaf()) {
				var children = widget.getChildren();
				for (var i = 0; i < children.length; i++) {
					var child = children[i];
					groups.push(child);
				}
			}
		}
		//return the list
		return widgets;
	};

	/***********************************************
	 * providers
	 ***********************************************/

	var providers = {};

	/**
	 * Removes a provider by its key
	 * 
	 * @memberof $widget
	 * @param key {string} of the provider
	 * @return the provider or null
	 */
	this.removeProvider = function(key) {
		var provider = providers[key];
		providers[key] = undefined;
		return provider;
	};

	/**
	 * Gets a provider by its key
	 * 
	 * @memberof $widget
	 * @param key {string} of the provider
	 * @return the provider or null
	 */
	this.getProvider = function(key) {
		return providers[key];
	};

	/**
	 * Sets a provider for the specified key
	 * 
	 * @memberof $widget
	 * @para key {string} of the provider
	 */
	this.setProvider = function(key, provider) {
		providers[key] = provider;
		return this;
	};

	/**
	 * Gets the list of providers
	 * 
	 * @memberof $widget
	 * @return list of providers
	 */
	this.getProviders = function() {
		return providers;
	};

	/**
	 * Sets a provider
	 * 
	 * @deprecated use setprovider insted
	 */
	this.addProvider = function(key, provider) {
		return this.setProvider(key, provider);
	};

	/**
	 * Gets list of providers keys
	 * 
	 * @memberof $widget
	 * @return list of keys
	 */
	this.getProvidersKey = function() {
		return _.keys(providers);
	};

	/***********************************************
	 * Editors
	 ***********************************************/
	var editors = {};
	var fakeEditor = new WidgetEditor();



	/**
	 * Set editor of a widgets
	 * 
	 * on double click editors are used to edit the widget.
	 * 
	 * @params type {string} type of the widget
	 * @params editor {Editor} editor
	 * @memberof $widget
	 */
	this.setEditor = function(type, editor) {
		editors[type] = editor;
	};

	/**
	 * Find editor for the given widget
	 * 
	 * @params widget {WbWidget} the widget
	 * @return the editor or fake editor
	 * @memberof $widget
	 */
	this.getEditor = function(widget) {
		if (widget.$$wbEditor) {
			// return old editor
			return widget.$$wbEditor;
		}
		if (editors[widget.getType()] === undefined) {
			return fakeEditor;
		}
		var register = editors[widget.getType()];
		// create editor
		var Editor = $injector.get(register.type);
		var editor = new Editor(widget, register.options || {});
		var ctrl = this;
		widget.$$wbEditor = editor;
		editor.on('destroy', function() {
			ctrl.removeEditorFromList(editor);
		});
		return editor;
	};

	//  this.getEditors = function(){};
	//  this.getActiveEditor = function(){};


	/***********************************************
	 * Processors
	 ***********************************************/
	/**
	 * set a processor of the type
	 * 
	 * @memberof $widget
	 */
	this.setProcessor = function(type, processor) {
		processors[type] = processor;
	};

	this.removeProcessor = function(type) {
		processors[type] = undefined;
	};

	/**
	 * gets processor of the type
	 * 
	 * @memberof $widget
	 */
	this.getProcessor = function(type) {
		return processors[type];
	};

	/**
	 * gets list of processors
	 * 
	 * @memberof $widget
	 */
	this.getProcessors = function() {
		return processors;
	};


	/**
	 * Apply processor on the given widget
	 * 
	 * @memberof $widget
	 */
	this.applyProcessors = function(widget, event) {
		event = event || {};
		angular.forEach(processors, function(processor) {
			try {
				processor.process(widget, event);
			} catch (ex) {
				log.error({
					message: 'Fail to run the processor',
					exception: ex
				});
			}
		});
	};


	/***********************************************
	 * Convertors
	 ***********************************************/
	this.addConverter = function(converter) {
		converters.push(converter);
	};

	this.getConverters = function() {
		return converters;
	};

	this.getConverter = function(mimetype) {
		for (var i = 0; i < converters.length; i++) {
			if (converters[i].getMimetype() === mimetype) {
				return converters[i];
			}
		}
	};

	this.widgetFromPoint = function(x, y) {
		return this.widgetFromElement(document.elementFromPoint(x, y));
	};

	this.widgetFromElement = function(element) {
		if (!element) {
			return;
		}
		do {
			if (element.$$wbController) {
				return element.$$wbController;
			}
			element = element.parentNode;
		} while  (element);
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



//submit the controller
angular.module('am-wb-core')//
/**
 * @ngdoc Widgets
 * @name WbWidgetAbstract
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
.factory('WbWidgetAbstract', function($widget, $window, $objectPath, $log){

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

    function WbWidgetAbstract ($element, $parent){
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
        this.runtimeModel =  {
                style:{},
                on: {},
        };
        this.model = {};
        // event listeners
        var ctrl = this;
        /*
         * TODO: maso, 2019: move to event manager.
         */
        this.eventListeners = {
                scroll: function($event){
                    ctrl.fire('scroll', $event);
                },
                click: function ($event) {
                    ctrl.fire('click', $event);
                },
                dblclick: function ($event) {
                    ctrl.fire('dblclick', $event);
                },
                mouseout: function ($event) {
                    ctrl.fire('mouseout', $event);
                },
                mouseover: function ($event) {
                    ctrl.fire('mouseover', $event);
                },
                mousedown: function ($event) {
                    ctrl.fire('mousedown', $event);
                },
                mouseup: function ($event) {
                    ctrl.fire('mouseup', $event);
                },
                mouseenter: function ($event) {
                    ctrl.fire('mouseenter', $event);
                },
                mouseleave: function ($event) {
                    ctrl.fire('mouseleave', $event);
                },

                // Media events
                error: function ($event) {
                    ctrl.fire('error', $event);
                },
                success: function ($event) {
                    ctrl.fire('success', $event);
                },
                load: function ($event) {
                    ctrl.fire('load', $event);
                },

                // DND
                dragstart: function ($event) {
                    ctrl.fire('dragstart', $event);
                },
                dragend: function ($event) {
                    ctrl.fire('dragend', $event);
                },
                dragenter: function ($event) {
                    ctrl.fire('dragenter', $event);
                },
                dragover: function ($event) {
                    ctrl.fire('dragover', $event);
                },
                dragleave: function ($event) {
                    ctrl.fire('dragleave', $event);
                },
                drop: function ($event) {
                    ctrl.fire('drop', $event);
                },
                
                change: function ($event) {
                    ctrl.fire('change', $event);
                },
                input: function ($event) {
                    ctrl.fire('input', $event);
                },
                
                /*
                 * Keyboard events
                 */
                keyup: function ($event) {
                    ctrl.fire('keyup', $event);
                },
                keydown: function ($event) {
                    ctrl.fire('keydown', $event);
                },
                keypress: function ($event) {
                    ctrl.fire('keypress', $event);
                },

        };

        /*
         * Add resize observer to the element
         */
        this.resizeObserver = new ResizeObserver(debounce(function ($event) {
            if(angular.isArray($event)){
                $event = $event[0];
            }
            ctrl.fire('resize', $event);
        }, 300));

        var options = {
                root: null,
                rootMargin: '0px',
                threshold: [0.0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
        };

        this.intersectionObserver = new IntersectionObserver(function ($event) {
            if(_.isArray($event)){
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
    WbWidgetAbstract.prototype.getModel = function () {
        return this.model;
    };

    /**
     * Sets model of the widget
     * 
     * @see #getModel()
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setModel = function (model) {
        if (model === this.model) {
            return;
        }
        this.setState('init');
        this.model = model;
        this.runtimeModel =  {
                style:{},
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
    WbWidgetAbstract.prototype.hasModelProperty = function(key){
        return $objectPath.has(this.getModel(), key);
    };

    /**
     * Get model property
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getModelProperty = function(key){
        return $objectPath.get(this.getModel(), key);
    };

    /**
     * Sets new model property value
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setModelProperty = function (key, value){
        // create the event
        var $event = {
                source: this,
                key: key,
                keys: [key],
                oldValue: this.getModelProperty(key),
                value: value
        };

        // check if value changed
        if(angular.equals($event.oldValue, $event.value)){
            return;
        }

        // Set the address
        if(value){
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
    WbWidgetAbstract.prototype.getRuntimeModel = function () {
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
    WbWidgetAbstract.prototype.hasProperty = function (key){
        return $objectPath.has(this.getRuntimeModel(), key);
    };

    /**
     * Gets property of the model
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getProperty = function (key){
        return $objectPath.get(this.getRuntimeModel(), key);
    };

    /**
     * Remove property
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.removeProperty = function (key){
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
    WbWidgetAbstract.prototype.setProperty = function (key, value){
        /*
         * Support old widget scripts
         */
        switch(key){
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
        if(angular.equals($event.oldValue, $event.value)){
            return;
        }

        // Set the address
        var model = this.getRuntimeModel();
        if(angular.isDefined(value)){
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
    WbWidgetAbstract.prototype.style = function (style, value) {
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
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setStyle = function(key, value) {
        this.setProperty('style.' + key, value);
    };

    /**
     * Get style from widget
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getStyle = function(key) {
        return this.getProperty('style.' + key);
    };


    /**
     * Delete the widget
     * 
     * This function just used in edit mode
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.delete = function () {
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
    WbWidgetAbstract.prototype.destroy = function ($event) {
        // remove scope
        this.fire('destroy', $event);

        // remove callbacks
        this.callbacks = [];
        this.actions = [];
        this.model = null;

        // destroy children
        angular.forEach(this.childWidgets, function (widget) {
            widget.destroy();
        });
        this.childWidgets = [];

        // destroy view
        if(!this.isRoot()){
            var $element = this.getElement();
            $element.remove();
        }
    };

    /**
     * Disconnect view with the widget
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.disconnect = function () {
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

    /**
     * Connects view with widget
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.connect = function () {
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

    /**
     * Get elements of the widget
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getElement = function () {
        return this.$element;
    };

    /**
     * Sets element attributes
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setElementAttribute = function(key, value){
        var $element = this.$element;
        if(value){
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
    WbWidgetAbstract.prototype.getElementAttribute = function(key){
        return this.$element.attr(key);
    };

    /**
     * Remove element attribute
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.removeElementAttribute = function(key){
        this.$element.removeAttr(key);
    };

    /**
     * Set widget silent
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setSilent = function(silent) {
        this.silent = silent;
    };

    /**
     * Checks if the element is silent
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.isSilent = function() {
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
    WbWidgetAbstract.prototype.on = function (type, callback) {
        if (!angular.isFunction(callback)) {
            throw {
                message: 'Callback must be a function'
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
    WbWidgetAbstract.prototype.off = function (type, callback) {
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
    WbWidgetAbstract.prototype.fire = function (type, params) {
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
        for(var i = 0; i < callbacks.length; i++){
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
    WbWidgetAbstract.prototype.getDirection = function () {
        return this.getModelProperty('style.flexDirection') || 'column';
    };

    /**
     * Get events of the widget
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getEvent = function () {
        return this.getModelProperty('on') || {};
    };

    /**
     * Get title of the widget
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getTitle = function () {
        return this.getModelProperty('label');
    };

    /**
     * Gets type
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getType = function () {
        return this.getModelProperty('type');
    };

    /**
     * Gets Id of the model
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getId = function () {
        return this.getModelProperty('id');
    };

    /**
     * Gets name of the widget
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getName = function () {
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
    WbWidgetAbstract.prototype.getParent = function () {
        return this.$parent;
    };

    /**
     * Sets the state of the widget
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setState = function (state) {
        if(state === this.state){
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
    WbWidgetAbstract.prototype.isEditable = function () {
        return this.editable;
    };

    /**
     * Set edit mode
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setEditable = function (editable) {
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
        angular.forEach(this.childWidgets, function (widget) {
            widget.setEditable(editable);
        });
    };

    /**
     * Check if intersecting
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.isIntersecting = function(){
        return this.intersecting;
    };

    /**
     * Set intersecting true
     * 
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.setIntersecting = function(intersecting, $event){
        if(_.isUndefined(this.intersecting)){
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
    WbWidgetAbstract.prototype.clone = function () {
        var $parent = this.getParent();
        var index = $parent.indexOfChild(this);
        $parent.addChild(index, angular.copy(this.getModel()));
    };

    /**
     * This method moves widget one to next.
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.moveNext = function () {
        var $parent = this.getParent();
        $parent.moveChild(this, $parent.indexOfChild(this) + 1);
    };

    /**
     * This method moves widget one to before
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.moveBefore = function () {
        var $parent = this.getParent();
        $parent.moveChild(this, $parent.indexOfChild(this) - 1);
    };

    /**
     * This method moves widget to the first of it's parent
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.moveFirst = function () {
        var $parent = this.getParent();
        $parent.moveChild(this, 0);
    };

    /**
     * This method moves widget to the last of it's parent
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.moveLast = function () {
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
    WbWidgetAbstract.prototype.isRoot = function () {
        var $parent = this.getParent();
        return angular.isUndefined($parent) || $parent === null;
    };

    /**
     * Gets root widgets of the widget
     * 
     * @return the root widget
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getRoot = function () {
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
    WbWidgetAbstract.prototype.isSelected = function () {
        return this.selected;
    };

    WbWidgetAbstract.prototype.setSelected = function (flag) {
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
    WbWidgetAbstract.prototype.addAction = function (action) {
        this.actions.push(action);
    };

    /**
     * Gets widget actions
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getActions = function () {
        return this.actions;
    };

    /**
     * Returns bounding client rectangle to parent
     * 
     * @return bounding rectangle
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getBoundingClientRect = function () {
        var element = this.getElement();
        if(!element){
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
    WbWidgetAbstract.prototype.animate = function (options) {
        var animation = {
                targets: this.getRuntimeModel(),
        };

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
        var ctrl = this;
        var keys = [];
        for(var key in options){
            // ignore keys
            if(_.includes(['duration','loop','autoplay','delay','easing'], key)){
                continue;
            }
            keys.push(key);
            animation[key] = options[key];
            // set initial value
            var val = this.getProperty(key);
            if(!val) {
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
    WbWidgetAbstract.prototype.removeAnimation = function () {
        // The animation will not add to element so there is no need to remove
    };

    /**
     * Sets window of the widget
     * 
     * @memberof WbAbstractWidget
     * @params window {WbWindow} of the current widget
     */
    WbWidgetAbstract.prototype.setWindow = function (window) {
        this.window = window;
    };

    /**
     * Gets window of the widget
     * 
     * @memberof WbAbstractWidget
     * @return window of the current widget or from the root
     */
    WbWidgetAbstract.prototype.getWindow = function () {
        return this.window || this.getRoot().getWindow() || $window;
    };


    /**
     * Adds attributes into the element attributes
     * 
     * $widget.addElementAttributes('a', 'b');
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.addElementAttributes = function(){
        this.elementAttributes = _.union(this.elementAttributes, arguments);
    };

    /**
     * Gets element attributes
     * 
     * @memberof WbAbstractWidget
     */
    WbWidgetAbstract.prototype.getElementAttributes = function(){
        return this.elementAttributes;
    };

    WbWidgetAbstract.prototype.isLeaf = function(){
        return true;
    };

    return WbWidgetAbstract;

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
//submit the controller
angular.module('am-wb-core')//
/**
 * @ngdoc Widget
 * @name WbWidgetGroup
 * @description Manages a group widgets
 * 
 * This is a group controller
 * 
 */
.factory('WbWidgetGroup', function( $wbUtil, $widget, $q, WbWidgetAbstract){

    /**
     * Creates new instance of the group
     * 
     * @memberof WbWidgetGroupCtrl
     * @ngInject
     */
    function WbWidgetGroupCtrl($element, $parent){
        // call super constractor
        WbWidgetAbstract.apply(this, [$element, $parent]);

        // init group
    }

    // extend functionality
    WbWidgetGroupCtrl.prototype = Object.create(WbWidgetAbstract.prototype);


    /**
     * Set model to a group
     * 
     * Setting model to a group is differs from setting in widget. In group 
     * we try to load children and finally loading the group itself.
     * 
     * @memberof WbWidgetGroupCtrl
     * @param model Object to set into the group
     */
    WbWidgetGroupCtrl.prototype.setModel = function (model) {
        if (model === this.model) {
            return;
        }
        this.setState('init');
        this.model = model;
        this.fire('modelChanged');

        var ctrl = this;
        return this.loadWidgets()
        .then(function(){
            return ctrl;
        });
    };

    /**
     * Delete the widget
     * 
     * This function just used in edit mode
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.delete = function () {
        this.removeChildren();
        this.fire('delete');
        if (!this.isRoot()) {
            this.getParent()
            .removeChild(this);
        }
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

    /**
     * Removes a widget
     * 
     * Data model and visual element related to the input model will be removed.
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.removeChild = function (widget) {
        var index = this.indexOfChild(widget);

        if (index > -1) {
            // remove model
            this.childWidgets.splice(index, 1);

            var model = this.getModel();
            index = model.children.indexOf(widget.getModel());
            model.children.splice(index, 1);

            // destroy widget
            widget.destroy();
            return true;
        }
        return false;
    };

    /**
     * Removes all children of the group.
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.removeChildren = function(){
        // remove all children
        var widgets = _.clone(this.getChildren());
        _.forEach(widgets, function (w) {
            w.delete();
        });
    };


    WbWidgetGroupCtrl.prototype.loadWidgets = function () {
        // destroy all children
        angular.forEach(this.childWidgets, function (widget) {
            widget.destroy();
        });
        this.childWidgets = [];
        var ctrl = this;
        var loadState = function () {
            ctrl.fire('loaded');
            ctrl.setState('ready');
        };

        // check for new child
        if (!this.model || !angular.isArray(this.model.children)) {
            return $q.resolve()
            .finally(loadState);
        }

        // create child
        var parentWidget = this;

        var compilesJob = [];
        this.model.children.forEach(function (item, index) {
            var job = $widget.compile(item, parentWidget)//
            .then(function (widget) {
                parentWidget.childWidgets[index] = widget;
            });
            compilesJob.push(job);
        });

        return $q.all(compilesJob)//
        .then(function () {
            var $element = parentWidget.getElement();
            $element.empty();
            parentWidget.childWidgets.forEach(function (widget) {
                widget.setEditable(ctrl.isEditable());
                $element.append(widget.getElement());
            });
        })
        .finally(loadState);
    };


    /**
     * Adds child model
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.addChildModel = function (index, item) {
        var model = this.getModel();
        var ctrl = this;
        index = this.__cleanInsertIndex(index);
        // add widget
        item = $wbUtil.clean(item);
        return $widget.compile(item, this)//
        .then(function (newWidget) {
            if (index < ctrl.childWidgets.length) {
                newWidget.getElement().insertBefore(ctrl.childWidgets[index].getElement());
            } else {
                ctrl.getElement().append(newWidget.getElement());
            }
            if(!angular.isArray(model.children)){
                model.children = [];
            }
            model.children.splice(index, 0, item);
            ctrl.childWidgets.splice(index, 0, newWidget);

            // init the widget
            newWidget.setEditable(ctrl.isEditable());
            ctrl.fire('newchild', {
                widgets: [newWidget]
            });
            return newWidget;
        });
    };

    /**
     * Adds children at specified index
     * 
     * Change data model and the view.
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.addChildrenModel = function (index, children) {
        var model = this.getModel();
        var ctrl = this;
        index = this.__cleanInsertIndex(index);

        // compile all
        return this.__compileChildren(children)
        .then(function (widgets) {
            for(var i = 0; i < widgets.length; i++){
                var newWidget = widgets[i];
                
                var j = i + index;
                
                if (j < ctrl.childWidgets.length) {
                    newWidget.getElement().insertBefore(ctrl.childWidgets[j].getElement());
                } else {
                    ctrl.getElement().append(newWidget.getElement());
                }
                if(!angular.isArray(model.children)){
                    model.children = [];
                }
                model.children.splice(j, 0, newWidget.getModel());
                ctrl.childWidgets.splice(j, 0, newWidget);

                // init the widget
                newWidget.setEditable(ctrl.isEditable());
            }
            ctrl.fire('newchild', {
                widgets: widgets
            });
        });
    };
    
    /**
     * Adds a child model to the group
     * 
     * @deprecated
     */
    WbWidgetGroupCtrl.prototype.addChild = WbWidgetGroupCtrl.prototype.addChildModel;
    
    /**
     * Adds a children model to the group
     * 
     * @deprecated
     */
    WbWidgetGroupCtrl.prototype.addChildren = WbWidgetGroupCtrl.prototype.addChildrenModel;

    /*
     * Internal:
     * 
     * convert children model into a list of widgets.
     */
    WbWidgetGroupCtrl.prototype.__compileChildren = function(children){
        var jobs = [];
        var widgets = [];
        var ctrl = this;
        angular.forEach(children, function(item, i){
            item = $wbUtil.clean(item);
            jobs.push($widget.compile(item, ctrl)//
                    .then(function(widget){
                        widgets[i] = widget;
                    }));
        });

        // add widget
        return $q.all(jobs)//
        .then(function(){
            return widgets;
        });
    };

    WbWidgetGroupCtrl.prototype.__cleanInsertIndex = function(index){
        if(!angular.isDefined(index) || index > this.childWidgets.length){
            return this.childWidgets.length;
        }
        if(index < 0){
            return 0;
        }
        return index;
    };
    
    /**
     * Finds index of child element
     * 
     * @memberof WbWidgetGroupCtrl
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
        if (this.getModel().children.indexOf(widget.getModel()) === index) {
            return;
        }
        var positionWidget = this.getChildren()[index];
        // move element
        if (this.getModel().children.indexOf(widget.getModel()) < index) {
            positionWidget.getElement().after(widget.getElement());
        } else {
            positionWidget.getElement().before(widget.getElement());
        }

        // move model
        arraymove(this.getModel().children, this.getModel().children.indexOf(widget.getModel()), index);

        // move controller
        arraymove(this.getChildren(), this.indexOfChild(widget), index);
    };

    /**
     * Finds index of child element
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.indexOfChild = function (widget) {
        if (!this.childWidgets || !this.childWidgets.length) {
            return -1;
        }
        return this.childWidgets.indexOf(widget);
    };

    /**
     * List of allowed child
     * 
     * @memeberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.getAllowedTypes = function () {
        return this.allowedTypes;
    };

    /**
     * set acceptable widgets
     * 
     * $widget.setAcceptableChild('a', 'b');
     * 
     * @memberof WbWidgetGroupCtrl
     */
    WbWidgetGroupCtrl.prototype.setAllowedTypes = function () {
        this.allowedTypes = arguments;
    };
    

    WbWidgetGroupCtrl.prototype.isLeaf = function(){
        return false;
    };
    
    WbWidgetGroupCtrl.prototype.isHorizontal = function(){
        var direction = this.getModelProperty('style.flexDirection') || this.getProperty('style.flexDirection');
        return direction === 'row';
    };

    return WbWidgetGroupCtrl;
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
angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name WbWidgetAbstractHtml
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
.factory('WbWidgetAbstractHtml', function (WbWidgetAbstract) {

    /**
     * Creates new instance 
     * 
     * @memberof WbWidgetGroupCtrl
     */
    function Widget($element, $parent){

        // call super constractor
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes('html');
        var ctrl = this;

        /*
         * set element attribute
         */
        function eventHandler(event){
            if(event.key === 'html'){
                var value = ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key);
                ctrl.getElement().html(value);
            }
        }

        // listen on change
        this.on('modelUpdated', eventHandler);
        this.on('runtimeModelUpdated', eventHandler);
    }

    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);

    /**
     * Gets value of the input
     * 
     * @memberof WbWidgetAbstractHtml
     */
    Widget.prototype.html = function(){
        var value = arguments[0];
        if(value){
            this.setElementAttribute('html', value);
        }
        var element = this.getElement();
        return element.html.apply(element, arguments);
    };

    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name a
 * @description Manage a link to other documents
 * 
 */
.factory('WbWidgetA', function (WbWidgetAbstractHtml) {

    /**
     * Creates new instance of the group
     * 
     * @memberof WbWidgetGroupCtrl
     * @ngInject
     */
    function Widget($element, $parent){
        // call super constractor
        WbWidgetAbstractHtml.apply(this, [$element, $parent]);
        this.addElementAttributes('download', 'href',
                'hreflang', 'media', 'ping', 'referrerpolicy',
                'rel', 'target', 'aType');

        // chack edit mode
        function removeDefaultAction($event){
            $event.preventDefault();
        }
        var ctrl = this;
        this.on('stateChanged', function(event){
            if(event.value === 'edit'){
                ctrl.getElement().on('click dblclick', removeDefaultAction);
            } else {
                ctrl.getElement().off('click dblclick', removeDefaultAction);
            }
        });

        // init input
        function eventHandler(event){
            if(event.key === 'aType'){
                ctrl.setElementAttribute('type', event.value);
            }
        }
        // listen on change
        this.on('modelUpdated', eventHandler);
        this.on('runtimeModelUpdated', eventHandler);
    }

    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name address
 * @description Manage a widget
 */
.factory('WbWidgetAddress', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name applet
 * @description Manage a widget
 */
.factory('WbWidgetApplet', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name area
 * @description Manage a widget
 */
.factory('WbWidgetArea', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name article
 * @description Manage a widget
 */
.factory('WbWidgetArticle', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name aside
 * @description Manage a widget
 */
.factory('WbWidgetAside', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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
angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name audio
 * @description Manage a widget with audio.
 * 
 * 
 */
.factory('WbWidgetAudio', function (WbWidgetGroup) {
    /**
     * Creates new instance of the widget
     * 
     * @memberof audio
     */
    function Widget($element, $parent){
        WbWidgetGroup.apply(this, [$element, $parent]);
        this.addElementAttributes('autoplay', 'controls',
                'loop', 'muted', 'preload', 'src');
        this.setAllowedTypes('source');
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name blockquote
 * @description Manage a widget
 */
.factory('WbWidgetBlockquote', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name button
 * @description Manage a widget
 */
.factory('WbWidgetButton', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name canvas
 * @description Manage a widget
 */
.factory('WbWidgetCanvas', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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
 * @ngdoc Widgets
 * @name collection
 * @description Collection controller
 * 
 * A widget collection controller
 * 
 */
.factory('AmWbSeenCollectionWidget', function (
		/* am-wb-core */ WbWidgetGroup, $wbUtil, 
		/* angularjs  */ $q, $http, $log) {



	function QueryParameter() {
		// init
		this.param = {};
		this.filterMap = {};
		this.sortMap = {};
	}
	
	QueryParameter.prototype._init_filters = function(){
		var obj = this.filterMap;
		var keys = Object.keys(obj);
		this.param['_px_fk[]'] = [];
		this.param['_px_fv[]'] = [];
		for(var i = 0; i < keys.length; i++){
			var key = keys[i];
			var values = obj[key];
			for(var j = 0; j < values.length; j++){
				var value = values[j];
				this.param['_px_fk[]'].push(key);
				this.param['_px_fv[]'].push(value);	
			}
		}
	};
	
	QueryParameter.prototype._init_sorts = function(){
		var obj = this.sortMap;
		this.param['_px_sk[]'] = Object.keys(obj);
		// this.param['_px_so[]'] = Object.values(obj);
		this.param['_px_so[]'] = [];
		for(var index=0; index<this.param['_px_sk[]'].length; index++){
			var key = this.param['_px_sk[]'][index];
			this.param['_px_so[]'][index] = obj[key];
		}
	};

	QueryParameter.prototype.setSize = function(size) {
		this.param._px_ps = size;
		return this;
	};

	QueryParameter.prototype.setQuery  =function(query) {
		this.param._px_q = query;
		return this;
	};

	QueryParameter.prototype.setPage = function($page) {
		this.param._px_p = $page;
		return this;
	};

	QueryParameter.prototype.nextPage = function() {
		if(!this.param._px_p){
			this.param._px_p = 1;
		}
		this.param._px_p += 1;
		return this;
	};

	QueryParameter.prototype.setOrder = function($key, $order) {
		if(!$order){				
			this.removeSorter($key, $order);
		}else{				
			this.addSorter($key, $order);
		}
		this._init_sorts();
		return this;
	};

	QueryParameter.prototype.addSorter = function($key, $order){
		if(!$order){
			return this;
		}
		this.sortMap[$key] = $order;
		this._init_sorts();
		return this;
	};

	QueryParameter.prototype.removeSorter = function($key){
		delete this.sortMap[$key];
		this._init_sorts();
		return this;
	};

	QueryParameter.prototype.clearSorters = function(){
		this.sortMap = {};
	};

	QueryParameter.prototype.setFilter = function($key, $value) {
		if(!angular.isDefined($value)){				
			this.removeFilter($key, $value);
		}else{
			this.filterMap[$key] = [];
			this.addFilter($key, $value);
		}
		this._init_filters();
		return this;
	};

	QueryParameter.prototype.addFilter = function($key, $value){
		if(!angular.isDefined($value)){				
			return this;
		}
		if(!angular.isArray(this.filterMap[$key])){
			this.filterMap[$key] = [];
		}
		this.filterMap[$key].push($value);
		this._init_filters();
		return this;
	};

	QueryParameter.prototype.removeFilter = function($key){
		delete this.filterMap[$key];
		this._init_filters();
		return this;
	};

	QueryParameter.prototype.clearFilters = function(){
		this.filterMap = {};
	};

	QueryParameter.prototype.getParameter = function() {
		return this.param;
	};

	QueryParameter.prototype.put = function(key, value) {
		this.param[key] = value;
		return this;
	};

	QueryParameter.prototype.get = function(key) {
		return this.param[key];
	};


	// ------------------------------------------------------------------
	// Utility
	// ------------------------------------------------------------------
	/*
	 * process state
	 */
	var STATE_BUSY = 'busy';
	var STATE_IDEAL = 'ideal';
	var collectionAttributes = ['url', 'filters', 'sorts', 'query', 'properties', 'template'];

	// ------------------------------------------------------------------
	// Utility
	// ------------------------------------------------------------------

	/*
	 * Creates widgets based on a mix of the template and input data
	 * 
	 * #utility
	 */
	function createWidgets(items, template) {
		var widgetList = [];
		var templateCopy = '';
		var html;
		if (!angular.isArray(items)) {
			return $q.resolve([]); // Empty items?
		}
		for (var i = 0; i < items.length; i++) {
			templateCopy = template;
			try {
				html = Mustache.to_html(templateCopy, items[i]);
				html = JSON.parse(html);
				html = $wbUtil.clean(html);
				widgetList.push(html);
			} catch (e) {
				$log.error({
					message: 'Falie to load template',
					error: e
				});
				continue;
			}
		}
		return $q.resolve(widgetList);
	}

	// ------------------------------------------------------------------
	// Widget internal
	//
	// ------------------------------------------------------------------
	/*
	 * TODO: maso, 2018: manage events 
	 * 
	 * - collection changes: any part of the query is changed 
	 * - style changes: internal group style changed 
	 * - model changes: the whole model changed
	 */

	function Widget($scope, $element, $parent){
		WbWidgetGroup.apply(this, [$scope, $element, $parent]);
		this.setAllowedTypes();
		this.addElementAttributes('url', 'filters', 'sorts', 'query', 'properties', 'template');

		this._lastResponse;
		this._state = STATE_IDEAL;
		var ctrl = this;

		// watch model update
		function doTask ($event) {
			// collection updated
			if (_.includes(collectionAttributes, $event.key)) {
				ctrl.reloadPage();
			}
		}

		ctrl.on('modelUpdated', doTask);
		ctrl.on('runtimeModelUpdated', doTask);
		this.on('loaded', function(){
			ctrl.reloadPage();
		});
	}
	
	Widget.prototype = Object.create(WbWidgetGroup.prototype);

	/**
	 * Gets collection from server, creates widgets, and forms the body of widget
	 * 
	 * @memberof AmWbSeenCollection
	 */
	Widget.prototype.reloadPage = function () {
		var ctrl = this;
		if(this._reloading){
			return this._reloading.finally(function(){
				return ctrl.reloadPage();
			});
		}
		this.removeChildren();
		this.getElement().empty();
		delete this._lastResponse;
		this._reloading = this.loadNextPage(true)
		.finally(function(){
			delete ctrl._reloading;
		});
	};


	/**
	 * Load next page 
	 * 
	 * @memberof AmWbSeenCollection
	 * @param replace {boolean} current items or not
	 * @returns {number} the number of items in each page
	 */
	Widget.prototype.loadNextPage = function () {
		if (!this.hasMorePage()) {
			return $q.reject({
				message: 'No more page!?'
			});
		}
		var template = this.getTemplate();

		var ctrl = this;
		return this.getCollection()//
		.then(function (res) {
			ctrl._lastResponse = res.data;
			return ctrl.fire('success', res) || res.data;
		}, function (error) {
			return ctrl.fire('error', error) || error;
		})
		.then(function (data) {
			return createWidgets(data.items || [], template);
		})//
		.then(function (children) {
			return ctrl.addChildren(ctrl.getChildren().length, children)
			.then(function(){
				return ctrl.fire('load', {
					children: children
				}) || children;
			});
		});
	};

	Widget.prototype.getTemplate = function(){
		return this.getProperty('template') || this.getModelProperty('template') || {
			type: 'HtmlText',
			text: '<h3>Template is not set</h3>'
		};
	};

	/*
	 * Gets collection based on internal configurations.
	 * 
	 * This is an internal function
	 */
	Widget.prototype.getCollection = function () {
		// check state
		if (this._state !== STATE_IDEAL) {
			return this.lastQuery;
		}

		var q = new QueryParameter();

		//TODO: maso, 2019: merge runtime and origin model into a new model
		// like the way used in 'loadStyle' function in 'widgets-ctrl' in am-wb-core module

		// filters
		var filters = this.getProperty('filters') || this.getModelProperty('filters') || [];
		angular.forEach(filters, function (filter) {
			q.addFilter(filter.key, filter.value);
		});

		// sort
		var sorts = this.getProperty('sorts') || this.getModelProperty('sorts') || [];
		angular.forEach(sorts, function (sort) {
			q.addSorter(sort.key, sort.order);
		});

		q.setQuery(this.getProperty('query') || this.getModelProperty('query'));
		q.put('graphql', this.getProperty('properties') || this.getModelProperty('properties'));
		var url = this.getProperty('url') || this.getModelProperty('url');
		if (url) {
			var pageIndex = this.getNextPageIndex();
			if(pageIndex > 1){
				q.setPage(pageIndex);
			}
			this._state = STATE_BUSY;
			var ctrl = this;
			this._lastQuery = $http({
				method: 'GET',
				url: url,
				params: q.getParameter()
			})
			.finally(function () {
				ctrl._state = STATE_IDEAL;
				delete ctrl.lastQuery;
			});
		} else {
			this._lastQuery = $q.reject({
				message: 'URL is not set',
				code: 1 // url is not set
			});
		}
		return this._lastQuery;
	};



	// ------------------------------------------------------------------
	// Widget global
	// ------------------------------------------------------------------

	/**
	 * Gets counts of all pages
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {number} the number of pages 
	 */
	Widget.prototype.getPagesCount = function () {
		if (!this._lastResponse) {
			return 0;
		}
		return this._lastResponse.page_number;
	};

	/**
	 * Gets current page number
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {number} the current page
	 */
	Widget.prototype.getCurrentPage = function () {
		if (!this._lastResponse) {
			return 0;
		}
		return this._lastResponse.current_page;
	};

	/**
	 * The number of items per each page
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {number} the number of items in each page
	 */
	Widget.prototype.getItemPerPage = function () {
		if (!this._lastResponse) {
			return 0;
		}
		return this._lastResponse.items_per_page;
	};

	/**
	 * Check if there is more page
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {boolean} true if there is more page
	 */
	Widget.prototype.hasMorePage = function () {
		if (!this._lastResponse) {
			return true;
		}
		return this._lastResponse.current_page < this._lastResponse.page_number;
	};

	/**
	 * Gets next page index
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {number} next page index
	 */
	Widget.prototype.getNextPageIndex = function () {
		if (!this._lastResponse) {
			return 1;
		}
		return this._lastResponse.current_page + 1;
	};

	/**
	 * The current state of the controller
	 * 
	 * @memberof AmWbSeenCollection
	 * @returns {string} current state of the controller
	 */
	Widget.prototype.getState = function () {
		return this._state || STATE_IDEAL;
	};


	/**
	 * set acceptable widgets
	 * 
	 * $widget.setAcceptableChild('a', 'b');
	 * 
	 * @memberof WbWidgetGroupCtrl
	 */
	Widget.prototype.setAllowedTypes = function () {
		this.allowedTypes = [];
	};

	/**
	 * Set edit mode
	 * 
	 * 
	 * @memberof WbAbstractWidget
	 */
	Widget.prototype.setEditable = function (editable) {
		WbWidgetGroup.prototype.setEditable.apply(this, arguments);
		// propagate to child
		var children = this.getChildren();
		while(!_.isEmpty(children)){
			var widget = children.pop();
			widget.setSilent(editable);
			if(!widget.isLeaf()){
				children = children.concat(widget.getChildren());
			}
		}
	};


	Widget.prototype.isLeaf = function(){
		return true;
	};

	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name datalist
 * @description Manage a widget
 */
.factory('WbWidgetDatalist', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name dd
 * @description Manage a widget
 */
.factory('WbWidgetDd', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name details
 * @description Manage a widget
 */
.factory('WbWidgetDetails', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name dialog
 * @description Manage a widget
 */
.factory('WbWidgetDialog', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name div
 * @description Manage a widget
 */
.factory('WbWidgetDiv', function (WbWidgetGroup) {
    function Widget($element, $parent){
        WbWidgetGroup.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name dl
 * @description Manage a widget
 */
.factory('WbWidgetDl', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name dt
 * @description Manage a widget
 */
.factory('WbWidgetDt', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name embed
 * @description Manage a widget
 */
.factory('WbWidgetEmbed', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name fieldset
 * @description Manage a widget
 */
.factory('WbWidgetFieldset', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name figcaption
 * @description Manage a widget
 */
.factory('WbWidgetFigcaption', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name figure
 * @description Manage a widget
 */
.factory('WbWidgetFigure', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name footer
 * @description Manage a widget
 */
.factory('WbWidgetFooter', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name form
 * @description Manage a widget
 */
.factory('WbWidgetForm', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes('acceptCharset', 'action', 'autocomplete', 'off',
				'enctype', 'method', 'name', 'novalidate', 'target');
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name frame
 * @description Manage a widget
 */
.factory('WbWidgetFrame', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name frameset
 * @description Manage a widget
 */
.factory('WbWidgetFrameset', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name h 
 * @description Manage header (h1..h6)
 */
.factory('WbWidgetH', function (WbWidgetAbstractHtml) {
    function Widget($element, $parent){
        WbWidgetAbstractHtml.apply(this, [$element, $parent]);
        this.addElementAttributes('align');
    }
    Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name header
 * @description Manage a widget
 */
.factory('WbWidgetHeader', function (WbWidgetGroup) {
    function Widget($element, $parent){
        WbWidgetGroup.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name hr
 * @description Manage a widget
 */
.factory('WbWidgetHr', function (WbWidgetAbstract) {
	function Widget($element, $parent){
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name i
 * @description Manage a widget
 */
.factory('WbWidgetI', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name iframe
 * @description Manage an iframe
 * 
 * Iframe is a widget to incloud other pages as a part of current page. This widget is
 * used as Iframe manager.
 * 
 */
.factory('WbWidgetIframe', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes('name', 'src', 'srcdoc', 'sandbox');
	}
	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')
/**
 * @ngdoc Widget
 * @name img
 * @description Manage an image
 */
.factory('WbWidgetImg', function (WbWidgetAbstract) {
    function Widget($element, $parent) {
        WbWidgetAbstract.apply(this, [$element, $parent ]);
        this.addElementAttributes('alt', 'crossorigin',
                'height', 'hspace', 'ismap', 'longdesc',
                'sizes', 'src', 'usemap', 'width');
    }
    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name import
 * @description Manage a widget
 */
.factory('WbWidgetSeenImport', function (WbWidgetGroup, $wbUtil, $q) {
    'use strict';

    /*
     * Load data from the widget URL
     */
    function loadLinks(paths) {

        var jobs = [];
        var models = Array(paths.length);
        _.forEach(paths, function(path, index){
            // check parts
            var parts = path.split('#');
            var url = parts[0];
            var id = parts.length > 1 ? parts[1] : undefined;
            var job = $wbUtil.downloadWidgetModel(url, id)
            .then(function (model) {
                models[index] = model;
            });
            jobs.push(job);
        });

        function clean(){
            return _.remove(models, function(model) {
                return !_.isUndefined(model);
            });
        }
        // TODO: maso, 2019: some models are faild
        return $q.all(jobs)
        .then(clean,clean);
    }

    //-------------------------------------------------------------
    // Widget
    //-------------------------------------------------------------
    function Widget($scope, $element, $parent){
        WbWidgetGroup.apply(this, [$scope, $element, $parent]);
        this.setAllowedTypes();
        this.addElementAttributes('url');

        // load widget
        var ctrl = this;
        function checkAndUpdateUrl($event) {
            if ($event.key === 'url') {
                ctrl.reload();
            }
        }
        this.on('modelUpdated', checkAndUpdateUrl);
        this.on('runtimeModelUpdated', checkAndUpdateUrl);
        this.on('modelChanged', function () {
            ctrl.reload();
        });
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);

    Widget.prototype.reload = function (){
        // check if the url
        var ctrl = this;
        ctrl.removeChildren();
        ctrl.getModel().children = [];
        var path = this.getProperty('url') || this.getModelProperty('url') || '';
        path = path.trim();
        var prom;
        if(!path){
            prom = $q.resolve([]);
        } else {
            this.paths = path.split(',');
            prom = loadLinks(this.paths)//
            .then(function (children) {
                return ctrl.fire('success', {
                    children: children
                }) || children;
            });
        }

        return prom.then(function(children){
            return ctrl.addChildrenModel(0, children)
            .finally(function(){
                ctrl.fire('load', {
                    children: children
                }) || children;
            });
        });
    };

    /**
     * set acceptable widgets
     * 
     * $widget.setAcceptableChild('a', 'b');
     * 
     * @memberof WbWidgetGroupCtrl
     */
    Widget.prototype.setAllowedTypes = function () {
        this.allowedTypes = [];
    };


    /**
     * Set edit mode
     * 
     * 
     * @memberof WbAbstractWidget
     */
    Widget.prototype.setEditable = function (editable) {
        WbWidgetGroup.prototype.setEditable.apply(this, arguments);
        // propagate to child
        var children = this.getChildren();
        while(!_.isEmpty(children)){
            var widget = children.pop();
            widget.setSilent(editable);
            if(!widget.isLeaf()){
               children = children.concat(widget.getChildren());
            }
        }
    };
    

    Widget.prototype.isLeaf = function(){
        return true;
    };

    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widget
 * @name input
 * @description Manage an input field
 * 
 * The most used widget to get information from clients is an input. The input
 * are responsible to get most of data types (email, text, number, ex.) from
 * clients.
 * 
 */
.factory('WbWidgetInput', function (WbWidgetAbstract) {
	/**
	 * Creates new instance of the group
	 * 
	 * @memberof WbWidgetGroupCtrl
	 * @ngInject
	 */
	function Widget($element, $parent){
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('accept', 'alt',
				'autocomplete', 'autofocus', 'checked',
				'dirname', 'disabled', 
				'form', 'formaction', 'formenctype', 'formmethod', 'formnovalidate', 'formtarget',
				'height', 'list','max',
				'maxlength', 'min', 'multiple', 'name',
				'pattern', 'placeholder', 'readonly',
				'required', 'size', 'src', 'step', 'inputType',
				'value', 'width');
		// init input
		var ctrl = this;
		function eventHandler(event){
			if(event.key === 'inputType'){
				ctrl.setElementAttribute('type', event.value);
			}
		}
		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
	}

	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);


	/**
	 * Gets value of the input
	 * 
	 * @memberof input
	 */
	Widget.prototype.val = function(){
		var value = arguments[0];
		if(value){
			this.setElementAttribute('value', value);
		}
		var element = this.getElement();
		return element.val.apply(element, arguments);
	};

	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name kbd
 * @description Manage a widget
 */
.factory('WbWidgetKbd', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name label
 * @description Manage a widget
 */
.factory('WbWidgetLabel', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name legend
 * @description Manage a widget
 */
.factory('WbWidgetLegend', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name li
 * @description Manage a widget
 */
.factory('WbWidgetLi', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name link
 * @description Manage a widget link
 */
.factory('WbWidgetLink', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes('crossorigin', 'href',
                'hreflang', 'media', 'rel', 'size', 'type');
    }
    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name main
 * @description Manage a widget
 */
.factory('WbWidgetMain', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name map
 * @description Manage a widget
 */
.factory('WbWidgetMap', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name meta
 * @description Manage a meta data 
 * 
 * In seo (or equivalient usecase) 
 * 
 */
.factory('WbWidgetMeta', function (WbWidgetAbstract) {

	function Widget($element, $parent){
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('charset', 'content', 'httpEquiv', 'name');
	}
	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name meter
 * @description Manage a widget
 */
.factory('WbWidgetMeter', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name nav
 * @description Manage a widget
 */
.factory('WbWidgetNav', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name noscript
 * @description Manage a widget
 */
.factory('WbWidgetNoscript', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name object
 * @description Manage a widget
 */
.factory('WbWidgetObject', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name ol
 * @description Manage a widget
 */
.factory('WbWidgetOl', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name optgroup
 * @description Manage a widget
 */
.factory('WbWidgetOptgroup', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name option
 * @description Manage a widget
 */
.factory('WbWidgetOption', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name output
 * @description Manage a widget
 */
.factory('WbWidgetOutput', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name pre
 * @description Manage a widget with preformatted text.
 * 
 */
.factory('WbWidgetP', function (WbWidgetAbstractHtml) {
    function Widget($element, $parent){
        WbWidgetAbstractHtml.apply(this, [$element, $parent]);
    }
    Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name param
 * @description Manage a widget
 */
.factory('WbWidgetParam', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name picture
 * @description Add a picture widget
 * 
 */
 .factory('WbWidgetPicture', function (WbWidgetGroup) {
     function Widget($element, $parent){
         WbWidgetGroup.apply(this, [$element, $parent]);
        this.addElementAttributes('alt', 'crossorigin', 'height',
                'hspace', 'ismap', 'longdesc', 'sizes', 'src',
                'usemap', 'width');
         this.setAllowedTypes('source', 'img');
     }
     // extend functionality
     Widget.prototype = Object.create(WbWidgetGroup.prototype);
     return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name pre
 * @description Manage a widget with preformatted text.
 * 
 */
.factory('WbWidgetPre', function (WbWidgetAbstract) {

	/**
	 * Creates new instance 
	 * 
	 * @memberof pre
	 */
	function Widget($element, $parent){

		// call super constractor
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('text');
		var ctrl = this;

		/*
		 * set element attribute
		 */
		function eventHandler(event){
			if(event.key === 'text'){
				var value = ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key);
				ctrl.getElement().text(value);
			}
		}

		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
	}

	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);

	/**
	 * Gets value of the input
	 * 
	 * @memberof pre
	 */
	Widget.prototype.text = function(){
		var value = arguments[0];
		if(value){
			this.setElementAttribute('text', value);
		}
		var element = this.getElement();
		return element.text.apply(element, arguments);
	};

	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name progress
 * @description Manage a header
 * 
 */
.factory('WbWidgetProgress', function (WbWidgetAbstract) {
    function Widget($element, $parent) {
        WbWidgetAbstract.apply(this, [$element, $parent ]);
        this.addElementAttributes('value', 'max');
    }
    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name q
 * @description Manage a widget
 */
.factory('WbWidgetQ', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name s
 * @description Manage a widget
 */
.factory('WbWidgetS', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name WbWidgetSamp
 * @description Manage a widget
 */
.factory('WbWidgetSamp', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name script
 * @description Manage a widget
 */
.factory('WbWidgetScript', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name section
 * @description Manage a widget
 */
.factory('WbWidgetSection', function (WbWidgetGroup) {
    function Widget($element, $parent){
        WbWidgetGroup.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name select
 * @description Manage a widget
 */
.factory('WbWidgetSelect', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name small
 * @description Manage a widget
 */
.factory('WbWidgetSmall', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name source
 * @description Manage resource
 * 
 */
.factory('WbWidgetSource', function (WbWidgetAbstract) {

	/**
	 * Creates new instance of the group
	 * 
	 * @memberof WbWidgetSource
	 */
	function Widget($element, $parent){
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('src', 'srcset', 'media', 'sizes', 'sourceType');

		// init input
		var ctrl = this;
		function eventHandler(event){
			if(event.key === 'sourceType'){
				ctrl.setElementAttribute('type', event.value);
			}
		}
		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
	}

	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name span
 * @description Manage a widget
 */
.factory('WbWidgetSpan', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name strong
 * @description Manage a widget
 */
.factory('WbWidgetStrong', function (WbWidgetAbstractHtml) {
	function Widget($element, $parent){
		WbWidgetAbstractHtml.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetAbstractHtml.prototype);
	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name style
 * @description Manage a widget
 */
.factory('WbWidgetStyle', function (WbWidgetAbstract) {
    function Widget($element, $parent){

		// call super constractor
		WbWidgetAbstract.apply(this, [$element, $parent]);
		this.addElementAttributes('text');
		var ctrl = this;

		/*
		 * set element attribute
		 */
		function eventHandler(event){
			if(event.key === 'text'){
				var value = ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key);
				ctrl.getElement().text(value);
			}
		}

		// listen on change
		this.on('modelUpdated', eventHandler);
		this.on('runtimeModelUpdated', eventHandler);
    }
	// extend functionality
	Widget.prototype = Object.create(WbWidgetAbstract.prototype);

	/**
	 * Gets value of the input
	 * 
	 * @memberof pre
	 */
	Widget.prototype.text = function(){
		var value = arguments[0];
		if(value){
			this.setElementAttribute('text', value);
		}
		var element = this.getElement();
		return element.text.apply(element, arguments);
	};

	return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name summary
 * @description Manage a widget
 */
.factory('WbWidgetSummary', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name svg
 * @description Manage a widget
 */
.factory('WbWidgetSvg', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name template
 * @description Manage a widget
 */
.factory('WbWidgetTemplate', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name textarea
 * @description Manage a textarea
 * 
 * Textarea is one of input widgets used to get textual information from clients.
 * This controller is about to manage a textarea.
 * 
 */
 .factory('WbWidgetTextarea', function (WbWidgetAbstract) {
     function Widget($element, $parent) {
         WbWidgetAbstract.apply(this, [$element, $parent]);
         this.addElementAttributes('autofocus',
                 'cols',
                 'dirname',
                 'disabled',
                 'form',
                 'maxlength',
                 'name',
                 'placeholder',
                 'readonly',
                 'required',
                 'rows',
                 'wrap',
                 'value');
     }
     Widget.prototype = Object.create(WbWidgetAbstract.prototype);

     /**
      * Gets value of the input
      * 
      * @memberof input
      */
     Widget.prototype.val = function(){
         var value = arguments[0];
         if(value){
             this.setElementAttribute('value', value);
         }
         var element = this.getElement();
         return element.val.apply(element, arguments);
     };

     return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name track
 * @description Manage a widget
 */
.factory('WbWidgetTrack', function (WbWidgetAbstract) {
    function Widget($element, $parent){
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes();
    }
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);
    return Widget;
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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name ul
 * @description Manage a widget
 */
.factory('WbWidgetUl', function (WbWidgetGroup) {
	function Widget($element, $parent){
		WbWidgetGroup.apply(this, [$element, $parent]);
		this.addElementAttributes();
	}
	Widget.prototype = Object.create(WbWidgetGroup.prototype);
	return Widget;
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
angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name video
 * @description Manage a widget with 
 */
 .factory('WbWidgetVideo', function (WbWidgetGroup) {
    function Widget($element, $parent) {
        WbWidgetGroup.apply(this, [$element, $parent ]);
        this.addElementAttributes('autoplay', 'controls', 'height',
                'loop', 'muted', 'poster', 'preload', 'src',
                'usemap', 'width');
        this.setAllowedTypes('source');
    }
    Widget.prototype = Object.create(WbWidgetGroup.prototype);
    return Widget;
});

