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
		template: function(model){
			var groupType = model.groupType | 'div';
			if(groupType === 'form'){
				return '<form></form>';
			}
			if(groupType === 'section'){
				return '<section></section>';
			}
			return '<div></div>';
		},
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
		/*
		 * @ngInject
		 */
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
	/**
	 * @ngdoc Widgets
	 * @name iframe
	 * @description Add inline frame to show another document within current one.
	 * 
	 */
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
		template: '<iframe>Frame Not Supported?!</iframe>',
		setting: ['iframe'],
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			// NOTE: maso, 2019: the width and height of the iframe is set from 
			// the style section.
			//
			// 'width', 'height'
			var iframeElementAttribute = [
				'name',
				'src', 
				'srcdoc', 
				'sandbox', 
				];

			this.initWidget = function(){
				var ctrl = this;
				function elementAttribute(key, value){
					ctrl.setElementAttribute(key, value);
				}
				function eventHandler(event){
					if(iframeElementAttribute.includes(event.key)){
						var key = event.key;
						var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
						elementAttribute(key, value);
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < iframeElementAttribute.length;i++){
					var key = iframeElementAttribute[i];
					elementAttribute(key, ctrl.getModelProperty(key));
				}
			};
		},
	});

	/**
	 * @ngdoc Widgets
	 * @name input
	 * @description Add input to get user value
	 * 
	 * It is used to create intractive page with users
	 */
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
		template: '<input></input>',
		setting: ['input'],
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			var elementAttributes = [
				'accept',
				'alt', 
				'autocomplete', 
				'autofocus', 
				'checked', 
				'dirname', 
				'disabled', 
				'form',
				'max', 
				'maxlength', 
				'min', 
				'multiple', 
				'name', 
				'pattern', 
				'placeholder', 
				'readonly', 
				'required', 
				'size', 
				'src', 
				'step',
				'inputType',
				'value',
				];

			this.initWidget = function(){
				var ctrl = this;
				function elementAttribute(key, value){
					ctrl.setElementAttribute(key, value);
					if(key === 'inputType'){
						ctrl.setElementAttribute('type', value);
					}
				}
				function eventHandler(event){
					if(elementAttributes.includes(event.key)){
						var key = event.key;
						var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
						elementAttribute(key, value);
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < elementAttributes.length;i++){
					var key = elementAttributes[i];
					elementAttribute(key, ctrl.getModelProperty(key));
				}
			};

			/**
			 * Gets value of the input
			 */
			this.val = function(){
				var value = arguments[0];
				if(value){
					this.setElementAttribute('value', value);
				}
				var element = this.getElement();
				return element.val.apply(element, arguments);
			};
		},
	});

	/**
	 * @ngdoc Widgets
	 * @name textarea
	 * @description Add textarea to get user value
	 * 
	 * It is used to create textarea
	 */
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
		template: '<textarea></textarea>',
		setting: ['textarea'],
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			var elementAttributes = [
				'autofocus',
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
				'value'
				];

			this.initWidget = function(){
				var ctrl = this;
				function elementAttribute(key, value){
					ctrl.setElementAttribute(key, value);
					if(key === 'value'){
						ctrl.val(value);
					}
				}
				function eventHandler(event){
					if(elementAttributes.includes(event.key)){
						var key = event.key;
						var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
						elementAttribute(key, value);
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < elementAttributes.length;i++){
					var key = elementAttributes[i];
					elementAttribute(key, ctrl.getModelProperty(key));
				}
			};

			/**
			 * Gets value of the input
			 */
			this.val = function(){
				var value = arguments[0];
				if(value){
					this.setElementAttribute('value', value);
				}
				var element = this.getElement();
				return element.val.apply(element, arguments);
			};
		},
	});

	/**
	 * @ngdoc Widgets
	 * @name a
	 * @description Add a to get user value
	 * 
	 * It is used to create textarea
	 */
	$widget.newWidget({
		// widget description
		type: 'a',
		title: 'A link',
		description: 'A widget to add external link. It is used as block item.',
		icon: 'wb-widget-a',
		groups: ['basic'],
		model: {
			name: 'Link',
			style: {
				padding: '8px'
			}
		},
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-a',
		// functional properties
		template: '<a></a>',
		setting: ['a'],
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			var elementAttributes = [
				'download',
				'href',
				'hreflang',
				'media',
				'ping',
				'referrerpolicy',
				'rel',
				'target',
				'type',
				'html'
				];

			this.initWidget = function(){
				var ctrl = this;
				function elementAttribute(key, value){
					if(key === 'html'){
						ctrl.getElement().html(value) || '..';
					}
					ctrl.setElementAttribute(key, value);
				}
				function eventHandler(event){
					if(elementAttributes.includes(event.key)){
						var key = event.key;
						var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
						elementAttribute(key, value);
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < elementAttributes.length;i++){
					var key = elementAttributes[i];
					elementAttribute(key, ctrl.getModelProperty(key));
				}
			};

			/**
			 * Gets value of the input
			 */
			this.html = function(){
				var value = arguments[0];
				if(value){
					this.setElementAttribute('html', value);
				}
				var element = this.getElement();
				return element.html.apply(element, arguments);
			};
		},
	});
	
	

	/**
	 * @ngdoc Widgets
	 * @name p
	 * @description Add p to get user value
	 * 
	 * It is used to create p
	 */
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
		// help id
		help: 'http://dpq.co.ir',
		helpId: 'wb-widget-p',
		// functional properties
		template: '<p></p>',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			var elementAttributes = [
				'html'
				];

			this.initWidget = function(){
				var ctrl = this;
				function elementAttribute(key, value){
					if(key === 'html'){
						ctrl.getElement().html(value);
					}
					ctrl.setElementAttribute(key, value);
				}
				function eventHandler(event){
					if(elementAttributes.includes(event.key)){
						var key = event.key;
						var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
						elementAttribute(key, value);
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < elementAttributes.length;i++){
					var key = elementAttributes[i];
					elementAttribute(key, ctrl.getModelProperty(key));
				}
			};

			/**
			 * Gets value of the input
			 */
			this.html = function(){
				var value = arguments[0];
				if(value){
					this.setElementAttribute('html', value);
				}
				var element = this.getElement();
				return element.html.apply(element, arguments);
			};
		},
	});
});
