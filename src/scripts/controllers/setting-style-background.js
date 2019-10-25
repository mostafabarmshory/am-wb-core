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
 * @name MbSettingStyleBackgroundCtrl
 * @description Manage general settings of a widget
 * 
 *  This controller controls the background attribute. If the user choose an image for 
 * the background then sets a default values to the background property. These values are used to show 
 * the image in a suitable form; and if the user remove the background image then remove those values 
 * from the background.
 * 
 */
.controller('MbSettingStyleBackgroundCtrl', function () {

    this.init = function (newWidget, oldWidget) {
        this.image = this.getStyleBackground('image');
        this.color = this.getStyleBackground('color');
        this.size = this.getStyleBackground('size');
        this.repeat = this.getStyleBackground('repeat');
        this.position = this.getStyleBackground('position');
    };

    this.setBackgroundImage = function (image) {
        this.image = image;
        if (!this.size) {
            this.size = 'cover';
        }
        if (!this.repeat) {
            this.repeat = 'no-repeat';
        }
        if (!this.position) {
            this.position = 'center center';
        }
        this.updateBackground();
    };

    this.updateBackground = function () {
        this.setStyleBackground('image', this.image);
        this.setStyleBackground('color', this.color);
        this.setStyleBackground('size', this.size);
        this.setStyleBackground('repeat', this.image);
        this.setStyleBackground('position', this.position);
    };

});
