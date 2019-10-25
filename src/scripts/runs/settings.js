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
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'a',
        label: 'Link',
        description: 'Manage link in the current widget.',
        icon: 'settings',
        templateUrl: 'views/settings/wb-a.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingACtrl',
        targets: ['a']
    })
    .addPage({
        type: 'img',
        label: 'Image',
        description: 'Manage image widget settings.',
        icon: 'settings',
        templateUrl: 'views/settings/wb-img.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingImgCtrl',
        targets: ['img']
    })
    .addPage({
        type: 'microdata',
        label: 'Widget Microdata',
        templateUrl: 'views/settings/wb-microdata.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingMicrodataCtrl'
    });
        
    
    /************************************************************************
     * Style
     ************************************************************************/
    $settings.addPage({
        type: 'style.animation',
        label: 'Animation',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.background',
        label: 'Background',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.boarder',
        label: 'Boarder',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.general',
        label: 'General',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.layout',
        label: 'Layout',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.media',
        label: 'Medai',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    })
    .addPage({
        type: 'style.size',
        label: 'Size',
        icon: 'opacity',
        templateUrl: 'views/settings/wb-general.html',
        controllerAs: 'ctrl',
        controller: 'MbSettingStyleGeneralCtrl',
    });
});
