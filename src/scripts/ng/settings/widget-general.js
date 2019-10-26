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
 * @name MbSettingACtrl
 * @description Manage Widget A 
 * 
 */
.controller('WbSettingGeneralCtrl', function () {

    var attributes= [
        /*
         * Access
         */
        //Specifies a unique id for an element
        'id',  
        // Specifies a shortcut key to activate/focus an element
        'accesskey', 
        // Specifies extra information about an element
        'title',   
        // Specifies a unique id for an element
        'name',
        //Specifies the tabbing order of an element
        'tabindex',  


        /*
         * View
         */
        //Specifies one or more classnames for an element (refers to a class in a style sheet)
        'class',  
        //Specifies that an element is not yet, or is no longer, relevant
        'hidden',  

        /*
         * Edit
         */
        //Specifies whether the content of an element is editable or not
        'contenteditable', 
        //Specifies whether an element is draggable or not
        'draggable',   
        // Specifies whether the dragged data is copied, moved, or linked, when dropped
        'dropzone',

        /*
         * Local
         */
        //Specifies the text direction for the content in an element
        'dir', 
        //Specifies the language of the element's content
        'lang',
        //Specifies whether the element is to have its spelling and grammar checked or not
        'spellcheck',   
        //Specifies whether the content of an element should be translated or not
        'translate',  
        ];

    /*
     * Initial the setting editor
     */
    this.init = function () {
        this.trackAttributes(attributes);
    };
});
