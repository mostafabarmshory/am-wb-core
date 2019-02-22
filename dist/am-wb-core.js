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
.config(['ngMdIconServiceProvider', function(ngMdIconServiceProvider) {
	ngMdIconServiceProvider
	// Add single icon
	.addShape('standby', '<path d="M13 3.5h-2v10h2v-10z"/><path d="M16.56 5.94l-1.45 1.45C16.84 8.44 18 10.33 18 12.5c0 3.31-2.69 6-6 6s-6-2.69-6-6c0-2.17 1.16-4.06 2.88-5.12L7.44 5.94C5.36 7.38 4 9.78 4 12.5c0 4.42 3.58 8 8 8s8-3.58 8-8c0-2.72-1.36-5.12-3.44-6.56z"/>')
	// Get an existing icon
	.addShape('custom-delete', ngMdIconServiceProvider.getShape('delete'))
	.addShape('vertical', ngMdIconServiceProvider.getShape('view_sequential'))
	
	.addShape('corner_bottom_left', '<path d="M 5,5 H 3 V 3 H 5 Z M 5,7 H 3 v 2 h 2 z m 16,4 h -2 v 2 h 2 z m 0,-4 h -2 v 2 h 2 z m 0,8 h -2 v 2 h 2 z m 0,4 h -2 v 2 h 2 z m -4,0 h -2 v 2 h 2 z M 9,3 H 7 v 2 h 2 z m 4,0 h -2 v 2 h 2 z M 9,3 H 7 v 2 h 2 z m 8,0 h -2 v 2 h 2 z m 4,0 h -2 v 2 h 2 z M 3,16 c 0,2.76 2.24,5 5,5 h 5 V 19 H 8 C 6.35,19 5,17.65 5,16 V 11 H 3 Z" />')
	.addShape('corner_bottom_right', '<path d="m 5,19 v 2 H 3 v -2 z m 2,0 v 2 h 2 v -2 z m 4,-16 0,2 2,0 0,-2 z M 7,3 V 5 L 9,5 9,3 Z m 8,0 0,2 2,0 V 3 Z m 4,0 v 2 h 2 V 3 Z m 0,4 v 2 l 2,0 V 7 Z M 3,15 v 2 h 2 v -2 z m 0,-4 v 2 h 2 v -2 z m 0,4 v 2 H 5 V 15 Z M 3,7 V 9 H 5 V 7 Z M 3,3 V 5 H 5 V 3 Z m 13,18 c 2.76,0 5,-2.24 5,-5 v -5 l -2,0 0,5 c 0,1.65 -1.35,3 -3,3 l -5,0 v 2 z" />')
	.addShape('corner_top_left', '<path d="M 19,5 V 3 h 2 V 5 Z M 17,5 V 3 h -2 v 2 z m -4,16 v -2 h -2 v 2 z m 4,0 v -2 h -2 v 2 z M 9,21 V 19 H 7 v 2 z M 5,21 V 19 H 3 l 0,2 z M 5,17 5,15 H 3 v 2 z M 21,9 V 7 h -2 v 2 z m 0,4 v -2 h -2 v 2 z M 21,9 V 7 h -2 v 2 z m 0,8 v -2 h -2 v 2 z m 0,4 v -2 h -2 v 2 z M 8,3 C 5.24,3 3,5.24 3,8 v 5 H 5 V 8 C 5,6.35 6.35,5 8,5 h 5 V 3 Z" />')
	.addShape('corner_top_right', '<path d="m 19,19 h 2 v 2 h -2 z m 0,-2 h 2 V 15 H 19 Z M 3,13 H 5 V 11 H 3 Z m 0,4 H 5 V 15 H 3 Z M 3,9 H 5 V 7 H 3 Z M 3,5 H 5 V 3 H 3 Z M 7,5 H 9 V 3 H 7 Z m 8,16 h 2 v -2 h -2 z m -4,0 h 2 v -2 h -2 z m 4,0 h 2 V 19 H 15 Z M 7,21 H 9 V 19 H 7 Z M 3,21 H 5 V 19 H 3 Z M 21,8 C 21,5.24 18.76,3 16,3 h -5 v 2 h 5 c 1.65,0 3,1.35 3,3 v 5 h 2 z" />')
//	.addShape('full_rounded', '<path d="M 8.0014104,3 C 5.24171,3 3.0019529,5.2696872 3.0019529,8.0664062 3.001871,10.700363 2.9999115,13.594641 3,15.933594 3,18.730313 5.2397571,21 7.9994576,21 10.666486,21 13.333514,21 16.000542,21 18.760243,21 21,18.730313 21,15.933594 21.001449,13.308911 20.998,10.689605 20.998,8.0664062 20.998047,5.2696872 18.75829,3 15.99859,3 13.32628,3 10.379799,3 8.0014104,3 Z m 0,2.0273438 c 2.6723096,0 5.6187916,0 7.9971796,0 1.649821,0 2.999674,1.3671108 2.999674,3.0390624 -0.0019,2.5827918 0.0022,5.4559078 0.002,7.8671878 0,1.671952 -1.349854,3.039062 -2.999675,3.039062 -2.67353,0 -5.621496,0 -8.0010844,0 -1.649821,0 -2.9996746,-1.36711 -2.9996746,-3.039062 8.18e-5,-2.633957 0.00204,-5.528236 0.00195,-7.8671878 0,-1.6719517 1.3498536,-3.0390624 2.9996745,-3.0390624 z" />')
	.addShape('full_rounded', ngMdIconServiceProvider.getShape('crop_free'))
	
	.addShape('align_justify_vertical', '<path d="M 21,21 V 3 h -2 v 18 z m -4,0 V 3 h -2 l 0,18 z m -4,0 0,-18 h -2 l 0,18 z M 9,21 9,3 H 7 L 7,21 Z M 3,21 H 5 L 5,3 H 3 Z" />')
	.addShape('align_center_vertical', '<path d="m 15,17 h 2 V 7 h -2 z m 6,4 V 3 h -2 v 18 z m -8,0 0,-18 h -2 l 0,18 z M 7,17 H 9 L 9,7 H 7 Z M 3,21 H 5 L 5,3 H 3 Z" />')
	.addShape('align_end_vertical', '<path d="m 15,9 0,12 h 2 V 9 Z M 7,9 7,21 H 9 L 9,9 Z m 6,12 0,-18 h -2 l 0,18 z m 8,0 V 3 H 19 V 21 Z M 3,21 H 5 L 5,3 H 3 Z" />')
	.addShape('align_start_vertical', '<path d="M 21,21 V 3 H 19 V 21 Z M 17,15 V 3 h -2 l 0,12 z m -4,6 0,-18 h -2 l 0,18 z M 9,15 9,3 H 7 V 15 Z M 3,21 H 5 L 5,3 H 3 Z" />')

	.addShape('sort_space_between_horiz', '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 1.5373337,1.999831 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 H 8.465053 c 0.4320489,0 0.7855436,-0.350389 0.7855436,-0.778642 V 7.3281513 c 0,-0.4282528 -0.3534947,-0.7786414 -0.7855436,-0.7786414 z m 9.4265256,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />')
	.addShape('sort_space_around_horiz', '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007773 3,4.5572829 V 19.442717 C 3,20.299223 3.7069894,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572829 C 21,3.7007773 20.293011,3 19.428912,3 Z m 0,1.549679 H 19.428912 V 19.451842 H 4.5710877 Z m 2.6757586,1.9602906 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.343697 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 h 2.3566315 c 0.4320492,0 0.7855442,-0.350389 0.7855442,-0.778642 V 7.288611 c 0,-0.4282528 -0.353495,-0.7786414 -0.7855442,-0.7786414 z m 7.0698947,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.343697 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356631 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.288611 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />')
	.addShape('sort_center_horiz', '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 3.7344017,1.999831 c -0.4320492,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534946,0.778642 0.7855438,0.778642 h 2.3566316 c 0.432049,0 0.785543,-0.350389 0.785543,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785543,-0.7786414 z m 5.4988066,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356631 c 0.43205,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785544,-0.7786414 z" />')
	.addShape('sort_start_horiz', '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 1.5373337,1.999831 c -0.4320491,0 -0.7855438,0.3503886 -0.7855438,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855438,0.778642 H 8.465053 c 0.4320489,0 0.7855436,-0.350389 0.7855436,-0.778642 V 7.3281513 c 0,-0.4282528 -0.3534947,-0.7786414 -0.7855436,-0.7786414 z m 5.4988066,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785543,-0.350389 0.785543,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353494,-0.7786414 -0.785543,-0.7786414 z" />')
	.addShape('sort_end_horiz', '<path d="M 4.5710877,3 C 3.7069894,3 3,3.7007772 3,4.5572828 V 19.442717 C 3,20.299223 3.7069895,21 4.5710877,21 H 19.428912 C 20.293011,21 21,20.299223 21,19.442717 V 4.5572828 C 21,3.7007772 20.293011,3 19.428912,3 Z m 0,1.5496789 H 19.428912 V 19.451841 H 4.5710877 Z m 5.4650523,1.999831 c -0.4320487,0 -0.7855434,0.3503886 -0.7855434,0.7786414 v 9.3436967 c 0,0.428253 0.3534947,0.778642 0.7855434,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z m 5.498807,0 c -0.432049,0 -0.785544,0.3503886 -0.785544,0.7786414 v 9.3436967 c 0,0.428253 0.353495,0.778642 0.785544,0.778642 h 2.356632 c 0.432049,0 0.785544,-0.350389 0.785544,-0.778642 V 7.3281513 c 0,-0.4282528 -0.353495,-0.7786414 -0.785544,-0.7786414 z" />')
	
	.addShape('sort_space_between_vert', '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-1.537333 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-9.426526 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 6.108421 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />')
	.addShape('sort_space_around_vert', '<path d="M 3,19.428912 C 3,20.293011 3.7007773,21 4.5572829,21 H 19.442717 C 20.299223,21 21,20.293011 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572829 C 3.7007773,3 3,3.706989 3,4.571088 Z m 1.549679,0 0,-14.857824 h 14.902163 v 14.857824 z m 1.9602906,-2.675758 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 h 9.343697 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.343697,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-7.069895 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.343697,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 7.326628 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.288611 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />')
	.addShape('sort_center_vert', '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-3.734401 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785543 -0.778642,-0.785543 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785543 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 7.839073 c 0,-0.43205 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785544 z" />')
	.addShape('sort_start_vert', '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-5.465052 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 l 9.3436967,0 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 6.108421 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 H 7.3281513 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z" />')
	.addShape('sort_end_vert', '<path d="M 3,19.428912 C 3,20.293011 3.7007772,21 4.5572828,21 H 19.442717 C 20.299223,21 21,20.29301 21,19.428912 V 4.571088 C 21,3.706989 20.299223,3 19.442717,3 H 4.5572828 C 3.7007772,3 3,3.706989 3,4.571088 Z m 1.5496789,0 0,-14.857824 H 19.451841 v 14.857824 z m 1.999831,-1.537333 c 0,0.432049 0.3503886,0.785543 0.7786414,0.785543 h 9.3436967 c 0.428253,0 0.778642,-0.353494 0.778642,-0.785543 v -2.356632 c 0,-0.432049 -0.350389,-0.785544 -0.778642,-0.785544 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353495 -0.7786414,0.785544 z m 0,-5.498807 c 0,0.432049 0.3503886,0.785544 0.7786414,0.785544 l 9.3436967,0 c 0.428253,0 0.778642,-0.353495 0.778642,-0.785544 V 10.03614 c 0,-0.432049 -0.350389,-0.785543 -0.778642,-0.785543 l -9.3436967,0 c -0.4282528,0 -0.7786414,0.353494 -0.7786414,0.785543 z" />')
        .addShape('download', '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Capa_1" x="0px" y="0px" width="18" height="18" viewBox="0 0 24 24" xml:space="preserve" sodipodi:docname="download11111.svg" inkscape:version="0.92.3(2405546, 2018-03-11)"><metadata id="metadata44"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage" /><dc:title></dc:title></cc:Work></rdf:RDF></metadata><defs id="defs42" /><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10" guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1366" inkscape:window-height="706" id="namedview40" showgrid="false" inkscape:zoom="6.1592508" inkscape:cx="-15.061405" inkscape:cy="1.1743357" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:current-layer="Capa_1" /><g id="g135" transform="matrix(0.06722689,0,0,0.05536332,-2.5714288,-4.45e-6)"><g id="g78"><g id="file-download"><path id="path75" d="m 395.25,153 h -102 V 0 h -153 v 153 h -102 l 178.5,178.5 z m -357,229.5 v 51 h 357 v -51 z" inkscape:connector-curvature="0" /></g></g></g></svg>')
	.addShape('upload', '<svg xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:cc="http://creativecommons.org/ns#" xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:svg="http://www.w3.org/2000/svg" xmlns="http://www.w3.org/2000/svg" xmlns:sodipodi="http://sodipodi.sourceforge.net/DTD/sodipodi-0.dtd" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" version="1.1" id="Capa_1" x="0px" y="0px" width="18" height="18" viewBox="0 0 24 24" xml:space="preserve" sodipodi:docname="upload-button.svg" inkscape:version="0.92.3 (2405546, 2018-03-11)"><metadata id="metadata44"><rdf:RDF><cc:Work rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type rdf:resource="http://purl.org/dc/dcmitype/StillImage"/><dc:title /></cc:Work></rdf:RDF></metadata><defs id="defs42" /><sodipodi:namedview pagecolor="#ffffff" bordercolor="#666666" borderopacity="1" objecttolerance="10" gridtolerance="10"  guidetolerance="10" inkscape:pageopacity="0" inkscape:pageshadow="2" inkscape:window-width="1366" inkscape:window-height="706" id="namedview40" showgrid="false" inkscape:zoom="2.177624" inkscape:cx="-53.237791" inkscape:cy="29.341367" inkscape:window-x="-8" inkscape:window-y="-8" inkscape:window-maximized="1" inkscape:current-layer="Capa_1" /><g id="g73" transform="matrix(0.06722689,0,0,0.05536332,-2.5714288,-4.45e-6)"><g id="g15"><g   id="file-upload-8"><polygon id="polygon10" points="140.25,178.5 140.25,331.5 293.25,331.5 293.25,178.5 395.25,178.5 216.75,0 38.25,178.5 " /><rect id="rect12" height="51" width="357" y="382.5" x="38.25" /></g></g></g></svg>')
	// Add multiple icons
	.addShapes({
		'wb-opacity': '<path d="M3.55,18.54L4.96,19.95L6.76,18.16L5.34,16.74M11,22.45C11.32,22.45 13,22.45 13,22.45V19.5H11M12,5.5A6,6 0 0,0 6,11.5A6,6 0 0,0 12,17.5A6,6 0 0,0 18,11.5C18,8.18 15.31,5.5 12,5.5M20,12.5H23V10.5H20M17.24,18.16L19.04,19.95L20.45,18.54L18.66,16.74M20.45,4.46L19.04,3.05L17.24,4.84L18.66,6.26M13,0.55H11V3.5H13M4,10.5H1V12.5H4M6.76,4.84L4.96,3.05L3.55,4.46L5.34,6.26L6.76,4.84Z" />',
		'wb-vertical-boxes': '<path d="M4,21V3H8V21H4M10,21V3H14V21H10M16,21V3H20V21H16Z" />',
		'wb-horizontal-boxes': '<path d="M3,4H21V8H3V4M3,10H21V14H3V10M3,16H21V20H3V16Z" />',
		'wb-horizontal-arrows': '<path d="M12,18.17L8.83,15L7.42,16.41L12,21L16.59,16.41L15.17,15M12,5.83L15.17,9L16.58,7.59L12,3L7.41,7.59L8.83,9L12,5.83Z" />',
		'wb-vertical-arrows': '<path d="M18.17,12L15,8.83L16.41,7.41L21,12L16.41,16.58L15,15.17L18.17,12M5.83,12L9,15.17L7.59,16.59L3,12L7.59,7.42L9,8.83L5.83,12Z" />',
		'wb-direction':'<path d="M13,6V11H18V7.75L22.25,12L18,16.25V13H13V18H16.25L12,22.25L7.75,18H11V13H6V16.25L1.75,12L6,7.75V11H11V6H7.75L12,1.75L16.25,6H13Z" />',

		'list_tree': '<path d="m 3.0063556,9.3749998 2.3368645,-1.125 -2.3432204,-1.25 z M 11,13 H 21 V 11 H 11 Z m 0,4 H 21 V 15 H 11 Z M 6.9999997,6.9999998 v 2 H 21 v -2 z" />',
		
		'wb-object-video': ngMdIconServiceProvider.getShape('video_library'),
		'wb-object-audio':  ngMdIconServiceProvider.getShape('audiotrack'),
		'wb-object-data': ngMdIconServiceProvider.getShape('storage'),
		
		'wb-widget-group': ngMdIconServiceProvider.getShape('pages'),
		'wb-widget-html': ngMdIconServiceProvider.getShape('settings_ethernet')
	});
}]);

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

    this.getStyleLayout = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.layout.' + key);
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
        ctrl.intersecting = $event.isIntersecting;
        ctrl.fire('intersection', $event);
        ctrl.evalWidgetEvent('intersection', $event);
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
//  - {Text} label (https://schema.org/title)
//  - {Text} description (https://schema.org/description)
//  - {Text} keywords (https://schema.org/keywords)
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
    this.resizeObserver.observe($element[0]);
    this.intersectionObserver.observe($element[0]);
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
}


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
var WbWidgetCtrl = function ($scope, $element, $wbUtil, $http, $widget, $mdMedia, $timeout) {
    WbAbstractWidget.call(this);
    this.setElement($element);
    this.setScope($scope);
    this.$wbUtil = $wbUtil;
    this.$http = $http;
    this.$widget = $widget;
    this.$mdMedia = $mdMedia;
    this.$timeout = $timeout;
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
        var keys = [ 'init', 'click', 'mouseout', 'mouseover', 'resize', 'intersection'];
        var titles = [ 'Initialization', 'Click', 'Mouseout', 'Mouseover', 'Resize', 'Intersection'];

        ngModelCtrl.$render = function () {
            if (ngModelCtrl.$viewValue) {
                widget = ngModelCtrl.$viewValue;
                if(angular.isArray(widget) && widget.length > 0){
                	widget = widget[0];
                	loadEvents();
                } else {
                	cleanEvents();
                }
            }
        };

        function cleanEvents(){
        	$scope.events = [];
        }
        
        function loadEvents() {
        	cleanEvents();
            for (var i = 0; i < keys.length; i++) {
                var event = {};
                event.key = keys[i];
                event.title = titles[i];
                event.code = widget.getModelProperty('event.' + event.key);
                $scope.events.push(event);
            }
        }

        function saveEvents() {
            for (var i = 0; i < $scope.events.length; i++) {
                var event = $scope.events[i];
                if (event.code) {
                    widget.setModelProperty('event.' + event.key, event.code);
                } else {
                    widget.setModelProperty('event.' + event.key, undefined);
                }
            }
        }

        /**
         * Save events into the model
         */
        $scope.saveEvents = saveEvents;
    }

    return {
        restrict : 'E',
        replace : true,
        templateUrl : 'views/directives/wb-event-panel.html',
        scope : {},
        link : postLink,
        require : [ 'ngModel' ],
        controllerAs: 'ctrl',
        /*
         * @ngInject
         */
        controller: function($scope, $resource){
            this.editEvent = function(event) {
                $resource.get('js', {
                    data: event.code
                })
                .then(function(value){
                    event.code = value;
                    if(!value){
                        delete event.code;
                    }
                    $scope.saveEvents();
                });
            };

            this.deleteEvent = function(event) {
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
.directive('wbGroup', function($compile, $widget, $wbUtil, $controller, $settings, $parse, $timeout) {

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
				$widget.compile(model).then(function(widget) {
					$element.append(widget.getElement());
					rootWidget = widget;
					widget.on('select', fireSelection);
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
		scope : {
			wbEditable : '=?',
			wbOnModelSelect : '@?',
			wbAllowedTypes : '<?'
		},
		link : wbGroupLink,
		require : 'ngModel'
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
 * @name wb-icon
 * @description Icon for WB
 */
.directive('wbIcon', function($interpolate) {
	function postLink(scope, element, attr, ctrl, transclude) {
		// Looking for icon
		var attrName = attr.$normalize(attr.$attr.wbIconName || '');
		transclude(scope, function(clone) {
			var text = clone.text();
			if (text && text.trim()) {
				scope.$watch(function() {
					return $interpolate(text.trim())(scope);
				}, function(value) {
					scope.iconValue = value;
				});
			}
		});

		if (attrName) {
			attr.$observe('wbIconName', iconChange);
		}

		/*
		 * change icon
		 */
		function iconChange() {
			scope.iconValue = scope.contentValue
			|| attr.wbIconName || '';
		}
	}

	return {
		restrict : 'E',
		template : '<ng-md-icon style="height: auto;width: auto;" icon="{{iconValue}}"></ng-md-icon>',
		scope : true,
		replace : true,
		transclude : true,
		link : postLink
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
			// load pages
			var widget = $widget.getWidget(wbWidget.getModel());
			var settingKeys = $settings.getSettingsFor(widget);

			// hide all settings
			var i;
			for(i = 0; i < $scope.settings.length; i++){
				$scope.settings[i].visible = false;
			}

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
.factory('WidgetLocatorManager',function ($widget, BoundWidgetLocator, SelectionWidgetLocator) {

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
                    var widget = $event.source;
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
                }
        };
    }

    
    WidgetLocatorManager.prototype.widgetDeleted = function(widget){
        if(this.isEnable()){
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
            if(index>-1){
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
        }
    };
    
    WidgetLocatorManager.prototype.widgetAdded = function(widget){
        if(this.isEnable()){
            // events
            angular.forEach(this.widgetListeners, function (callback, type) {
                widget.on(type, callback);
            });
            
            // update view
            this.updateLocators();
        }
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
        this.intersectingWidget = intersectingWidget;
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
        if(this.isVisible()){
            locator.connect(widget);
        } else {
            locator.disconnect();
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
        if(widget.isRoot()){
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
        type : 'wb-js',
        icon : 'script',
        label : 'JS Script',
        templateUrl : 'views/resources/wb-event-code-editor.html',
        /*
         * @ngInject
         */
        controller : function($scope) {
            $scope.$watch('value', function(value) {
                if (angular.isDefined(value)) {
                    $scope.$parent.setValue(value);
                } else {
                    $scope.$parent.setValue('');
                }
            }, true);
        },
        controllerAs: 'ctrl',
        tags : [ 'js' ]
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
        if(dimAll){
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

            this.init = function(){
                this.direction = this.getStyle('direction') || 'ltr';
                this.color = this.getStyle('color');

                this.cursor = this.getStyle('cursor');

                this.visibility = this.getStyle('visibility') || 'visible';
                this.opacity = this.getStyle('opacity');
                
                // overflow
                this.overflowX = this.getStyle('overflow.x') || 'visible';
                this.overflowY = this.getStyle('overflow.y') || 'visible';
            };
            
            this.updateOverflowX = function(){
                this.setStyle('overflow.x', this.overflowX);
            };
            this.updateOverflowY = function(){
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
            this.init = function(newWidget, oldWidget){
                this.image = this.getStyleBackground('image');
                this.color = this.getStyleBackground('color');
                this.size = this.getStyleBackground('size');
                this.repeat = this.getStyleBackground('repeat');
                this.position = this.getStyleBackground('position');
            };

            this.setBackgroundImage = function(image) {
                this.image = image;
                if(!this.size) {
                    this.size = 'cover';
                }
                if(!this.repeat) {
                    this.repeat = 'no-repeat';
                }
                if(!this.position) {
                    this.position = 'center center';
                }
                this.updateBackground();
            };

            this.updateBackground = function(){
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
        controller: function () {
            this.init = function(){
                // load data from model
                this.id = this.getProperty('id');
                this.label = this.getProperty('label');
                this.category = this.getProperty('category');
                this.property = this.getProperty('property');
                this.description = this.getProperty('description');
                this.keywords = this.getProperty('keywords');
                this.cover = this.getProperty('cover');
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
                this.alignSelf = this.getStyleLayout('align_self');
            };

            /**
             * Fetchs parent direction
             */
            this.getParentDirection = function(){
                var widget = this.getWidget();
                if(!widget || !widget.getParent()){
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
            this.updateAllMargin = function(val) {
                // default value of margin is 0px
                setAllDim(this.margin, val || '0px');
                this.updateMargin(this.margin);
            };

            /**
             * Sets all padding to the equal value
             * 
             * @memberof marginPaddingCtrl
             */
            this.updateAllPadding = function(val) {
                //default value of padding is 0px
                setAllDim(this.padding, val);
                this.updatePadding(this.padding)
            };

            this.updateMargin = function(newMargin) {
                this.setStyle('margin', createDimeStr(newMargin));
            };

            this.updatePadding = function(newPadding) {
                this.setStyle('padding', createDimeStr(newPadding));
            };

            this.init = function() {
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
                this.shadows = this.getProperty('style.shadows');
            };

            this.updateShadows = function(){
                this.setProperty('style.shadows', this.shadows);
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

            this.updateOrigin = function(){
                this.setProperty('style.transform.origin', this.origin);
            };

//          flat: Specifies that child elements will NOT preserve its 3D position. This is default
//          preserve-3d: Specifies that child elements will preserve its 3D position
//          initial: Sets this property to its default value. Read about initial
//          inherit: Inherits this property from its parent element. Read about inherit
            this.updateStyle = function(){
                this.setProperty('style.transform.style', this.style);
            };
            this.updatePerspective = function(){
                this.setProperty('style.transform.perspective', this.perspective);
            };

            // X
            this.updateTranslateX = function(){
                this.setProperty('style.transform.x.translate', this.translateX);
            };
            this.updateScaleX = function(){
                this.setProperty('style.transform.x.scale', this.scaleX);
            };
            this.updateRotateX = function(){
                this.setProperty('style.transform.x.rotate', this.rotateX);
            };
            this.updateSkewX = function(){
                this.setProperty('style.transform.x.skew', this.skewX);
            };

            // Y
            this.updateTranslateY = function(){
                this.setProperty('style.transform.y.translate', this.translateY);
            };
            this.updateScaleY = function(){
                this.setProperty('style.transform.y.scale', this.scaleY);
            };
            this.updateRotateY = function(){
                this.setProperty('style.transform.y.rotate', this.rotateY);
            };
            this.updateSkewY = function(){
                this.setProperty('style.transform.y.skew', this.skewY);
            };

            // Z
            this.updateTranslateZ = function(){
                this.setProperty('style.transform.z.translate', this.translateZ);
            };
            this.updateScaleZ = function(){
                this.setProperty('style.transform.z.scale', this.scaleZ);
            };
            this.updateRotateZ = function(){
                this.setProperty('style.transform.z.rotate', this.rotateZ);
            };
        }
    });
});

/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2015 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/*global tinymce:true */
'use strict';
angular.module('am-wb-core')

/**
 * Load default resources
 */
.run(function($resource) {

	function imageTool(editor) {

		function insertImage(url){
			editor.insertContent('<img src="' + url + '" >');
		}

		function showDialog(){
			$resource.get('image')//
			.then(function(value){
				insertImage(value);
			});
		}

		editor.addButton('image', {
			icon: 'image',
			tooltip: 'Insert/edit image',
			onclick: showDialog,
			stateSelector: 'img:not([data-mce-object],[data-mce-placeholder]),figure.image'
		});

		editor.addMenuItem('image', {
			icon: 'image',
			text: 'Image',
			onclick: showDialog,
			context: 'insert',
			prependToContext: true
		});

		editor.addCommand('mceImage', showDialog);
	}

	tinymce.PluginManager.add('image', imageTool);
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
                margin: '1px'
            }
        },
        // functional properties
        templateUrl: 'views/directives/wb-group.html',
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
        templateUrl: 'views/widgets/wb-html.html'
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
 * @name $wbFloat
 * @description Open and manage float panels
 * 
 * 
 * The base of this implementation is https://jspanel.de/api.html
 */
.service('$wbFloat', function($q, $wbUtil, $rootScope, $compile, $controller) {

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
		var deferred = $q.defer();
		// create scopse
		var parenScope = optionsOrPreset.parent || $rootScope;
		var childScope = optionsOrPreset.scope || parenScope.$new(false, parenScope);

		var panel = jsPanel.create({
			theme: 'primary',
			headerTitle : optionsOrPreset.title || 'my panel #1',
			position : optionsOrPreset.position || 'center-top 0 58',
			panelSize : optionsOrPreset.panelSize || '400 400',
			contentSize : optionsOrPreset.contentSize || '450 250',
			headerControls: optionsOrPreset.headerControls || 'all',
			content : '<div style="border-top: 1px solid;width: 100%;height: 250px;padding: 0px;pointer-events: inherit;"></div>',
			callback : function() {
				var parentElement = angular.element(this.content);

				// 2- create element
				return $wbUtil.getTemplateFor(optionsOrPreset)//
				.then(function(template) {
					var element = angular.element(template);

					// 3- bind controller
					var link = $compile(element);
					if (angular.isDefined(optionsOrPreset.controller)) {
						var wbFloat = {
								hide: function(response) {
									panel.close();
									deferred.resolve(response);
								},
								cancel: function(response) {
									panel.close();
									deferred.reject(response);
								}
						};
						var locals = {
								$scope : childScope,
								$element : element,
								$wbFloat : wbFloat
						};
						var controller = $controller(optionsOrPreset.controller, locals);
						if (optionsOrPreset.controllerAs) {
							childScope[optionsOrPreset.controllerAs] = controller;
						}
						element.data('$ngControllerController', controller);
					}
					link(childScope);
					parentElement.children('div').append(element);
					return element;
				});
			},			
			onclosed: function(){
				/*
				 * Remove scope
				 * 
				 * NOTE: if there is a $watch, then this return an error
				 */
				if(!optionsOrPreset.scope){
					childScope.$destroy();
				}
			}
		});
		return deferred.promise;
	};


	this.create = function(optionsOrPreset) {
		// create scopse
		var parenScope = optionsOrPreset.parent || $rootScope;
		var childScope = optionsOrPreset.scope || parenScope.$new(false, parenScope);
		

		var panel = jsPanel.create({
			theme: 'primary',
			headerTitle : optionsOrPreset.title || 'my panel #1',
			position : optionsOrPreset.position || 'center-top 0 58',
			panelSize : optionsOrPreset.panelSize || '400 400',
			contentSize : optionsOrPreset.contentSize || '450 250',
			headerControls: optionsOrPreset.headerControls || 'all',
			content : '<div style="border-top: 1px solid;width: 100%;height: 250px;padding: 0px;pointer-events: inherit;"></div>',
			callback : function() {
				var parentElement = angular.element(this.content);

				// 2- create element
				return $wbUtil.getTemplateFor(optionsOrPreset)//
				.then(function(template) {
					var element = angular.element(template);

					// 3- bind controller
					var link = $compile(element);
					if (angular.isDefined(optionsOrPreset.controller)) {
						var locals = {
								$scope : childScope,
								$element : element
						};
						var controller = $controller(optionsOrPreset.controller, locals);
						if (optionsOrPreset.controllerAs) {
							childScope[optionsOrPreset.controllerAs] = controller;
						}
						element.data('$ngControllerController', controller);
					}
					link(childScope);
					parentElement.children('div').append(element);
					return element;
				});
			},
			onclosed: function(){
				/*
				 * Remove scope
				 * 
				 * NOTE: if there is a $watch, then this return an error
				 */
				if(!optionsOrPreset.scope){
					childScope.$destroy();
				}
			}
		});

		var rootElement = angular.element(panel);
		panel.setVisible = function(flag){
			this._isVisible = flag;
			rootElement.css('visibility', this._isVisible ? 'visible' : 'hidden');
		};

		panel.isVisible = function(){
			return this._isVisible;
		};

		return panel;
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
 * @name $widget
 * @description Resource managment
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

		/**
		 * Sets value to the real var
		 * 
		 */
		function setValue(value){
			$scope.value = value;
		}

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
		$scope.setValue = setValue;

		if(pages.length){
			loadPage(pages[0]);
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
angular.module('am-wb-core').service('$wbUi', function($mdDialog, $q, $http) {

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
angular.module('am-wb-core').service('$wbUtil', function ($q, $templateRequest, $sce) {
    'use strict';
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
                style.size || {},
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
            if(transformOptions.x.rotate){
                transform += ' rotateX('+transformOptions.x.rotate+')';
            }
            if(transformOptions.x.translate){
                transform += ' translateX('+transformOptions.x.translate+')';
            }
            if(transformOptions.x.scale){
                transform += ' scaleX('+transformOptions.x.scale+')';
            }
            if(transformOptions.x.skew){
                transform += ' skewX('+transformOptions.x.skew+')';
            }
        }
        if(transformOptions.y){
            if(transformOptions.y.rotate){
                transform += ' rotateY('+transformOptions.y.rotate+')';
            }
            if(transformOptions.y.translate){
                transform += ' translateY('+transformOptions.y.translate+')';
            }
            if(transformOptions.y.scale){
                transform += ' scaleY('+transformOptions.y.scale+')';
            }
            if(transformOptions.y.skew){
                transform += ' skewY('+transformOptions.y.skew+')';
            }
        }
        if(transformOptions.z){
            if(transformOptions.y.rotate){
                transform += ' rotateZ('+transformOptions.z.rotate+')';
            }
            if(transformOptions.y.translate){
                transform += ' translateZ('+transformOptions.z.translate+')';
            }
            if(transformOptions.y.scale){
                transform += ' scaleZ('+transformOptions.z.scale+')';
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
        }
        cssValue['background-image'] = (style.image) ? 'url(\''+style.image+'\')' : 'none';
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
            // TODO: maso, 2018: compute based on size
            flexLayout['flex-basis'] = 'auto';

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
     * @return promise A promise that resolve created element
     */
    function compile(model, parentWidget){
        var widget = _widget(model);
        var childScope = null;
        var element = null;

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
        return $wbUtil.getTemplateFor(widget)//
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

            var ctrl;

            // 3- bind controller
            element = angular.element(template);
            var link = $compile(element);
            var wlocals = _.merge({
                $scope : childScope,
                $element : element,
            }, service.providers);
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

angular.module('am-wb-core').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/dialogs/wb-select-resource-single-page.html',
    "<md-dialog aria-label=\"Select item/items\" style=\"width:50%; height:70%\"> <form ng-cloak layout=column flex> <md-dialog-content mb-preloading=loadingAnswer flex layout=row> <div layout=column flex> <div id=wb-select-resource-children style=\"margin: 0px; padding: 0px; overflow: auto\" layout=column flex> </div> </div> </md-dialog-content> <md-dialog-actions layout=row>       <span flex></span> <md-button ng-click=cancel() aria-label=Cancel> <span translate=\"\">Close</span> </md-button> <md-button class=md-primary aria-label=Done ng-click=answer()> <span translate=\"\">Ok</span> </md-button> </md-dialog-actions> </form> </md-dialog>"
  );


  $templateCache.put('views/dialogs/wb-select-resource.html',
    "<md-dialog aria-label=\"Select item/items\" style=\"width:70%; height:70%\"> <form ng-cloak layout=column flex> <md-dialog-content mb-preloading=loadingAnswer flex layout=row> <md-sidenav class=md-sidenav-left md-component-id=left md-is-locked-open=true md-whiteframe=4 layout=column ng-hide=\"pages.length === 1\"> <div style=\"text-align: center\"> <wb-icon size=64px ng-if=style.icon>{{style.icon}}</wb-icon> <h2 style=\"text-align: center\" translate>{{style.title}}</h2> <p style=\"text-align: center\" translate>{{style.description}}</p> </div> <md-devider></md-devider> <md-content> <md-list style=\"padding:0px; margin: 0px\"> <md-list-item ng-repeat=\"page in pages | orderBy:priority\" ng-click=\"loadPage(page, $event);\" md-colors=\"_selectedIndex===$index ? {background:'accent'} : {}\"> <wb-icon>{{page.icon || 'attachment'}}</wb-icon> <p>{{page.label | translate}}</p> </md-list-item> </md-list> </md-content> </md-sidenav> <div layout=column flex> <div id=wb-select-resource-children style=\"margin: 0px; padding: 0px; overflow: auto\" layout=column flex> </div> </div> </md-dialog-content> <md-dialog-actions layout=row> <span flex></span> <md-button aria-label=Cancel ng-click=cancel()> <span translate=\"\">Close</span> </md-button> <md-button class=md-primary aria-label=Done ng-click=answer()> <span translate=\"\">Ok</span> </md-button> </md-dialog-actions> </form> </md-dialog>"
  );


  $templateCache.put('views/directives/wb-event-panel.html',
    "<table class=mb-table style=\"font-size: 10px\"> <thead> <tr md-colors=\"{color: 'primary-700'}\"> <td translate>Name</td> <td translate>Code</td> <td></td> </tr> </thead> <tbody> <tr ng-repeat=\"event in events track by $index\"> <td>{{event.title}}</td> <td>{{event.code | limitTo:13 }} ...</td> <td> <md-button ng-click=\"ctrl.editEvent(event, $event)\" class=md-icon-button> <wb-icon>edit</wb-icon> </md-button> <md-button ng-if=event.code ng-click=\"ctrl.deleteEvent(event, $event)\" class=md-icon-button> <wb-icon>delete</wb-icon> </md-button> </td> </tr> </tbody> </table>"
  );


  $templateCache.put('views/directives/wb-group.html',
    "<div class=wb-group dir=\"{{wbModel.direction || wbModel.style.dir}}\" name={{wbModel.name}} id={{wbModel.id}} dnd-disable-if=!ctrl.isEditable() dnd-draggable=wbModel dnd-effect-allowed=copyMove dnd-type=\"'Group'\" dnd-moved=ctrl.delete() dnd-list=wbModel.contents dnd-allowed-types=ctrl.getAllowedTypes() dnd-external-sources=true dnd-drop=\"ctrl.addChild(index, item)\" dnd-horizontal-list=\"wbModel.style.layout.direction==='row'\" md-theme-watch=true></div>"
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
    "<div> <div layout=column>  <md-toolbar ng-show=!(showSearch||showSort||showState)> <div class=md-toolbar-tools> <h3 flex translate>Widgets</h3> <md-button class=md-icon-button aria-label=Search ng-click=\"showSearch = !showSearch\"> <wb-icon>search</wb-icon> </md-button> <md-divider></md-divider> <md-button ng-click=\"wbWidgetExplorer._view_list=!wbWidgetExplorer._view_list\" class=md-icon-button aria-label=\"View mode\"> <wb-icon>{{wbWidgetExplorer._view_list ? 'view_module' : 'view_list'}}</wb-icon> </md-button> <md-button ng-click=\"wbWidgetExplorer._tree_mode=!wbWidgetExplorer._tree_mode\" class=md-icon-button aria-label=\"Tree mode\"> <wb-icon>{{wbWidgetExplorer._tree_mode? 'list' : 'list_tree'}}</wb-icon> </md-button> </div> </md-toolbar>  <md-toolbar class=md-hue-1 ng-show=showSearch> <div class=md-toolbar-tools> <md-button class=md-icon-button ng-click=\"showSearch = !showSearch\" aria-label=Back> <wb-icon>arrow_back</wb-icon> </md-button> <md-input-container md-theme=input flex> <label>&nbsp;</label> <input ng-model=query ng-keyup=\"runQuery(query, $event)\"> </md-input-container> <md-button class=md-icon-button aria-label=Search ng-click=\"showSearch = !showSearch\"> <wb-icon>search</wb-icon> </md-button> </div> </md-toolbar> <md-expansion-panel-group ng-if=wbWidgetExplorer._tree_mode> <md-expansion-panel ng-repeat=\"group in groups\"> <md-expansion-panel-collapsed> <span translate>{{group.title || group.id}}</span> </md-expansion-panel-collapsed> <md-expansion-panel-expanded> <md-expansion-panel-header> <span translate>{{group.title || group.id}}</span> </md-expansion-panel-header> <md-expansion-panel-content style=\"padding: 0px; margin: 0px\"> <wb-widgets-list ng-if=wbWidgetExplorer._view_list widgets=group.widgets> </wb-widgets-list> <wb-widgets-module ng-if=!wbWidgetExplorer._view_list widgets=group.widgets> </wb-widgets-module> </md-expansion-panel-content> </md-expansion-panel-expanded> </md-expansion-panel> </md-expansion-panel-group> <wb-widgets-list ng-if=\"!wbWidgetExplorer._tree_mode &amp;&amp; wbWidgetExplorer._view_list\" widgets=widgets> </wb-widgets-list> <wb-widgets-module ng-if=\"!wbWidgetExplorer._tree_mode &amp;&amp; !wbWidgetExplorer._view_list\" widgets=widgets> </wb-widgets-module> </div> </div>"
  );


  $templateCache.put('views/directives/wb-widgets-list.html',
    "<md-list flex> <md-list-item class=md-2-line ng-repeat=\"widget in widgets\" dnd-draggable=\"widget.model || {}\" dnd-type=widget.type dnd-effect-allowed=copy> <wb-icon wb-icon-name={{widget.icon}}></wb-icon> <div class=md-list-item-text layout=column> <h3 translate>{{widget.title}}</h3> <p translate>{{widget.description}}</p> </div> <wb-icon ng-if=openHelp class=md-secondary ng-click=\"openHelp(widget, $event)\" aria-label=\"Show help\">help</wb-icon> </md-list-item> </md-list>"
  );


  $templateCache.put('views/directives/wb-widgets-module.html',
    "<div layout=column layout-gt-sm=row layout-align=space-around layout-wrap> <div class=\"wb-widgets-module md-whiteframe-1dp\" ng-repeat=\"widget in widgets\" dnd-draggable=\"widget.model || {}\" dnd-type=widget.type dnd-effect-allowed=copy flex=none flex-gt-sm=30 layout=column layout-align=\"start center\" layout-padding> <wb-icon size=32px wb-icon-name={{widget.icon}}></wb-icon> <p flex class=wb-text-truncate translate=\"\">{{widget.title}}</p> <md-tooltip md-delay=1500>{{widget.description | translate}}</md-tooltip> </div> </div>"
  );


  $templateCache.put('views/partials/wb-widget-options.html',
    ""
  );


  $templateCache.put('views/resources/wb-event-code-editor.html',
    "<textarea dir=ltr rows=10 cols=10 ng-model=value></textarea>"
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
    " <wb-ui-setting-choose ng-if=\"ctrl.getParentDirection() === 'row'\" title=\"Self Vert.\" items=\"ctrl.selfAlign_['row']\" ng-model=ctrl.alignSelf ng-change=ctrl.alignSelfChanged()> </wb-ui-setting-choose> <wb-ui-setting-choose ng-if=\"ctrl.getParentDirection() !== 'row'\" title=\"Self Vert.\" items=\"ctrl.selfAlign_['column']\" ng-model=ctrl.alignSelf ng-change=ctrl.alignSelfChanged()> </wb-ui-setting-choose>"
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
    " <md-input-container> <label translate=\"\">Id</label> <input ng-model=ctrl.id ng-change=\"ctrl.setProperty('id', ctrl.id)\"> </md-input-container> <md-input-container> <label translate=\"\">Label</label> <input ng-model=ctrl.label ng-change=\"ctrl.setProperty('label', ctrl.label)\"> </md-input-container> <md-input-container> <label translate=\"\">Type</label> <input ng-model=ctrl.category ng-change=\"ctrl.setProperty('category', ctrl.category)\"> </md-input-container> <md-input-container> <label translate=\"\">Property</label> <input ng-model=ctrl.property ng-change=\"ctrl.setProperty('property', ctrl.property)\"> </md-input-container> <md-input-container> <label translate=\"\">Description</label> <input ng-model=ctrl.description ng-change=\"ctrl.setProperty('description', ctrl.description)\"> </md-input-container> <md-input-container> <label translate=\"\">Keywords</label> <input ng-model=ctrl.keywords ng-change=\"ctrl.setProperty('keywords', ctrl.keywords)\"> </md-input-container> <wb-ui-setting-image ng-if=ctrl.isRoot() title=Cover wb-ui-setting-clear-button=true wb-ui-setting-preview=true ng-model=ctrl.cover ng-change=\"ctrl.setProperty('cover', ctrl.cover)\"> </wb-ui-setting-image>"
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


  $templateCache.put('views/widgets/wb-html.html',
    " <div ng-if=!ctrl.isEditable() ng-bind-html=\"::wbModel.text | wbunsafe\" class=\"wb-widget-fill wb-widget-text\"> </div> <div ng-if=ctrl.isEditable() ui-tinymce=\"{\n" +
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
    "        format: 'raw',\n" +
    "    }\" ng-model=wbModel.text class=\"wb-widget-fill tinymce wb-widget-text\" ng-keydown=$event.stopPropagation();> </div>"
  );


  $templateCache.put('views/widgets/wb-notfound.html',
    "<div ng-show=wbEditable> Unsuported widget?! </div>"
  );

}]);
