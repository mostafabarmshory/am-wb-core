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
 * @ngdoc Directives
 * @name ngSrcError
 * @description Handle ngSrc error
 * 
 * 
 * For example if you are about to set image of a user
 * 
 * @example
 * TO check if the directive works:
 ```html
 <img 
    alt="Test avatar" 
    ng-src="/this/path/dose/not/exist"
    ng-src-error="https://www.gravatar.com/avatar/{{ 'avatar id' | wbsha1}}?d=identicon&size=32">
 ```
 * @example
 * In this example we show an account avatar or a random from avatar generator
 ```html
  <img 
      ng-src="/api/v2/user/accounts/{{account.id}}/avatar"
      ng-src-error="https://www.gravatar.com/avatar/{{account.id}}?">
  ```
 */
.directive('ngSrcError', function () {
    return {
        link : function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.ngSrcError) {
                    attrs.$set('src', attrs.ngSrcError);
                }
            });
        }
    };
});