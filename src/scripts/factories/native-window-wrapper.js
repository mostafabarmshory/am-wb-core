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
