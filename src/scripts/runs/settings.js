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
    $settings.newPage('general', {
	label : 'general',
	page : 'views/settings/wb-general.html'
    });
    $settings.newPage('background', {
	label : 'background',
	page : 'views/settings/wb-background.html'
    });
    $settings.newPage('text', {
	label : 'Frontend text',
	page : 'views/settings/wb-text.html'
    });
    $settings.newPage('description', {
	label : 'Description',
	page : 'views/settings/wb-description.html'
    });
    $settings.newPage('layout', {
	label : 'Layout',
	page : 'views/settings/wb-layout.html'
    });
    $settings.newPage('border', {
	label : 'Border',
	page : 'views/settings/wb-border.html'
    });
    $settings.newPage('pageLayout', {
	label : 'Page Layout',
	page : 'views/settings/wb-layout-page.html'
    });
    $settings.newPage('selfLayout', {
	label : 'Self Layout',
	page : 'views/settings/wb-layout-self.html'
    });
    $settings.newPage('marginPadding', {
	label : 'Margin/Padding',
	page : 'views/settings/wb-margin-padding.html'
    });
    $settings.newPage('minMaxSize', {
	label : 'Min/Max',
	page : 'views/settings/wb-min-max-size.html'
    });
});
