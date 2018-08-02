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
 * @memberof am-wb-core
 * @description Open and manage float panels
 * 
 */
.service('$wbFloat', function($q, $widget, $rootScope, $compile, $controller) {

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
			theme : 'primary',
			headerTitle : optionsOrPreset.title || 'my panel #1',
			position : optionsOrPreset.position || 'center-top 0 58',
			contentSize : optionsOrPreset.contentSize || '450 250',
			content : '<div></div>',
			callback : function() {
				this.content.style.padding = '20px';
				var parentElement = angular.element(this.content);

				// 2- create element
				return $widget.getTemplateFor(optionsOrPreset)//
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
});
