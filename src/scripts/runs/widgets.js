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
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function(){
			// list of element attributes
			this.iframeElementAttribute = [
				'name', 'src', 'srcdoc', 'sandbox', 
				// FIXME: maso, 2019: use style insted
				'width', 'height'];
			
			this.initWidget = function(){
				var ctrl = this;
				function eventHandler(event){
					if(this.iframeElementAttribute.includes(event.key)){
						this.setElementAttribute(event.key, event.newValue | ctrl.getModelProperty());
					}
				}
				// listen on change
				this.on('modelUpdated', eventHandler);
				this.on('runtimeModelUpdated', eventHandler);
				// load initial data
				for(var i =0; i < this.iframeElementAttribute.length;i++){
					var key = this.iframeElementAttribute[i];
					this.setElementAttribute(key, ctrl.getModelProperty(key));
				}
			};
		},
	});
});
