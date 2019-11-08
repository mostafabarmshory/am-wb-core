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
'use strict';

angular.module('am-wb-core')//

/**
 * @ngdoc Controllers
 * @name WbSettingWidgetMicrodataCtrl
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
.controller('WbSettingWidgetMicrodataCtrl', function () {
	var attrs = [
		'itemscope',
		'itemtype',
		'itemprop',
		'itemid',
		'itemref',
		// extra attributes
		'value',
		'content',
		];

	/*
	 * Initial the setting editor
	 */
	this.init = function () {
		/*
		 * Load data of the widget
		 */
		var ctrl = this;
		angular.forEach(attrs, function(attr){
			ctrl[attr] = ctrl.getProperty(attr);
		});
	};



//	/*
//	* Supported Schema Types:
//	* Article, Book, Image, Person, Product, Service, Text, Thing, WebPage
//	*/
//	this.schemaTypes = [
//	{
//	key: 'Article',
//	value: 'http://schema.org/Article'

//	}, {
//	key: 'Book',
//	value: 'http://schema.org/Book'

//	}, {
//	key: 'Image',
//	value: 'http://schema.org/ImageObject'

//	}, {
//	key: 'Movie',
//	value: 'http://schema.org/Movie'
//	}, {
//	key: 'Person',
//	value: 'http://schema.org/Person'
//	}, {
//	key: 'Product',
//	value: 'http://schema.org/Product'

//	}, {
//	key: 'Service',
//	value: 'http://schema.org/Service'

//	}, {
//	key: 'Text',
//	value: 'http://schema.org/Text'
//	}, {
//	key: 'Thing',
//	value: 'http://schema.org/Thing'
//	}, {
//	key: 'WebPage',
//	value: 'http://schema.org/WebPage'

//	}
//	];

//	this.getParentCategory = function () {
//	var widget = this.getWidget();
//	while (!widget.isRoot() && !widget.getModelProperty('category')) {
//	widget = widget.getParent();
//	}
//	this.parentCategory = widget.getModelProperty('category');
//	};

//	this.setProperties = function () {
//	if (!this.parentCategory) {
//	this.alert = 'No parent type is defined.';
//	} else {
//	this.setType(this.parentCategory);
//	}
//	};

//	this.setType = function (type) {
//	switch (type) {
//	case 'http://schema.org/Article':
//	this.properties =
//	[
//	'articleBody', 'articleSection', 'about', 'author', 'comment',
//	'commentCount', 'contributor', 'creator', 'description', 'editor',
//	'genre', 'headline', 'keywords', 'publisher', 'text', 'translator',
//	'video'
//	];
//	break;

//	case 'http://schema.org/Book':
//	this.properties =
//	[
//	'about', 'author', 'bookFormat', 'comment', 'creator', 'genre',
//	'headline', 'image', 'keywords', 'name', 'publisher', 'text',
//	'translator', 'video'
//	];
//	break;

//	case 'http://schema.org/Image':
//	this.properties =
//	[
//	'about', 'description', 'caption', 'comment', 'thumbnail',
//	'keywords', 'image', 'name', 'url'
//	];
//	break;

//	case 'http://schema.org/Movie':
//	this.properties =
//	[
//	'about', 'actor', 'comment', 'commentCount', 'copyrightYear',
//	'countryOfOrigin', 'creator', 'dateCreated', 'description',
//	'director', 'duration', 'genre', 'headline', 'isBasedOn',
//	'image', 'keywords', 'musicBy', 'name', 'provider', 'productionCompany',
//	'sponsor', 'subtitleLanguage', 'text', 'thumbnailUrl', 'trailer'
//	];
//	break;

//	case 'http://schema.org/Person':
//	this.properties =
//	[
//	'additionalName', 'address', 'birthDate', 'birthPlace',
//	'children', 'deathDate', 'daethPlace', 'email', 'familyName',
//	'gender', 'homeLocation', 'parent', 'telephone', 'description',
//	'image', 'spouse'
//	];
//	break;

//	case 'http://schema.org/Product':
//	this.properties =
//	[
//	'brand', 'category', 'color', 'description', 'height',
//	'isConsumableFor', 'genre', 'headline', 'image', 'name'
//	];
//	break;

//	case 'http://schema.org/Service':
//	this.properties =
//	[
//	'areaServed', 'brand', 'category', 'logo', 'serviceType',
//	'description', 'image', 'name'
//	];
//	break;

//	case 'http://schema.org/Thing':
//	this.properties = ['description', 'image', 'name'];
//	break;

//	case 'http://schema.org/Text':
//	this.properties = ['description', 'image', 'keywords', 'name'];
//	break;

//	case 'http://schema.org/WebPage':
//	this.properties =
//	[
//	'about', 'author', 'comment', 'description', 'image', 'headline',
//	'keywords', 'commentCount', 'mainContentOfPage', 'primaryImageOfPage',
//	'video'
//	];
//	break;
//	}
//	};

});
