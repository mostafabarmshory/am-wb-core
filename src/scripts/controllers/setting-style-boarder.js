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
 * @name MbSettingStyleBorderCtrl
 * @description Manage Widget img 
 * 
 */
.controller('MbSettingStyleBorderCtrl', function () {
	
	var attrs = [
		// id
		'alg',
		'crossorigin',
		'height',
		'ismap',
		'longdesc',
		'src',
		'srcset',
		'usemap',
		'width',
		];

	/*
	 * Initial the setting editor
	 */
	this.init = function () {
		/*
		 * Load data of the widget
		 */
		var ctrl = this;
		angular.forEach(attrs, function(attr){
			ctrl[attr] = ctrl.getProperty(attr);
		});
	};
	
	
	
//	function () {
//        this.width = {};
//        this.radius = {};
//        
//        this.styles = [{
//            title: 'None',
//            value: 'none'
//        }, {
//            title: 'Solid',
//            value: 'solid'
//        }, {
//            title: 'Dotted',
//            value: 'dotted'
//        }, {
//            title: 'Dashed',
//            value: 'dashed'
//        }, {
//            title: 'Double',
//            value: 'double'
//        }, {
//            title: 'Groove',
//            value: 'groove'
//        }, {
//            title: 'Ridge',
//            value: 'ridge'
//        }, {
//            title: 'Inset',
//            value: 'inset'
//        }, {
//            title: 'Outset',
//            value: 'outset'
//        }];
//        
//        /*
//         * watch 'wbModel' and apply the changes into setting panel
//         */
//        this.init = function () {
//            this.style = this.getStyleBorder('style');
//            this.color = this.getStyleBorder('color');
//            /*
//             * Set width
//             * width is a string such as '10px 25% 2vh 4px'
//             */
//            fillDimFromString(this.width, this.getStyleBorder('width') || 'medium');
//            /*
//             * Set radius
//             * radius is a string such as '10px 25% 2vh 4px'
//             */
//            fillCornerFromString(this.radius, this.getStyleBorder('radius') || '0px');
//        };
//        
//        /*
//         * Settings about border width
//         */
//        this.widthAllChanged = function (val) {
//            //medium is default value of width
//            setAllDim(this.width, val || 'medium');
//            this.widthChanged();
//        };
//        
//        this.widthChanged = function () {
//            this.setStyleBorder('width', createDimeStr(this.width));
//        };
//        
//        /*
//         * Settings about border radius
//         */
//        this.radiusAllChanged = function (val) {
//            //0px is default value of radius
//            setAllCorner(this.radius, val || '0px');
//            this.radiusChanged();
//        };
//        
//        this.radiusChanged = function () {
//            this.setStyleBorder('radius', createCornerStr(this.radius))
//        };
//    }
});
