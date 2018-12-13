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
	.run(function ($settings) {

	    $settings.newPage({
		type: 'general',
		label: 'General',
		icon: 'opacity',
		templateUrl: 'views/settings/wb-color-cursor-opacity.html',

		/*
		 * @ngInject
		 */
		controller: function ($scope) {
		    $scope.cursors = [{
			    title: 'Alias',
			    value: 'alias'
			}, {
			    title: 'All scroll',
			    value: 'all-scroll'
			}, {
			    title: 'Auto',
			    value: 'auto'
			}, {
			    title: 'Cell',
			    value: 'cell'
			}, {
			    title: 'Context menu',
			    value: 'context-menu'
			}, {
			    title: 'Col resize',
			    value: 'col-resize'
			}, {
			    title: 'Copy',
			    value: 'copy'
			}, {
			    title: 'Default',
			    value: 'default'
			}, {
			    title: 'Grab',
			    value: 'grab'
			}, {
			    title: 'Pointer',
			    value: 'pointer'
			}, {
			    title: 'Move',
			    value: 'move'
			}];
		}
	    });

	    $settings.newPage({
		type: 'background',
		label: 'Background',
		icon: 'image',
		description: '',
		templateUrl: 'views/settings/wb-background.html',
		controllerAs: 'ctrl',
		
		/*
		 * @ngInject
		 * @description This controller controls the background attribute. If the user choose an image for 
		 * the background then sets a default values to the background property. These values are used to show 
		 * the image in a suitable form; and if the user remove the background image then remove those values 
		 * from the background.
		 */
		controller: function ($scope) {
		    var background;
		    this.imageChanged = function () {
			background = $scope.wbModel.style.background;
			if (!background.image || background.image.length === 0) {
			    $scope.wbModel.style.background = {
				image: '',
				size: '',
				repeat: '',
				position: ''
			    };
			    
			} else {
			    $scope.wbModel.style.background = {
				image: background.image,
				size: 'cover',
				repeat: 'no-repeat',
				position: 'center center'
			    };
			}
		    };
		}
	    });

	    $settings.newPage({
		type: 'SEO',
		label: 'SEO',
		templateUrl: 'views/settings/wb-seo.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function ($scope) {
		   this.isRoot = function () {
		       return $scope.wbWidget.isRoot();
		   }; 
		}
	    });

	    $settings.newPage({
		type: 'border',
		label: 'Border',
		icon: 'border_all',
		templateUrl: 'views/settings/wb-border.html',
		controllerAs: 'ctrl',
		/*
		 * @ngInject
		 */
		controller: function ($scope) {
		    var scope = $scope;
		    scope.styles = [{
			    title: 'None',
			    value: 'none'
			}, {
			    title: 'Solid',
			    value: 'solid'
			}, {
			    title: 'Dotted',
			    value: 'dotted'
			}, {
			    title: 'Dashed',
			    value: 'dashed'
			}, {
			    title: 'Double',
			    value: 'double'
			}, {
			    title: 'Groove',
			    value: 'groove'
			}, {
			    title: 'Ridge',
			    value: 'ridge'
			}, {
			    title: 'Inset',
			    value: 'inset'
			}, {
			    title: 'Outset',
			    value: 'outset'
			}];

		    /*
		     * watch 'wbModel' and apply the changes into setting panel
		     */
		    var ctrl = this;
		    $scope.$watch('wbModel', function (model) {
			/*
			 * Set style
			 */
			var border = model.style.border || {};
			ctrl.style = border.style;

			/*
			 * Set color
			 */
			ctrl.color = border.color;

			/*
			 * Set width
			 * width is a string such as '10px 25% 2vh 4px'
			 */
			ctrl.width = {};
			var width = fillWidthFromString(ctrl.width, border.width || 'medium');
			if (width) {
			    ctrl.widthAll = width;
			    ctrl.width.top = width;
			    ctrl.width.right = width;
			    ctrl.width.bottom = width;
			    ctrl.width.left = width;
			}

			/*
			 * Set radius
			 * radius is a string such as '10px 25% 2vh 4px'
			 */
			ctrl.radius = {};
			var radius = fillRadiusFromString(ctrl.radius, border.radius || '0px');
			if (radius) {
			    ctrl.radiusAll = radius;
			    ctrl.radius.topLeft = radius;
			    ctrl.radius.topRight = radius;
			    ctrl.radius.bottomLeft = radius;
			    ctrl.radius.bottomRight = radius;
			}
		    });

		    /*
		     * border style
		     */
		    this.styleChanged = function (newStyle) {
			$scope.wbModel.style.border.style = newStyle;
		    };

		    /*
		     * border color
		     */
		    this.colorChanged = function (newColor) {
			$scope.wbModel.style.border.color = newColor;
		    };

		    /*
		     * Settings about border width
		     */
		    this.widthAllChanged = function (val) {
			setAllWidth(this.width, val || 'medium');//medium is default value of width
			$scope.wbModel.style.border.width = createDimWidthStr(this.width);
		    };

		    this.widthChanged = function () {
			$scope.wbModel.style.border.width = createDimWidthStr(this.width);
		    };

		    function setAllWidth(dim, val) {
			if (dim) {
			    dim.top = val;
			    dim.right = val;
			    dim.bottom = val;
			    dim.left = val;
			}
		    }

		    function createDimWidthStr(dim) {
			if (dim) {
			    var output =
				    dim.top + ' ' +
				    dim.right + ' ' +
				    dim.bottom + ' ' +
				    dim.left;
			    return output;
			}
		    }

		    /*
		     * splite 'width' to its components
		     * check different state Based on CSS rules. see for example:
		     * https://www.w3schools.com/CSSref/pr_border-width.asp
		     */
		    function fillWidthFromString(dim, str) {
			var dimAll;
			var dimsArray = str.split(' ');

			// 'medium' is selected
			if (dimsArray.length === 1) {
			    dimAll = str;
			    return dimAll;
			}

			//Items are 4 and equal
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length === 1) {
			    dimAll = dimsArray[0];
			    dim.top = dimAll;
			    dim.right = dimAll;
			    dim.bottom = dimAll;
			    dim.left = dimAll;
			}

			//Items are 4 and different
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length > 1) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.bottom = dimsArray[2];
			    dim.left = dimsArray[3];
			}

			//Items are 3
			else if (dimsArray.length === 3) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.left = dimsArray[1];
			    dim.bottom = dimsArray[2];
			}

			//Items are 2
			else if (dimsArray.length === 2) {
			    dim.top = dimsArray[0];
			    dim.bottom = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.left = dimsArray[1];
			}

			//Items are 1
			else if (dimsArray.length === 1) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[0];
			    dim.bottom = dimsArray[0];
			    dim.left = dimsArray[0];
			}

			//All items are undefined. In this case default value is 'medium'.
			else if (!dimsArray.length) {
			    dimAll = 'medium';
			}
			return dimAll;
		    }

		    /*
		     * Settings about border radius
		     */
		    this.radiusAllChanged = function (val) {
			setAllRadius(this.radius, val || '0px');//0px is default value of radius
			$scope.wbModel.style.border.radius = createDimeRadiusStr(this.radius);
		    };

		    this.radiusChanged = function () {
			$scope.wbModel.style.border.radius = createDimeRadiusStr(this.radius);
		    };

		    function setAllRadius(dim, val) {
			if (dim) {
			    dim.topLeft = val;
			    dim.topRight = val;
			    dim.bottomRight = val;
			    dim.bottomLeft = val;
			}
		    }

		    function createDimeRadiusStr(dim) {
			if (dim) {
			    var output =
				    dim.topLeft + ' ' +
				    dim.topRight + ' ' +
				    dim.bottomRight + ' ' +
				    dim.bottomLeft;
			    return output;
			}
		    }

		    /*
		     * splite 'radius' to its components
		     * check different state Based on CSS rules. see for example:
		     * https://www.w3schools.com/CSSref/css3_pr_border-radius.asp
		     */
		    function fillRadiusFromString(dim, str) {

			var dimAll;
			var dimsArray = str.split(' ');

			// 0px is selected
			if (dimsArray.length === 1) {
			    dimAll = str;
			    return dimAll;
			}

			//Items are 4 and equal
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length === 1) {
			    dimAll = dimsArray[0];
			    dim.topLeft = dimAll;
			    dim.topRight = dimAll;
			    dim.bottomRight = dimAll;
			    dim.bottomLeft = dimAll;
			}

			//Items are 4 and different
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length > 1) {
			    dim.topLeft = dimsArray[0];
			    dim.topRight = dimsArray[1];
			    dim.bottomRight = dimsArray[2];
			    dim.bottomLeft = dimsArray[3];
			}

			//Items are 3
			else if (dimsArray.length === 3) {
			    dim.topLeft = dimsArray[0];
			    dim.topRight = dimsArray[1];
			    dim.bottomLeft = dimsArray[1];
			    dim.bottomRight = dimsArray[2];
			}

			//Items are 2
			else if (dimsArray.length === 2) {
			    dim.topLeft = dimsArray[0];
			    dim.bottomRight = dimsArray[0];
			    dim.topRight = dimsArray[1];
			    dim.bottomLeft = dimsArray[1];
			}

			//Items are 1
			else if (dimsArray.length === 1) {
			    dim.topLeft = dimsArray[0];
			    dim.topRight = dimsArray[0];
			    dim.bottomRight = dimsArray[0];
			    dim.bottomLeft = dimsArray[0];
			}

			//All items are undefined. In this case default value is 'medium'.
			else if (!dimsArray.length) {
			    dimAll = '0px';
			}
			return dimAll;
		    }

		}
	    });

	    /**
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
	    $settings.newPage({
		type: 'layout',
		label: 'Layout',
		icon: 'dashboard',
		description: 'Manages layout of the current item.',
		templateUrl: 'views/settings/wb-layout.html',
		controllerAs: 'ctrl',
		/*
		 * Manages setting page 
		 * 
		 * @ngInject
		 */
		controller: function ($scope) {
		    this.direction_ = [{
			    title: 'column',
			    icon: 'wb-horizontal-boxes',
			    value: 'column'
			}, {
			    title: 'row',
			    icon: 'wb-vertical-boxes',
			    value: 'row'
			}];

		    this.justify_ = {
			'row': [{
				title: 'Start',
				icon: 'sort_start_horiz',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'sort_end_horiz',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'sort_center_horiz',
				value: 'center'
			    }, {
				title: 'Space Around',
				icon: 'sort_space_around_horiz',
				value: 'space-around'
			    }, {
				title: 'Space Between',
				icon: 'sort_space_between_horiz',
				value: 'space-between'
			    }],
			'column': [{
				title: 'Start',
				icon: 'sort_start_vert',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'sort_end_vert',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'sort_center_vert',
				value: 'center'
			    }, {
				title: 'Space Around',
				icon: 'sort_space_around_vert',
				value: 'space-around'
			    }, {
				title: 'Space Between',
				icon: 'sort_space_between_vert',
				value: 'space-between'
			    }]
		    };

		    this.align_ = {
			'column': [{
				title: 'Stretch',
				icon: 'format_align_justify',
				value: 'stretch'
			    }, {
				title: 'Start',
				icon: 'format_align_left',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'format_align_right',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'format_align_center',
				value: 'center'
			    }],
			'row': [{
				title: 'Stretch',
				icon: 'align_justify_vertical',
				value: 'stretch'
			    }, {
				title: 'Start',
				icon: 'align_start_vertical',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'align_end_vertical',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'align_center_vertical',
				value: 'center'
			    }]
		    };
		    /*
		     * watch 'wbModel' and apply the changes in setting panel
		     */
		    var ctrl = this;
		    $scope.$watch('wbModel', function (model) {
			if (model) {
			    var layout = model.style.layout || {};
			    ctrl.direction = layout.direction;
			    ctrl.align = layout.align;
			    ctrl.wrap = layout.wrap;
			    ctrl.justify = layout.justify;
			    ctrl.parentWidget = $scope.wbWidget.getParent();
			    if (ctrl.parentWidget) {
				ctrl.parentDirection = ctrl.parentWidget.getModel().style.layout.direction;
			    }
			    //TODO: maso, 2018: Safe above code for null value
			} 
			//TODO: maso, 2018: handle else sectipn
		    });

		    /*
		     * This part updates the wbModel whenever the layout properties are changed in view
		     */
		    this.directionChanged = function () {
			$scope.wbModel.style.layout.direction = this.direction;
		    };

		    this.wrapChanged = function () {
			$scope.wbModel.style.layout.wrap = this.wrap;
		    };

		    this.alignChanged = function () {
			$scope.wbModel.style.layout.align = this.align;
		    };

		    this.justifyChanged = function () {
			$scope.wbModel.style.layout.justify = this.justify;
		    };
		}
	    });
	    
	     $settings.newPage({
		type: 'layout-self',
		label: 'Self Layout',
		icon: 'dashboard',
		description: 'Manages layout of the current item.',
		templateUrl: 'views/settings/wb-layout-self.html',
		controllerAs: 'ctrl',
		/*
		 * Manages setting page 
		 * 
		 * @ngInject
		 */
		controller: function ($scope) {
		    this.selfAlign_ = {
			'column': [{
				title: 'Stretch',
				icon: 'format_align_justify',
				value: 'stretch'
			    }, {
				title: 'Start',
				icon: 'format_align_left',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'format_align_right',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'format_align_center',
				value: 'center'
			    }],
			'row': [{
				title: 'Stretch',
				icon: 'align_justify_vertical',
				value: 'stretch'
			    }, {
				title: 'Start',
				icon: 'align_start_vertical',
				value: 'start'
			    }, {
				title: 'End',
				icon: 'align_end_vertical',
				value: 'end'
			    }, {
				title: 'Center',
				icon: 'align_center_vertical',
				value: 'center'
			    }]
		    };

		    /*
		     * watch 'wbModel' and apply the changes in setting panel
		     */
		    var ctrl = this;
		    $scope.$watch('wbModel', function (model) {
			if (model) {
			    var layout = model.style.layout || {};
			    ctrl.alignSelf = layout.align_self;
			    ctrl.parentWidget = $scope.wbWidget.getParent();
			    if (ctrl.parentWidget) {
				ctrl.parentDirection = ctrl.parentWidget.getModel().style.layout.direction;
			    }
			    //TODO: maso, 2018: Safe above code for null value
			} 
			//TODO: maso, 2018: handle else sectipn
		    });

		    /*
		     * This part updates the wbModel whenever the layout-self property is changed in view
		     */

		    this.alignSelfChanged = function () {
			$scope.wbModel.style.layout.align_self = this.alignSelf;
		    };
		}
	    });
	    
	    //TODO: Masood, 2018: Move this controller to a separated controller.
	    $settings.newPage({
		type: 'marginPadding',
		label: 'Margin/Padding',
		icon: 'border_clear',
		templateUrl: 'views/settings/wb-margin-padding.html',
		controllerAs: 'ctrl',
		/** 
		 * @ngInject
		 * @ngDoc Controllers
		 * @name marginPaddingCtrl
		 * @description manages settings view of margin and padding
		 * 
		 * Manage view with multiple editor of margin elements.
		 */
		controller: function ($scope) {
		    $scope.margin = {};
		    $scope.padding = {};

		    /**
		     * All settings about margin and padding
		     * 
		     * Note: we normally add JSDoc to the global functions.
		     * 
		     * @memberof marginPaddingCtrl
		     */
		    function updateAllMargin(val) {
			if (!val) {
			    return;
			}
			setAllMargin($scope.margin, val);//default value of margin
			$scope.wbModel.style.margin = createDimeStr($scope.margin);
		    }

		    /**
		     * Sets all paddding to the equal value
		     * 
		     * @memberof marginPaddingCtrl
		     */
		    function updateAllPadding(val) {
			if (!val) {
			    return;
			}
			setAllMargin($scope.padding, val);//default value of padding
			$scope.wbModel.style.padding = createDimeStr($scope.padding);
		    }

		    /*
		     * This is internal function and does not need add jsdoc
		     * 
		     * this function set value to the dimension
		     */
		    function setAllMargin(dim, val) {
			if (dim) {
			    dim.top = val;
			    dim.right = val;
			    dim.bottom = val;
			    dim.left = val;
			}
		    }

		    function updateMargin(newMargin) {
			$scope.wbModel.style.margin = createDimeStr(newMargin);
		    }

		    function updatePadding(newPadding) {
			$scope.wbModel.style.padding = createDimeStr(newPadding);
		    }

		    function createDimeStr(dim) {
			if (dim) {
			    var output =
				    dim.top + ' ' +
				    dim.right + ' ' +
				    dim.bottom + ' ' +
				    dim.left;
			    return output;
			}
		    }
		    function setModel(model) {
			//margin is a string such as '10px 25% 2vh 4px'
			var margin = fillFromString($scope.margin, model.style.margin);
			if (margin) {
			    $scope.marginAll = margin;
			    $scope.margin.top = margin;
			    $scope.margin.right = margin;
			    $scope.margin.bottom = margin;
			    $scope.margin.left = margin;
			}

			var padding = fillFromString($scope.padding, model.style.padding);
			if (padding) {
			    $scope.paddingAll = padding;
			    $scope.padding.top = padding;
			    $scope.padding.right = padding;
			    $scope.padding.bottom = padding;
			    $scope.padding.left = padding;
			}
		    }

		    /*
		     * watch 'wbModel' and apply the changes in setting panel
		     */
		    $scope.$watch('wbModel', setModel);

		    /*
		     * splite margin/padding to its components
		     * check different state Based on CSS rules. see for example:
		     * https://www.w3schools.com/cssref/pr_margin.asp
		     * https://www.w3schools.com/cssref/pr_padding.asp
		     */

		    function fillFromString(dim, str) {
			str = str || '';
			var dimAll;
			var dimsArray = str.split(' ');

			// 0px is selected
			if (dimsArray.length === 1) {
			    dimAll = str;
			    return dimAll;
			}

			//All 4 items is equal
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length === 1) {
			    dimAll = dimsArray[0];
			}

			//Items are 4 and different
			else if (dimsArray.length === 4 && _.uniq(dimsArray).length > 1) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.bottom = dimsArray[2];
			    dim.left = dimsArray[3];
			}

			//Items are 3
			else if (dimsArray.length === 3) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.left = dimsArray[1];
			    dim.bottom = dimsArray[2];
			}

			//Items are 2
			else if (dimsArray.length === 2) {
			    dim.top = dimsArray[0];
			    dim.bottom = dimsArray[0];
			    dim.right = dimsArray[1];
			    dim.left = dimsArray[1];
			}

			//Items are 1
			else if (dimsArray.length === 1) {
			    dim.top = dimsArray[0];
			    dim.right = dimsArray[0];
			    dim.bottom = dimsArray[0];
			    dim.left = dimsArray[0];
			}

			//All items are undefined. In this case default value is 0px.
			else if (!dimsArray.length) {
			    dimAll = '0px';
			}
			return dimAll;
		    }

		    this.updateAllMargin = updateAllMargin;
		    this.updateAllPadding = updateAllPadding;
		    this.updateMargin = updateMargin;
		    this.updatePadding = updatePadding;
		}
	    });

	    $settings.newPage({
		type: 'size',
		label: 'Size',
		icon: 'photo_size_select_large',
		templateUrl: 'views/settings/wb-size.html',
		controllerAs: 'ctrl',

		/*
		 * @ngInject
		 */
		controller: function ($scope) {

		    // Sample of size object in wbModel
		    /*
		     wbModel: {
		     style: {
		     size: {
		     height: "372px"
		     maxHeight: "auto"
		     maxWidth: "auto"
		     minHeight: "auto"
		     minWidth: "auto"
		     width: "311px"
		     };
		     }
		     }
		     */

		    /*
		     * watch 'wbModel' and apply the changes in setting panel
		     */

		    var ctrl = this;
		    $scope.$watch('wbModel', function (model) {
			ctrl.width = model.style.size.width;
			ctrl.height = model.style.size.height;
			ctrl.minWidth = model.style.size.minWidth;
			ctrl.minHeight = model.style.size.minHeight;
			ctrl.maxWidth = model.style.size.maxWidth;
			ctrl.maxHeight = model.style.size.maxHeight;
		    }, true);

		    /*
		     * This part updates the wbModel whenever the size properties are changed in view
		     */
		    this.widthChanged = function () {
			$scope.wbModel.style.size.width = this.width;
		    };

		    this.heightChanged = function () {
//			if (this.height === '-1px') {
//			    $scope.wbModel.style.size.height = '50px';
//			} else if (this.height === '0vh') {
//			    $scope.wbModel.style.size.height = '50vh';
//			} else if (this.height === '0in') {
//			    $scope.wbModel.style.size.height = '50in';
//			} else if (this.height === '0cm') {
//			    $scope.wbModel.style.size.height = '20cm';
//			} else if (this.height === '0%') {
//			    $scope.wbModel.style.size.height = '50%';
//			} else {
			    $scope.wbModel.style.size.height = this.height;
//			}
		    };

		    this.minWidthChanged = function () {
			$scope.wbModel.style.size.minWidth = this.minWidth;
		    };

		    this.minHeightChanged = function () {
			$scope.wbModel.style.size.minHeight = this.minHeight;
		    };

		    this.maxWidthChanged = function () {
			$scope.wbModel.style.size.maxWidth = this.maxWidth;
		    };

		    this.maxHeightChanged = function () {
			$scope.wbModel.style.size.maxHeight = this.maxHeight;
		    };
		}
	    });

	    $settings.newPage({
		type: 'shadow',
		label: 'Shadow',
		icon: 'brightness_low',
		description: 'Show different shadows (zero or more) around the widget',
		templateUrl: 'views/settings/wb-shadow.html',
		/*
		 * @ngInject
		 */
		controller: function ($scope) {


		    this.remove = function (index) {
			$scope.wbModel.style.shadows.splice(index, 1);
		    };

		    this.addShadow = function () {
			if (!$scope.wbModel.style.shadows) {
			    $scope.wbModel.style.shadows = [];
			}
			$scope.wbModel.style.shadows.push({
			    hShift: '0px',
			    vShift: '0px',
			    blur: '0px',
			    spread: '0px',
			    color: 'rgb(0,0,0)'
			});
		    };

		},
		controllerAs: 'ctrl'
	    });
	});
