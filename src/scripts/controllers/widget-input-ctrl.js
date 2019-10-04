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
 * @name MbWidgetInputCtrl
 * @description Manage an input field
 * 
 * The most used widget to get information from clients is an input. The input
 * are responsible to get most of data types (email, text, number, ex.) from
 * clients.
 * 
 */
.controller('MbWidgetInputCtrl', function () {
    // list of element attributes
    var elementAttributes = [
        'accept',
        'alt', 
        'autocomplete', 
        'autofocus', 
        'checked', 
        'dirname', 
        'disabled', 
        'form',
        'max', 
        'maxlength', 
        'min', 
        'multiple', 
        'name', 
        'pattern', 
        'placeholder', 
        'readonly', 
        'required', 
        'size', 
        'src', 
        'step',
        'inputType',
        'value',
        ];

    this.initWidget = function(){
        var ctrl = this;
        function elementAttribute(key, value){
            ctrl.setElementAttribute(key, value);
            if(key === 'inputType'){
                ctrl.setElementAttribute('type', value);
            }
        }
        function eventHandler(event){
            if(elementAttributes.includes(event.key)){
                var key = event.key;
                var value = ctrl.getProperty(key) || ctrl.getModelProperty(key);
                elementAttribute(key, value);
            }
        }
        // listen on change
        this.on('modelUpdated', eventHandler);
        this.on('runtimeModelUpdated', eventHandler);
        // load initial data
        for(var i =0; i < elementAttributes.length;i++){
            var key = elementAttributes[i];
            elementAttribute(key, ctrl.getModelProperty(key));
        }
    };

    /**
     * Gets value of the input
     */
    this.val = function(){
        var value = arguments[0];
        if(value){
            this.setElementAttribute('value', value);
        }
        var element = this.getElement();
        return element.val.apply(element, arguments);
    };
});
