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