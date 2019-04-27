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

angular.module('am-wb-core')
/**
 * @ngdoc Services
 * @name $wbWindow
 * @description The main window manager
 * 
 */
.service('$wbWindow', function($window, $document, $rootElement, $injector) {
    'use strict';
    
    
    /********************************************************************
     * Utilitiey
     ********************************************************************/
    var headElement = $rootElement.find('head');
    var bodyElement = $rootElement.find('body');
    var WbDialogWindow;

    
    /*
     * Open a float based on options
     */
    function openFloatPanel(window, options) {
        if(!WbDialogWindow){
            WbDialogWindow = $injector.get('WbDialogWindow');
        }
        
        var window = new WbDialogWindow(window);
        window.setTitle(options.name);
        window.setLanguage(options.language);
        if(options.position){
            window.setPosition(options.position.x, options.position.y);
        }
        window.setCloseOnEscape(options.closeOnEscape);
        window.setVisible(true);
        return window;
    }
    
    /*
     * Convert to window option
     */
    function convertToWindowOption(options) {
        return '';
    }
    
    /*
     * Open window based on options
     */
    function openWindow(window, options) {
        return $window.open(
                options.url, 
                options.name, 
                convertToWindowOption(options), 
                option.replace);
    }

    /********************************************************************
     * 
     ********************************************************************/
    /**
     * Gets parent of the window
     */
    this.getParent = function(){
        return $window.parent;
    }

    /**
     * Sets title of the window
     * 
     * @memberof wbWindow
     * @params title {string} the window title
     */
    this.setTitle = function(title){
        $document.title = title;
    };

    /**
     * Sets title of the window
     * 
     * @memberof $wbWindow
     * @return {string} the window title
     */
    this.getTitle = function(){
        return $document.title;
    };


    /**
     * Sets language of the window
     * 
     */
    this.setLanguage = function(language){
        bodyElement.attr('lang', language);

    };

    /**
     * Gets language of the window
     * 
     */
    this.getLanguage = function(){
        return bodyElement.attr('lang');
    };
    
    
    /**
     * 
     * The open() method opens a new browser window, or a new tab, depending 
     * on your browser settings.
     * 
     * Tip: Use the close() method to close the window.
     * 
     * @memberof $wbWindow
     * @return window object
     */
    this.open = function(url, name, options, replace){
        // check options
        options = options || {
            internal: false
        };
        options.url = url;
        options.name = name;
        options.replace = replace;
        //open
        if(options.internal){
            return openFloatPanel(this, options);
        }
        return openWindow(this, options);
    };
    
    
});
