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
'use strict';

/*
 * NOTE: the widget (or group) controller is replaced with the following one.
 */
// angular.module('am-wb-core')
// /**
// * @ngdoc Factories
// * @name wb-widget
// * @description Generic data type of a widget
// *
// */
// .factory('WbWidget', function () {
// var wbWidget = function (model, ctrl, scope) {
// this.$ctrl = ctrl;
// this.$model = model;
// this.$scope = scope;
// };
//
// wbWidget.prototype.getType = function () {
// return this.$model.type;
// };
//
// wbWidget.prototype.getModel = function () {
// return this.$model;
// };
//
// wbWidget.prototype.getCtrl = function () {
// return this.$ctrl;
// };
//
// wbWidget.prototype.getParent = function () {
// if (this.$ctrl.isRoot()) {
// return null;
// }
// var parentCtrl = this.$ctrl.getParent();
// return new wbWidget(parentCtrl.getModel(), parentCtrl);
// };
//    
// wbWidget.prototype.getScope = function () {
// return this.$scope;
// };
//
// return wbWidget;
// });
