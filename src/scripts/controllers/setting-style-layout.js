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
 * 
 * @ngdoc Widget Settings
 * @name layout
 * @description Manages element layout
 * 
 * Layout is consists of the following attributes for a group:
 * 
 * <ul>
 *     <li>direction</li>
 *     <li>direction-inverse</li>
 *     <li>wrap</li>
 *     <li>wrap-inverse</li>
 *     <li>align</li>
 *     <li>justify</li>
 * </ul>
 * 
 * and following ones for a widget (or group):
 * 
 * <ul>
 *     <li>grow</li>
 *     <li>shrink</li>
 *     <li>order</li>
 * </ul>
 * 
 * See the layout documents for more details.
 * 
 * @see wb-layout
 */
.controller('AmWbSettingStyleLayoutCtrl', function ($scope, $element) {

//  function () {
//  this.direction_ = [{
//  title: 'column',
//  icon: 'wb-horizontal-boxes',
//  value: 'column'
//  }, {
//  title: 'row',
//  icon: 'wb-vertical-boxes',
//  value: 'row'
//  }];

//  this.justify_ = {
//  'row': [{
//  title: 'Start',
//  icon: 'sort_start_horiz',
//  value: 'start'
//  }, {
//  title: 'End',
//  icon: 'sort_end_horiz',
//  value: 'end'
//  }, {
//  title: 'Center',
//  icon: 'sort_center_horiz',
//  value: 'center'
//  }, {
//  title: 'Space Around',
//  icon: 'sort_space_around_horiz',
//  value: 'space-around'
//  }, {
//  title: 'Space Between',
//  icon: 'sort_space_between_horiz',
//  value: 'space-between'
//  }],
//  'column': [{
//  title: 'Start',
//  icon: 'sort_start_vert',
//  value: 'start'
//  }, {
//  title: 'End',
//  icon: 'sort_end_vert',
//  value: 'end'
//  }, {
//  title: 'Center',
//  icon: 'sort_center_vert',
//  value: 'center'
//  }, {
//  title: 'Space Around',
//  icon: 'sort_space_around_vert',
//  value: 'space-around'
//  }, {
//  title: 'Space Between',
//  icon: 'sort_space_between_vert',
//  value: 'space-between'
//  }]
//  };

//  this.align_ = {
//  'column': [{
//  title: 'Stretch',
//  icon: 'format_align_justify',
//  value: 'stretch'
//  }, {
//  title: 'Start',
//  icon: 'format_align_left',
//  value: 'start'
//  }, {
//  title: 'End',
//  icon: 'format_align_right',
//  value: 'end'
//  }, {
//  title: 'Center',
//  icon: 'format_align_center',
//  value: 'center'
//  }],
//  'row': [{
//  title: 'Stretch',
//  icon: 'align_justify_vertical',
//  value: 'stretch'
//  }, {
//  title: 'Start',
//  icon: 'align_start_vertical',
//  value: 'start'
//  }, {
//  title: 'End',
//  icon: 'align_end_vertical',
//  value: 'end'
//  }, {
//  title: 'Center',
//  icon: 'align_center_vertical',
//  value: 'center'
//  }]
//  };
//  /*
//  * watch 'wbModel' and apply the changes in setting panel
//  */
//  this.init = function () {
//  this.direction = this.getStyleLayout('direction') || 'column';
//  this.align = this.getStyleLayout('align');
//  this.wrap = this.getStyleLayout('wrap');
//  this.justify = this.getStyleLayout('justify');
//  };

//  /*
//  * This part updates the wbModel whenever the layout properties are changed in view
//  */
//  this.directionChanged = function () {
//  this.setStyleLayout('direction', this.direction);
//  };

//  this.wrapChanged = function () {
//  this.setStyleLayout('wrap', this.wrap);
//  };

//  this.alignChanged = function () {
//  this.setStyleLayout('align', this.align);
//  };

//  this.justifyChanged = function () {
//  this.setStyleLayout('justify', this.justify);
//  };
//  }
});
