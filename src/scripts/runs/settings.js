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
		type : 'general',
		label : 'general',
		templateUrl : 'views/settings/wb-general.html'
	});
	$settings.newPage({
		type : 'background',
		label : 'Background',
		icon : 'image',
		description : '',
		templateUrl : 'views/settings/wb-background.html'
	});
	$settings.newPage({
		type : 'text',
		label : 'Text',
		icon: 'text_fields',
		/*
		 * @ngInject
		 */
		controller : function($scope) {
			var scope = $scope;
			scope.tinymceOptions = {
					/*
					 * onChange: function(e) { // put logic here for
					 * keypress and cut/paste changes },
					 */
					/*
					 * selector: 'textarea', inline: false, plugins :
					 * 'advlist autolink link image lists charmap print
					 * preview', skin: 'lightgray', theme : 'modern',
					 * font_formats: 'Arial=arial,helvetica,sans-serif;'
					 */
					selector : 'textarea',
					height : 500,
					theme : 'modern',
					plugins : [
						'advlist autolink lists link image charmap print preview hr anchor pagebreak',
						'searchreplace wordcount visualblocks visualchars code fullscreen',
						'insertdatetime media nonbreaking save table contextmenu directionality',
						'emoticons template paste textcolor colorpicker textpattern imagetools' ],
						toolbar1 : 'fontselect fontsizeselect | insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image',
						toolbar2 : 'print preview media | forecolor backcolor emoticons',
						image_advtab : true,
						templates : [ {
							title : 'Test template 1',
							content : 'Test 1'
						}, {
							title : 'Test template 2',
							content : 'Test 2'
						} ],
						content_css : [
							'//fast.fonts.net/cssapi/e6dc9b99-64fe-4292-ad98-6974f93cd2a2.css',
							'//www.tinymce.com/css/codepen.min.css' ]
			};

		},
		templateUrl : 'views/settings/wb-text.html'
	});
	
	$settings.newPage({
		type : 'description',
		label : 'Description',
		templateUrl : 'views/settings/wb-description.html'
	});

	$settings.newPage({
		type : 'layout',
		label : 'Layout',
		description : 'Manages layout of the current item.',
		icon : 'dashboard',
		templateUrl : 'views/settings/wb-layout.html'
	});
	$settings.newPage({
		type : 'border',
		label : 'Border',
		icon : 'border_all',
		/*
		 * @ngInject
		 */
		controller : function($scope) {
			var scope = $scope;
			scope.styles = [ {
				title : 'No Border',
				value : 'none'
			}, {
				title : 'Solid',
				value : 'solid'
			}, {
				title : 'Dotted',
				value : 'dotted'
			}, {
				title : 'Dashed',
				value : 'dashed'
			}, {
				title : 'Double',
				value : 'double'
			}, {
				title : 'Groove',
				value : 'groove'
			}, {
				title : 'Ridge',
				value : 'ridge'
			}, {
				title : 'Inset',
				value : 'inset'
			}, {
				title : 'Outset',
				value : 'outset'
			} ];
		},
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
	 * <li>direction</li>
	 * <li>align</li>
	 * <li>justify</li>
	 * </ul>
	 * 
	 * @see wb-layout
	 */
	$settings.newPage({
		type : 'pageLayout',
		label : 'Page Layout',
		icon : 'dashboard',
		templateUrl : 'views/settings/wb-layout-page.html',
		controllerAs : 'ctrl',
		/*
		 * Manages setting page @ngInject
		 */
		controller : function($scope) {
			$scope.direction = [ {
				title : 'column',
				icon : 'wb-horizontal-boxes',
				value : 'column'
			}, {
				title : 'row',
				icon : 'wb-vertical-boxes',
				value : 'row'
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
					'column' : [ {
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
					} ],
					'row' : [ {
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
					} ]
			};
		}
	});
//	$settings.newPage({
//		type : 'selfLayout',
//		label : 'Self Layout',
//		controllerAs : 'ctrl',
//		/*
//		 * @ngInject
//		 */
//		controller : function($scope) {
//			$scope.selfAlign = [ {
//				title : 'auto',
//				icon : 'looks_one',
//				value : 'auto'
//			}, {
//				title : 'Start',
//				icon : 'looks_two',
//				value : 'start'
//			}, {
//				title : 'End',
//				icon : 'looks_3',
//				value : 'end'
//			}, {
//				title : 'Center',
//				icon : 'looks_4',
//				value : 'center'
//			}, {
//				title : 'stretch',
//				icon : 'looks_5',
//				value : 'stretch'
//			} ];
//		},
//		templateUrl : 'views/settings/wb-layout-self.html'
//	});
	$settings.newPage({
		type : 'marginPadding',
		label : 'Margin/Padding',
		icon: 'border_clear',
		templateUrl : 'views/settings/wb-margin-padding.html'
	});
	$settings.newPage({
		type : 'size',
		label : 'Size',
		icon: 'photo_size_select_large',
		templateUrl : 'views/settings/wb-size.html'
	});
});
