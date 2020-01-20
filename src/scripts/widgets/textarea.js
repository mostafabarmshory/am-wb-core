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

angular.module('am-wb-core')//

/**
 * @ngdoc Widgets
 * @name textarea
 * @description Manage a textarea
 * 
 * Textarea is one of input widgets used to get textual information from clients.
 * This controller is about to manage a textarea.
 * 
 */
 .factory('WbWidgetTextarea', function (WbWidgetAbstract) {
     function Widget($element, $parent) {
         WbWidgetAbstract.apply(this, [$element, $parent]);
         this.addElementAttributes('autofocus',
                 'cols',
                 'dirname',
                 'disabled',
                 'form',
                 'maxlength',
                 'name',
                 'placeholder',
                 'readonly',
                 'required',
                 'rows',
                 'wrap',
                 'value');
     }
     Widget.prototype = Object.create(WbWidgetAbstract.prototype);

     /**
      * Gets value of the input
      * 
      * @memberof input
      */
     Widget.prototype.val = function(){
         var value = arguments[0];
         if(value){
             this.setElementAttribute('value', value);
         }
         var element = this.getElement();
         return element.val.apply(element, arguments);
     };

     return Widget;
 });
