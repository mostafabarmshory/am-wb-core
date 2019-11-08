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
 * @ngdoc Converter
 * @name WbConverter
 * @description Widget converter
 * 
 * A converter are responsible to encode and decode a widget.
 * 
 */
.factory('WbConverterText', function (WbConverterAbstract) {
    'use strict';

    function Converter(){
        WbConverterAbstract.apply(this, ['text/plain']);
    };
    Converter.prototype = new WbConverterAbstract();

    Converter.prototype.encode = function(){
        var widgets = Array.prototype.slice.call(arguments) || [];
        var data = '';
        while(widgets.length){
            var widget = widgets.pop();
            if(widget.isLeaf()){
                if(widget.html){
                    data += widget.html() + '\n';
                }
            } else {
                widgets.push.apply(widgets, widget.getChildren());
            }
        }
        return data;
    };

    Converter.prototype.decode = function(data){
        var widgets = [];
        data = data.split('\n');
        _.forEach(data, function(item){
            item = _.trim(item);
            if(item.length){ 
                widgets.push({
                    type: 'p',
                    html: item
                });
            }
        });
        return widgets;
    };


    return Converter;
});