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

	/***********Normal********** */
//	_.forEach([
//		'address', 'audio', 'datalist', 'div', 'figure', 'footer', 'form', 'frameset', 'header', 'i',
//		'li', 'main', 'map', 'nav', 'noscript', 'object', 'ol', 'optgroup', 'output', 'picture', 'section',
//		'select', 'span', 'template', 'ul', 'video', 'table', 'thead', 'tbody', 'tr', 'th', 'td',
//		'button', 'figcaption', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'iframe', 'hr', 'img', 'kbd', 'label',
//		'legend', 'link', 'meta', 'meter', 'option', 'p', 'param', 'progress', 'q', 's', 'samp', 'small', 'source', 'summary',
//		'strong', 'svg', 'track', 'textarea', 'a', 'input',
//		'applet', 'area', 'article', 'aside', 'blockquote', 'canvas',
//		'dd', 'details', 'dialog', 'dl', 'dt', 'embed', 'fieldset', 'frame', 'input', 'pre', 'script', 'style'], function(type) {
//			$widget.newWidget({
//				type: type,
//				controller: 'WbWidgetElement',
//			});
//		});

	/***********Specials********** */
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
});
