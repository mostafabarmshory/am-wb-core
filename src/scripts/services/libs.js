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
.service('$wbLibs', function($q) {
	this.libs = {};
	
	this.load = function(path){
		if(this.libs[path]){
			return $q.resolve({
				message: 'isload'
			});
		}
		var defer = $q.defer();
		
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
		};
		script.onerror = function() {
			ctrl.libs[path] = false;
			defer.reject({
				path: path,
				message: 'fail'
			});
		};
		document.getElementsByTagName('head')[0].appendChild(script);
		return defer.promise;
	}
    return this;
});
