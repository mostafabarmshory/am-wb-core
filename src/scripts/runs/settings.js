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

angular.module('ngMaterialWeburger')

/**
 * Load widgets
 */
.run(function($settings) {
    $settings.newPage({
	type: 'general',
	label : 'general',
	templateUrl : 'views/settings/wb-general.html'
    });
    $settings.newPage({
	type: 'background',
	label : 'Background',
	icon : 'image',
	description : 'manage',
	templateUrl : 'views/settings/wb-background.html'
    });
    $settings.newPage({
	type: 'text',
	label : 'Frontend text',
	controller: 'WbTextSettingsCtrl',
	templateUrl : 'views/settings/wb-text.html'
    });
    $settings.newPage({
	type: 'description',
	label : 'Description',
	templateUrl : 'views/settings/wb-description.html'
    });
    $settings.newPage({
	type: 'layout',
	label : 'Layout',
	icon: 'dashboard',
	controller: 'WbLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout.html'
    });
    $settings.newPage({
	type: 'border',
	label : 'Border',
	icon: 'border_all',
	controller: 'WbBorderSettingCtrl',
	templateUrl : 'views/settings/wb-border.html'
    });
    $settings.newPage({
	type: 'pageLayout',
	label : 'Page Layout',
	icon: 'dashboard',
	controller: 'WbPageLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout-page.html'
    });
    $settings.newPage({
	type: 'selfLayout',
	label : 'Self Layout',
	controller: 'WbSelfLayoutWbSettingsCtrl',
	templateUrl : 'views/settings/wb-layout-self.html'
    });
    $settings.newPage({
	type: 'marginPadding',
	label : 'Margin/Padding',
	templateUrl : 'views/settings/wb-margin-padding.html'
    });
    $settings.newPage({
	type: 'minMaxSize',
	label : 'Min/Max',
	templateUrl : 'views/settings/wb-min-max-size.html'
    });
});
