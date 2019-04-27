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
.factory('WbDialogWindow', function($wbWindow, $document) {
    
    /**
     * @ngdoc Factory
     * @name WbDialogWindow
     * @description WbDialogWindow a dialog manager
     * 
     */
    var wbWindow = function(parent){
        this.parent = parent || $wbWindow;
    };
    
    /**
     * Gets parent of the window
     * 
     * @memberof WbDialogWindow
     */
    wbWindow.prototype.getParent = function(){
        return this.parent;
    }

    /**
     * Sets title of the window
     * 
     * @memberof WbDialogWindow
     * @params title {string} the window title
     */
    wbWindow.prototype.setTitle = function(title){
        this.title = title;
        if(this.isVisible()){
            // TODO: maso, 2019: set title of the current dialog
        }
    };

    /**
     * Sets title of the window
     * 
     * @memberof WbDialogWindow
     * @return {string} the window title
     */
    wbWindow.prototype.getTitle = function(){
        return this.title;
    };


    /**
     * Sets language of the window
     * 
     * @memberof WbDialogWindow
     * @params language {string} the window language
     */
    wbWindow.prototype.setLanguage = function(language){
        this.language = language;
        if(this.isVisible()){
            // TODO: maso, 2019: set title of the current dialog
        }
    };

    /**
     * Sets title of the window
     * 
     * @memberof WbDialogWindow
     * @return {string} the window language
     */
    wbWindow.prototype.getLanguage = function(){
        return this.language;
    };

    
    
    // Utils
    wbWindow.prototype.isVisible = function(){
        return false;
    };

    return wbWindow;
});
