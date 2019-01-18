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
 * @name MbSettingsCtrl
 * @description Manages settings page
 * 
 * Manages settings pages.
 * 
 */
.controller('AmWbSettingPageCtrl', function ($scope, $element) {


    this.setWidget = function (widget) {
        var oldWidget = this.widget;
        this.widget = widget;
        if (angular.isFunction(this.init)) {
            this.init(this.widget, oldWidget);
        }
    };

    this.getWidget = function () {
        return this.widget;
    };

    this.setElement = function (element) {
        this.element = element;
    };

    this.getElement = function () {
        return this.element;
    };

    this.setScope = function (scope) {
        this.scope = scope;
    };

    this.getScope = function () {
        return this.scope;
    };

    this.isRoot = function () {
        var widget = this.getWidget();
        if (!widget) {
            return false;
        }
        return widget.isRoot();
    };

    this.setStyleBackground = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.background.' + key, value);
    };

    this.getStyleBackground = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.background.' + key);
    };

    this.setStyleSize = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.size.' + key, value);
    };

    this.getStyleSize = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.size.' + key);
    };

    this.setStyleBorder = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.border.' + key, value);
    };

    this.getStyleBorder = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.border.' + key);
    };

    this.setStyleLayout = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.layout.' + key, value);
    };

    this.getStyleLayout = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.layout.' + key);
    };

    this.setStyle = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty('style.' + key, value);
    };

    this.getStyle = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty('style.' + key);
    };

    this.setProperty = function (key, value) {
        if (!this.widget) {
            return;
        }
        this.widget.setModelProperty(key, value);
    };

    this.getProperty = function (key) {
        if (!this.widget) {
            return;
        }
        return this.widget.getModelProperty(key);
    };


    this.setElement($element);
    this.setScope($scope);
});
