///* 
// * The MIT License (MIT)
// * 
// * Copyright (c) 2016 weburger
// * 
// * Permission is hereby granted, free of charge, to any person obtaining a copy
// * of this software and associated documentation files (the "Software"), to deal
// * in the Software without restriction, including without limitation the rights
// * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// * copies of the Software, and to permit persons to whom the Software is
// * furnished to do so, subject to the following conditions:
// * 
// * The above copyright notice and this permission notice shall be included in all
// * copies or substantial portions of the Software.
// * 
// * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// * SOFTWARE.
// */
//'use strict';
//
//angular.module('am-wb-core')
//        /**
//         * @ngdoc Directives
//         * @name wb-shadows
//         * @description Apply shadow into the element
//         */
//        .directive('wbShadows', function () {
//            return {
//                restrict: 'A',
//                link: function (scope, element, attributes) {
//                    return scope.$watch(attributes.wbShadows, function (style) {
//                        var shadowStr = '';
//
//                        if (!style || !angular.isArray(style.shadows) || style.shadows.length === 0) {
//                            shadowStr = 'none';
//                        } else {
//                            angular.forEach(style.shadows, function (shadow, index) {
//                                shadowStr += createShadowStr(shadow);
//                                if(index + 1 < style.shadows.length){
//                                    shadowStr += ', ';
//                                }
//                            });
//                        }
//
//                        function createShadowStr(shadow) {
//
//                            var hShift = shadow.hShift || '0px';
//                            var vShift = shadow.vShift || '0px';
//                            var blur = shadow.blur || '0px';
//                            var spread = shadow.spread || '0px';
//                            var color = shadow.color || 'black';
//                            
//                            var boxShadow = hShift + ' ' + vShift + ' ' + blur + ' ' + spread + ' ' + color;
//                            
//                            if(shadow.inset) {
//                                boxShadow = boxShadow.concat(' ' + 'inset');
//                            }
//                            
//                            return boxShadow;
//                        }
//
//                        element.css('box-shadow', shadowStr);
//
//                    }, true);
//                }
//            };
//        });