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
 * @ngdoc module
 * @name ngDonate
 * @description
 * 
 */
angular.module('am-wb-coreTest', [ 'am-wb-core', 'jsonFormatter',])//


.controller('MyTestEditorCtrl', function($scope, $http, $widget, $wbUtil,
		// new model
		WbProcessorLocator, WbProcessorSelect, WbProcessorDnd) {
	'use strict';

	var locatorProcessor;
	var selectProcessor;
	var dndProcessor;

	/*
	 * Set data model
	 */
	this.setDocumentPath = function(path){
		var ctrl = this;
		$http.get(path)
		.then(function(res) {
			ctrl.model = $wbUtil.clean(res.data);
		});
	}

	this.toggleEditable = function(){
		this.editable = !this.editable;
		if(this.editable) {
			this.initEditor();
		}
		this.getRootWidget().setEditable(this.editable);
	};

	this.setRootWidget = function(rootWidget){
		this.rootWidget = rootWidget;
	}

	this.getRootWidget = function(){
		return this.rootWidget;
	}

	this.initEditor = function(){
		if(!locatorProcessor){
			locatorProcessor = new WbProcessorLocator();
			$widget.setProcessor('locator', locatorProcessor);
			locatorProcessor.setEnable(true);
		}
		if(!selectProcessor){
			selectProcessor = new WbProcessorSelect();
			$widget.setProcessor('select', selectProcessor);
			var ctrl = this;
			selectProcessor.on('selectionChange', function(){
				ctrl.selectedWidgets = selectProcessor.getSelectedWidgets();
				$scope.$digest();
			});
		}

		if(!dndProcessor){
			dndProcessor = new WbProcessorDnd();
			$widget.setProcessor('dnd', dndProcessor);
		}
	}

	this.init = function(){
		var ctrl = this;
		// load widgets
		$widget.widgets()
		.then(function(list){
			ctrl.widgets = list.items;
		});

		$scope.actions = [{
			icon: 'delete',
			run: function(){
				var widgets = selectProcessor.getSelectedWidgets();
				for(var i = 0; i < widgets.length; i++){
					widgets[i].delete();
				}
			}
		},{
			icon: 'edit',
			run: function(){
				ctrl.toggleEditable();
			}
		}];


		$scope.$on('$destroy', function(){
			if(locatorProcessor){
				locatorProcessor.setEnable(false);
			}
			if(selectProcessor){
				selectProcessor.setEnable(false);
			}
		});
	};

	this.init();
})



/***********************************************************************
 * Editors
 ***********************************************************************/
.run(function ($widget) {

	/***************************************
	 * Section editor
	 * 
	 *  A section is combination of blocks
	 * widgets such as h, p, and pre. This 
	 * is an editor to edit the section.
	 ***************************************/
	$widget.setEditor('section', {
		type: 'WidgetEditorTinymceSection',
		options:{
			inline: true,
			menubar: false,
			inline_boundaries: false,
			plugins: ['link', 'lists', 'powerpaste', 'autolink', 'code'],
			valid_elements: '*[*]',
			// Toolbar
			toolbar: ['close save code | undo redo | bold italic underline link | fontselect fontsizeselect | forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent'],
			fixed_toolbar_container: '#demo-widget-editor-toolbar',
			toolbar_drawer: 'floating'
		}
	});

	/***************************************
	 * Single line editor
	 * 
	 *  Single line editor is used for nay widget
	 * with html property.
	 ***************************************/
	var lineWidgetsTypes = [
		'h1','h2','h3','h4','h5','h6', 
		'li',
		'button',
		'a',
		'p',
		'figcaption',
		'i', 'em', 
		's', 'samp', 'small', 'span', 'strong', 
		'mark', 'cite', 'dfn'
		];
	_.forEach(lineWidgetsTypes, function(type){
		$widget.setEditor(type, {
			type: 'WidgetEditorTinymceSingleLine',
			options:{
				property: 'html',
				inline: true,
				menubar: false,
				inline_boundaries: false,
				plugins: ['link', 'code'],
				valid_elements: '*[*]',
				// Toolbar
				toolbar: 'close save code| undo redo | bold italic underline link| fontselect fontsizeselect | forecolor backcolor | widgetalignleft widgetaligncenter widgetalignjustify widgetalignright ',
				fixed_toolbar_container: '#demo-widget-editor-toolbar',
			    toolbar_drawer: 'floating'
			}
		});
	});

	/************************************
	 * Code editor
	 * 
	 ************************************/
	$widget.setEditor('pre', {
		type: 'WidgetEditorCode',
		options: {}
	});
});