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

jQuery.fn.extend({
	getPath: function () {
		var path, node = this;
		while (node.length) {
			var realNode = node[0], name = realNode.localName;
			if (!name) { 
				break;
			}
			name = name.toLowerCase();
			var parent = node.parent();
			var sameTagSiblings = parent.children(name);
			if (sameTagSiblings.length > 1) { 
				var allSiblings = parent.children();
				var index = allSiblings.index(realNode) + 1;
				if (index > 1) {
					name += ':nth-child(' + index + ')';
				}
			}
			path = name + (path ? '>' + path : '');
			node = parent;
		}
		return path;
	}
});

angular.module('am-wb-core', [
	// base
	'ngMessages',
	'ngAnimate',
	'ngAria',
	'ngSanitize',
	'ngRoute', 

	// editor
	'ngMaterial',
	'ngMdIcons',
	'mdColorPicker',
	'pascalprecht.translate',

	'ngStorage', // https://github.com/gsklee/ngStorage
])

/**
 * @ngdoc Service
 * @name $ObjectPath
 * 
 * Utility to access object properties
 */
.service('$objectPath', function(){

	this.proxy = function(object){
		return objectPath(object);
	};

	/**
	 * @name has
	 * @memberof $ObjectPath
	 */
	this.has = function(key){
		return objectPath.has(key);
	};

	/**
	 * @name ensureExists
	 * @memberof $ObjectPath
	 */
	this.ensureExists = function(obj, path, value){
		objectPath.ensureExists(obj, path, value);
	};

	/**
	 * @name set
	 * @memberof $ObjectPath
	 */
	this.set = function(obj, path, value, doNotReplace){ 
		return objectPath.set(obj, path, value, doNotReplace); 
	};

	/**
	 * @name hainserts
	 * @memberof $ObjectPath
	 */
	this.insert = function(obj, path, value, at){
		return objectPath.insert(obj, path, value, at); 
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
		return objectPath.empty(obj, path);
	};

	/**
	 * @name push
	 * @memberof $ObjectPath
	 * 
	 * example:
	 * 
	 * $ObjectPath.push(obj, 'a.b', 'a', 'b', 'c', 'd');
	 */
	this.push = function(obj, path /*, values */){
		return objectPath.push(obj, path /*, values */); 
	};

	/**
	 * @name coalesce
	 * @memberof $ObjectPath
	 * 
	 * get the first non-undefined value
	 * 
	 * objectPath.coalesce(obj, ['a.z', 'a.d'], 'default');
	 */
	this.coalesce = function(obj, paths, defaultValue){
		return objectPath.coalesce(obj, paths, defaultValue); 
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
	this.get = function(obj, path, defaultValue){
		return objectPath.get(obj, path, defaultValue); 
	};

	/**
	 * @name del
	 * @memberof $ObjectPath
	 */
	this.del = function(obj, path){
		return objectPath.del(obj, path);
	};
});

