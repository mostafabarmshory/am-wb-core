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
 * @ngdoc Processor
 * @name WbProcessorStyle
 * @description Widget processor
 * 
 */
.factory('WbProcessorStyle', function ($wbUtil, WbProcessorAbstract) {
    
    function loadStyle(widget, keys) {
        var element = widget.getElement();
        
        var computedStyle = {};
        var style = widget.getModelProperty('style') || {};
        var runtimeModel = widget.getRuntimeModel() || {};
        if(!keys){
            element.attr('style', '');
            computedStyle = angular.merge({}, style, runtimeModel.style);
        } else {
            _.forEach(keys, function(key){
                computedStyle[key] = runtimeModel.style[key] || style[key] || '';
            });
        }
        element.css(computedStyle);
    }

    function Processor(){
        WbProcessorAbstract.apply(this);
    }
    Processor.prototype = new WbProcessorAbstract();

    Processor.prototype.process = function(widget, event){
        if(event.type === 'modelChanged'){
            loadStyle(widget);
        } else if(event.type === 'modelUpdated'){
            var keys = [];
            var evKeys = event.keys || [event.key];
            for(var i = 0; i < evKeys.length; i++){
                if(evKeys[i].startsWith('style.')){
                    keys.push(evKeys[i].substring(6));
                }
            }
            if(!_.isEmpty(keys)){
                loadStyle(widget, keys);
            }
        }
    };
    return Processor;
});
