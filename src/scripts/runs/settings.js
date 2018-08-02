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

angular.module('am-wb-core')

/**
 * Load widgets
 */
.run(function($settings) {
	$settings.newPage({
		type: 'general',
		label : 'general',
		templateUrl : 'views/settings/wb-general.html'
	});
	$settings.newPage({
		type: 'background',
		label : 'Background',
		icon : 'image',
		description : 'manage',
		templateUrl : 'views/settings/wb-background.html'
	});
	$settings.newPage({
		type: 'text',
		label : 'Frontend text',
		controller: 'WbTextSettingsCtrl',
		templateUrl : 'views/settings/wb-text.html'
	});
	$settings.newPage({
		type: 'description',
		label : 'Description',
		templateUrl : 'views/settings/wb-description.html'
	});

	$settings.newPage({
		type: 'layout',
		label : 'Layout',
		description : 'Manages layout of the current item.',
		icon: 'dashboard',
		templateUrl : 'views/settings/wb-layout.html'
	});
	$settings.newPage({
		type: 'border',
		label : 'Border',
		icon: 'border_all',
		controller: 'WbBorderSettingCtrl',
		templateUrl : 'views/settings/wb-border.html'
	});

	/**
	 * @ngdoc WB-Settings
	 * @name pageLayout
	 * @description Manages element layout
	 * 
	 * Layout part is consists of the following attributes:
	 * 
	 * <ul>
	 * 	<li>direction</li>
	 * 	<li>align</li>
	 * 	<li>justify</li>
	 * </ul>
	 * 
	 * @see wb-layout
	 */
	$settings.newPage({
		type: 'pageLayout',
		label : 'Page Layout',
		icon: 'dashboard',
		templateUrl : 'views/settings/wb-layout-page.html',
		controllerAs: 'ctrl',
		/*
		 * Manages setting page
		 * @ngInject
		 */
		controller: function($scope) {
//			$scope.directions = [ {
//			title : 'row',
//			icon : 'view_column',
//			value : 'row'
//			}, {
//			title : 'column',
//			icon : 'view_agenda',
//			value : 'column'
//			} ];

//			$scope.align = [ {
//			title : 'none',
//			value : 'none'
//			}, {
//			title : 'start',
//			value : 'start'
//			}, {
//			title : 'center',
//			value : 'center'
//			}, {
//			title : 'end',
//			value : 'end'
//			}, {
//			title : 'space-around',
//			value : 'space-around'
//			}, {
//			title : 'space-between',
//			value : 'space-between'
//			} ];

//			$scope.justify = [ {
//			title : 'none',
//			value : 'none'
//			}, {
//			title : 'start',
//			value : 'start'
//			}, {
//			title : 'center',
//			value : 'center'
//			}, {
//			title : 'end',
//			value : 'end'
//			}, {
//			title : 'stretch',
//			value : 'stretch'
//			}, ]


			$scope.direction = [ {
				title : 'row',
				icon : 'wb-vertical-boxes',
				value : 'row'
			}, {
				title : 'column',
				icon : 'wb-horizontal-boxes',
				value : 'column'
			} ];

			$scope.justify = {
					'row' : [ {
						title : 'Start',
						icon : 'sort_start_horiz',
						value : 'start'
					}, {
						title : 'End',
						icon : 'sort_end_horiz',
						value : 'end'
					}, {
						title : 'Center',
						icon : 'sort_center_horiz',
						value : 'center'
					}, {
						title : 'Space Around',
						icon : 'sort_space_around_horiz',
						value : 'space-around'
					}, {
						title : 'Space Between',
						icon : 'sort_space_between_horiz',
						value : 'space-between'
					} ],
					'column' : [ {
						title : 'Start',
						icon : 'sort_start_vert',
						value : 'start'
					}, {
						title : 'End',
						icon : 'sort_end_vert',
						value : 'end'
					}, {
						title : 'Center',
						icon : 'sort_center_vert',
						value : 'center'
					}, {
						title : 'Space Around',
						icon : 'sort_space_around_vert',
						value : 'space-around'
					}, {
						title : 'Space Between',
						icon : 'sort_space_between_vert',
						value : 'space-between'
					} ]
			};

			$scope.align = {
					'column' : [ 
						{
							title : 'Stretch',
							icon : 'format_align_justify',
							value : 'stretch'
						}, {
							title : 'Start',
							icon : 'format_align_left',
							value : 'start'
						}, {
							title : 'End',
							icon : 'format_align_right',
							value : 'end'
						}, {
							title : 'Center',
							icon : 'format_align_center',
							value : 'center'
						} 
						],
						'row': [ 
							{
								title : 'Stretch',
								icon : 'align_justify_vertical',
								value : 'stretch'
							}, {
								title : 'Start',
								icon : 'align_start_vertical',
								value : 'start'
							}, {
								title : 'End',
								icon : 'align_end_vertical',
								value : 'end'
							}, {
								title : 'Center',
								icon : 'align_center_vertical',
								value : 'center'
							} 
							]
			};
		},
	});
	$settings.newPage({
		type: 'selfLayout',
		label : 'Self Layout',
		controller: 'WbSelfLayoutWbSettingsCtrl',
		templateUrl : 'views/settings/wb-layout-self.html'
	});
	$settings.newPage({
		type: 'marginPadding',
		label : 'Margin/Padding',
		templateUrl : 'views/settings/wb-margin-padding.html'
	});
	$settings.newPage({
		type: 'size',
		label : 'Size',
		templateUrl : 'views/settings/wb-size.html'
	});
});
