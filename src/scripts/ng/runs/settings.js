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
 * Load widgets
 */
.run(function ($settings) {
	/************************************************************************
	 * Model and Widgets
	 ************************************************************************/
	$settings.addPage({
		type: 'general',
		label: 'Model',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-widget-general.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingGeneralCtrl',
	})
	.addPage({
		type: 'a',
		label: 'Link',
		description: 'Manage link in the current widget.',
		icon: 'settings',
		templateUrl: 'views/settings/wb-widget-a.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingACtrl',
		targets: ['a']
	})
	.addPage({
		type: 'img',
		label: 'Image',
		description: 'Manage image widget settings.',
		icon: 'settings',
		templateUrl: 'views/settings/wb-widget-img.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingWidgetImgCtrl',
		targets: ['img']
	})
	.addPage({
		type: 'microdata',
		label: 'Microdata',
		templateUrl: 'views/settings/wb-widget-microdata.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingWidgetMicrodataCtrl'
	})
	.addPage({
		type: 'iframe',
		label: 'Frame',
		templateUrl: 'views/settings/wb-widget-iframe.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingWidgetIFrameCtrl',
		targets: ['iframe']
	});


	/************************************************************************
	 * Style
	 ************************************************************************/
	$settings.addPage({
		type: 'style.animation',
		label: 'Animation',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-animation.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleAnimationCtrl',
	})
	.addPage({
		type: 'style.background',
		label: 'Background',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-background.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleBackgroundCtrl',
	})
	.addPage({
		type: 'style.border',
		label: 'Border',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-border.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleBorderCtrl',
	})
	.addPage({
		type: 'style.general',
		label: 'General',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-general.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleGeneralCtrl',
	})
	.addPage({
		type: 'style.layout',
		label: 'Layout',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-layout.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleLayoutCtrl',
	})
	.addPage({
		type: 'style.media',
		label: 'Medai',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-media.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleMediaCtrl',
	})
	.addPage({
		type: 'style.size',
		label: 'Size',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-size.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleSizeCtrl',
	})
	.addPage({
		type: 'style.text',
		label: 'Text',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-style-text.html',
		controllerAs: 'ctrl',
		controller: 'WbSettingStyleTextCtrl',
	});
});
