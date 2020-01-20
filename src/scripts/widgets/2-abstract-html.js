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
 * @name WbWidgetAbstractHtml
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
.factory('WbWidgetAbstractHtml', function (WbWidgetAbstract) {

    /**
     * Creates new instance 
     * 
     * @memberof WbWidgetGroupCtrl
     */
    function Widget($element, $parent){

        // call super constractor
        WbWidgetAbstract.apply(this, [$element, $parent]);
        this.addElementAttributes('html');
        var ctrl = this;

        /*
         * set element attribute
         */
        function eventHandler(event){
            if(event.key === 'html'){
                var value = ctrl.getProperty(event.key) || ctrl.getModelProperty(event.key);
                ctrl.getElement().html(value);
            }
        }

        // listen on change
        this.on('modelUpdated', eventHandler);
        this.on('runtimeModelUpdated', eventHandler);
    }

    // extend functionality
    Widget.prototype = Object.create(WbWidgetAbstract.prototype);

    /**
     * Gets value of the input
     * 
     * @memberof WbWidgetAbstractHtml
     */
    Widget.prototype.html = function(){
        var value = arguments[0];
        if(value){
            this.setElementAttribute('html', value);
        }
        var element = this.getElement();
        return element.html.apply(element, arguments);
    };

    return Widget;
});
