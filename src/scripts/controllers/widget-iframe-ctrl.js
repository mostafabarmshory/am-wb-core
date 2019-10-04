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
 * @name MbWidgetIframeCtrl
 * @description Manage an iframe
 * 
 * Iframe is a widget to incloud other pages as a part of current page. This widget is
 * used as Iframe manager.
 * 
 */
.controller('MbWidgetIframeCtrl', function () {
    // list of element attributes
    // NOTE: maso, 2019: the width and height of the iframe is set from 
    // the style section.
    //
    // 'width', 'height'
    var iframeElementAttribute = [
        'name',
        'src', 
        'srcdoc', 
        'sandbox', 
        ];

    this.initWidget = function(){
        var ctrl = this;
        function elementAttribute(key, value){
            ctrl.setElementAttribute(key, value);
        }
        function eventHandler(event){
            if(iframeElementAttribute.includes(event.key)){
                var key = event.key;
                var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
                elementAttribute(key, value);
            }
        }
        // listen on change
        this.on('modelUpdated', eventHandler);
        this.on('runtimeModelUpdated', eventHandler);
        // load initial data
        for(var i =0; i < iframeElementAttribute.length;i++){
            var key = iframeElementAttribute[i];
            elementAttribute(key, ctrl.getModelProperty(key));
        }
    };
});
