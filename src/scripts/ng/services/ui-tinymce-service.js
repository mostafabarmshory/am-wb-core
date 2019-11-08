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
 * A service is used to create unique ID's, this prevents duplicate ID's if there are multiple editors on screen.
 */
.service('uiTinymceService', function() {
    'use strict';
    var UITinymceService = function() {
        var ID_ATTR = 'ui-tinymce';
        // uniqueId keeps track of the latest assigned ID
        var uniqueId = 0;
        // getUniqueId returns a unique ID
        var getUniqueId = function() {
            uniqueId ++;
            return ID_ATTR + '-' + uniqueId;
        };
        // return the function as a public method of the service
        return {
            getUniqueId: getUniqueId
        };
    };
    // return a new instance of the service
    return new UITinymceService();
});