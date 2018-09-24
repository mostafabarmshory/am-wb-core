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
 * @name $widget
 * @description Resource managment
 * 
 */
class WbUi {

	constructor($mdDialog, $q, $http)
	{
		this.$mdDialog = $mdDialog;
		this.$q = $q;
		this.$http = $http;
		this.templates = [];
	}


	/**
	 * Opens dialog
	 * @returns
	 */
	openDialog(dialogData){
		return this.$mdDialog.show(dialogData);
	}


	/**
	 * Get list of registered templates
	 * 
	 * @memberof $wbUi
	 */
	templates(){
		return this.$q.when({
			items: this.templates
		});
	}

	getTemplates(){
		return this.templates;
	}

	/**
	 * Adds new template
	 * 
	 * @memberof $wbUi
	 */
	newTemplate(template){
		this.templates.push(template);
		return this;
	}


	/**
	 * Load a template
	 * 
	 * @memberof $wbUi
	 */
	loadTemplate(template){
		// TODO: maso, 2018: check if template is a function
		if(angular.isDefined(template.template)){
			return this.$q.when(JSON.parse(template.template));
		}
		return this.$http.get(template.templateUrl)
		.then(function(res){
			return res.data;
		});
	}
}

/*
 * Add to angularjs
 */
WbUi.$inject=['$mdDialog', '$q', '$http'];
angular.module('am-wb-core')
.service('$wbUi', WbUi);
