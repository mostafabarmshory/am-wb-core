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