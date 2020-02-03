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


/***********************************************************************
 * Processors
 ***********************************************************************/
angular.module('am-wb-core').run(function($widget, WbProcessorMicrodata, WbProcessorEvent, WbProcessorAttribute) {
	$widget.setProcessor('microdata', new WbProcessorMicrodata());
	$widget.setProcessor('event', new WbProcessorEvent());
	$widget.setProcessor('attribut', new WbProcessorAttribute());
});
/***********************************************************************
 * Providers
 ***********************************************************************/
angular.module('am-wb-core').run(function(
		/* angularjs */ $anchorScroll, $animate, $cacheFactory,
	$document, $exceptionHandler, $filter, $http, $httpParamSerializer,
	$httpParamSerializerJQLike, $interpolate, $interval, $locale, $location,
	$log, $parse, $q, $rootElement, $sce, $templateCache, $templateRequest,
	$timeout, $window,
		/* WB        */ $widget, $wbMedia, $wbStorage, $wbDispatcher) {
	$widget//
		// AngularJS
		.setProvider('$anchorScroll', $anchorScroll)
		.setProvider('$animate', $animate)
		//	.setProvider('$animateCss', $animateCss)
		.setProvider('$cacheFactory', $cacheFactory)
		//	.setProvider('$compile', $window)
		//	.setProvider('$controller', $window)
		.setProvider('$document', $document)
		.setProvider('$exceptionHandler', $exceptionHandler)
		.setProvider('$filter', $filter)
		.setProvider('$http', $http)
		//	.setProvider('$httpBackend', $window)
		.setProvider('$httpParamSerializer', $httpParamSerializer)
		.setProvider('$httpParamSerializerJQLike', $httpParamSerializerJQLike)
		.setProvider('$interpolate', $interpolate)
		.setProvider('$interval', $interval)
		//	.setProvider('$jsonpCallbacks', $window)
		.setProvider('$locale', $locale)
		.setProvider('$location', $location)
		.setProvider('$log', $log)
		.setProvider('$parse', $parse)
		.setProvider('$q', $q)
		.setProvider('$rootElement', $rootElement)
		//	.setProvider('$rootScope', $window)
		.setProvider('$sce', $sce)
		//	.setProvider('$sceDelegate', $window)
		.setProvider('$templateCache', $templateCache)
		.setProvider('$templateRequest', $templateRequest)
		.setProvider('$timeout', $timeout)
		.setProvider('$window', $window)
		//	.setProvider('$xhrFactory', $window)

		// wb-core
		.setProvider('$dispatcher', $wbDispatcher)
		.setProvider('$storage', $wbStorage)
		.setProvider('$media', $wbMedia);
});

/***********************************************************************
 * Widgets
 ***********************************************************************/
angular.module('am-wb-core').run(function($widget) {
	$widget.newWidget({
		type: 'a',
		controller: 'WbWidgetA',
	});
	$widget.newWidget({
		type: 'address',
		controller: 'WbWidgetAddress',
	});
	$widget.newWidget({
		type: 'applet',
		controller: 'WbWidgetApplet',
	});
	$widget.newWidget({
		type: 'area',
		controller: 'WbWidgetArea'
	});
	$widget.newWidget({
		type: 'article',
		controller: 'WbWidgetArticle'
	});
	$widget.newWidget({
		type: 'aside',
		controller: 'WbWidgetAside'
	});
	$widget.newWidget({
		type: 'audio',
		controller: 'WbWidgetAudio',
	});
	$widget.newWidget({
		type: 'blockquote',
		controller: 'WbWidgetBlockquote',
	});
	$widget.newWidget({
		type: 'button',
		controller: 'WbWidgetButton',
	});
	$widget.newWidget({
		type: 'canvas',
		controller: 'WbWidgetCanvas',
	});
	$widget.newWidget({
		type: 'datalist',
		controller: 'WbWidgetDatalist',
	});
	$widget.newWidget({
		type: 'dd',
		controller: 'WbWidgetDd',
	});
	$widget.newWidget({
		type: 'details',
		controller: 'WbWidgetDetails',
	});
	$widget.newWidget({
		type: 'dialog',
		controller: 'WbWidgetDialog',
	});
	$widget.newWidget({
		type: 'div',
		controller: 'WbWidgetDiv',
	});
	$widget.newWidget({
		type: 'dl',
		controller: 'WbWidgetDl',
	});
	$widget.newWidget({
		type: 'dt',
		controller: 'WbWidgetDt',
	});
	$widget.newWidget({
		type: 'embed',
		controller: 'WbWidgetEmbed',
	});
	$widget.newWidget({
		type: 'fieldset',
		controller: 'WbWidgetFieldset',
	});
	$widget.newWidget({
		type: 'figcaption',
		controller: 'WbWidgetFigcaption',
	});
	$widget.newWidget({
		type: 'figure',
		controller: 'WbWidgetFigure',
	});
	$widget.newWidget({
		type: 'footer',
		controller: 'WbWidgetFooter',
	});
	$widget.newWidget({
		type: 'form',
		controller: 'WbWidgetForm',
	});
	$widget.newWidget({
		type: 'frame',
		controller: 'WbWidgetFrame',
	});
	$widget.newWidget({
		type: 'frameset',
		controller: 'WbWidgetFrameset',
	});
	for (var i = 1; i < 7; i++) {
		$widget.newWidget({
			// widget description
			type: 'h' + i,
			controller: 'WbWidgetH',
		});
	}
	$widget.newWidget({
		type: 'header',
		controller: 'WbWidgetHeader',
	});
	$widget.newWidget({
		type: 'hr',
		controller: 'WbWidgetHr',
	});
	$widget.newWidget({
		// widget description
		type: 'i',
		controller: 'WbWidgetI',
	});
	$widget.newWidget({
		// widget description
		type: 'iframe',
		controller: 'WbWidgetIframe',
	});
	$widget.newWidget({
		type: 'img',
		controller: 'WbWidgetImg',
	});
	$widget.newWidget({
		// widget description
		type: 'input',
		controller: 'WbWidgetInput',
	});
	$widget.newWidget({
		type: 'kbd',
		controller: 'WbWidgetKbd',
	});
	$widget.newWidget({
		type: 'label',
		controller: 'WbWidgetLabel',
	});
	$widget.newWidget({
		type: 'legend',
		controller: 'WbWidgetLegend',
	});
	$widget.newWidget({
		type: 'li',
		controller: 'WbWidgetLi',
	});
	$widget.newWidget({
		type: 'link',
		controller: 'WbWidgetLink',
	});
	$widget.newWidget({
		type: 'main',
		controller: 'WbWidgetMain',
	});
	$widget.newWidget({
		type: 'map',
		controller: 'WbWidgetMap',
	});
	$widget.newWidget({
		// widget description
		type: 'meta',
		controller: 'WbWidgetMeta'
	});
	$widget.newWidget({
		type: 'meter',
		controller: 'WbWidgetMeter',
	});
	$widget.newWidget({
		type: 'nav',
		controller: 'WbWidgetNav',
	});
	$widget.newWidget({
		type: 'noscript',
		controller: 'WbWidgetNoscript',
	});
	$widget.newWidget({
		type: 'object',
		controller: 'WbWidgetObject',
	});
	$widget.newWidget({
		type: 'ol',
		controller: 'WbWidgetOl',
	});
	$widget.newWidget({
		type: 'optgroup',
		controller: 'WbWidgetOptgroup',
	});
	$widget.newWidget({
		type: 'option',
		controller: 'WbWidgetOption',
	});
	$widget.newWidget({
		type: 'output',
		controller: 'WbWidgetOutput',
	});
	$widget.newWidget({
		// widget description
		type: 'p',
		controller: 'WbWidgetP',
	});
	$widget.newWidget({
		type: 'param',
		controller: 'WbWidgetParam',
	});
	$widget.newWidget({
		type: 'picture',
		controller: 'WbWidgetPicture',
	});
	$widget.newWidget({
		type: 'pre',
		controller: 'WbWidgetPre',
	});
	$widget.newWidget({
		// widget description
		type: 'progress',
		controller: 'WbWidgetProgress'
	});
	$widget.newWidget({
		type: 'q',
		controller: 'WbWidgetQ',
	});
	$widget.newWidget({
		type: 's',
		controller: 'WbWidgetS',
	});
	$widget.newWidget({
		type: 'samp',
		controller: 'WbWidgetSamp',
	});
	$widget.newWidget({
		type: 'script',
		controller: 'WbWidgetScript',
	});
	$widget.newWidget({
		type: 'section',
		controller: 'WbWidgetSection',
	});
	$widget.newWidget({
		type: 'select',
		controller: 'WbWidgetSelect',
	});
	$widget.newWidget({
		type: 'small',
		controller: 'WbWidgetSmall',
	});
	$widget.newWidget({
		type: 'source',
		controller: 'WbWidgetSource',
	});
	$widget.newWidget({
		type: 'span',
		controller: 'WbWidgetSpan',
	});
	$widget.newWidget({
		type: 'strong',
		controller: 'WbWidgetStrong',
	});
	$widget.newWidget({
		type: 'style',
		controller: 'WbWidgetStyle',
	});
	$widget.newWidget({
		type: 'summary',
		controller: 'WbWidgetSummary',
	});
	$widget.newWidget({
		type: 'svg',
		controller: 'WbWidgetSvg',
	});
	$widget.newWidget({
		type: 'template',
		controller: 'WbWidgetTemplate',
	});
	$widget.newWidget({
		type: 'textarea',
		controller: 'WbWidgetTextarea',
	});
	$widget.newWidget({
		type: 'track',
		controller: 'WbWidgetTrack',
	});
	$widget.newWidget({
		type: 'ul',
		controller: 'WbWidgetUl',
	});
	$widget.newWidget({
		type: 'video',
		controller: 'WbWidgetVideo',
	});


	$widget.newWidget({
		type: 'ObjectCollection',
		template: '<div></div>',
		controller: 'AmWbSeenCollectionWidget'
	});

	$widget.newWidget({
		type: 'import',
		template: '<div></div>',
		controller: 'WbWidgetSeenImport'
	});

	//-----------------------------------------------------------------
	// Table
	//-----------------------------------------------------------------
	$widget.newWidget({
		type: 'table',
		controller: 'WbWidgetGroup',
	});
	$widget.newWidget({
		type: 'thead',
		controller: 'WbWidgetGroup',
	});
	$widget.newWidget({
		type: 'tbody',
		controller: 'WbWidgetGroup',
	});
	$widget.newWidget({
		type: 'tr',
		controller: 'WbWidgetGroup',
	});
	$widget.newWidget({
		type: 'th',
		controller: 'WbWidgetGroup',
	});
	$widget.newWidget({
		type: 'td',
		controller: 'WbWidgetGroup',
	});
});
