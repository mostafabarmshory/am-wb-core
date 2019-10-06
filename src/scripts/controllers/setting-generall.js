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
 * @name MbWidgetACtrl
 * @description Manage a widget with html text.
 * 
 * Most of textual widgets (such as h1..h6, p, a, html) just used html
 * text in view. This controller are about to manage html attribute of
 * a widget.
 * 
 */
.controller('MbSettingGeneralCtrl', function () {
	
	var attrs = [
		// id
		'id',
		'name',
		
		'style.direction',
		'style.visibility',
		'style.color',
		'style.cursor',
		'style.opacity',
		// overflow
		'style.overflow.x',
		'style.overflow.y',
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


	// TODO: maso, 2019: move to the view
	this.cursors = [{
		title: 'alias',
		value: 'alias',  
		description: 'The cursor indicates an alias of something is to be created'
	},{
		title: 'All Scroll',
		value: 'all-scroll',
		description: 'The cursor indicates that something can be scrolled in any direction'
	},{
		title: 'Auto',
		value: 'auto  ',
		description: 'Default. The browser sets a cursor'
	},{
		title: 'Cell',
		value: 'cell', 
		description: 'The cursor indicates that a cell (or set of cells) may be selected'
	},{
		title: 'Context Menu',
		value: 'context-menu',
		description: 'The cursor indicates that a context-menu is available'
	},{
		title: 'Columne resize',
		value: 'col-resize',  
		description: 'The cursor indicates that the column can be resized horizontally'
	},{
		title: 'Copy',
		value: 'copy',
		description: 'The cursor indicates something is to be copied'
	},{
		title: 'Crosshair',
		value: 'crosshair',
		description: 'The cursor render as a crosshair'
	},{
		title: 'Default',
		value: 'default',
		description: 'The default cursor'
	},{
		title: 'Edge Resize',
		value: 'e-resize',
		description: 'The cursor indicates that an edge of a box is to be moved right (east)'
	},{
		title: 'Bidirectional Resize',
		value: 'ew-resize',
		description: 'Indicates a bidirectional resize cursor'
	},{
		title: 'Grab',
		value: 'grab',
		description: 'The cursor indicates that something can be grabbed '
	},{
		title: 'Grabbing',
		value: 'grabbing',
		description: 'The cursor indicates that something can be grabbed'
	},{
		title: 'Help',
		value: 'help',
		description: 'The cursor indicates that help is available '
	},{
		title: 'Move',
		value: 'move',
		description: 'The cursor indicates something is to be moved'
	},{
		title: 'North Resize',
		value: 'n-resize',
		description: 'The cursor indicates that an edge of a box is to be moved up (north)'
	},{
		title: 'North/East Resize',
		value: 'ne-resize',
		description: 'The cursor indicates that an edge of a box is to be moved up and right (north/east)'
	},{
		title: 'NS Bidirectional Resize',
		value: 'ns-resize',
		description: 'Indicates a bidirectional resize cursor'
	},{
		title: 'North/West Resize',
		value: 'nw-resize',
		description: 'The cursor indicates that an edge of a box is to be moved up and left (north/west)'
	},{
		title: 'Bidirectional Resize',
		value: 'nwse-resize',
		description: 'Indicates a bidirectional resize cursor'
	},{
		title: 'No Drop',
		value: 'no-drop',
		description: 'The cursor indicates that the dragged item cannot be dropped here '
	},{
		title: 'None',
		value: 'none',
		description: 'No cursor is rendered for the element  '
	},{
		title: 'Not Allowed',
		value: 'not-allowed',
		description: 'The cursor indicates that the requested action will not be executed'
	},{
		title: 'Pointer',
		value: 'pointer',
		description: 'The cursor is a pointer and indicates a link'
	},{
		title: 'Progress',
		value: 'progress',
		description: 'The cursor indicates that the program is busy (in progress)'
	},{
		title: 'Row Resize',
		value: 'row-resize',
		description: 'The cursor indicates that the row can be resized vertically'
	},{
		title: 'South Resize',
		value: 's-resize',
		description: 'The cursor indicates that an edge of a box is to be moved down (south)'
	},{
		title: 'South/East Resize',
		value: 'se-resize',
		description: 'The cursor indicates that an edge of a box is to be moved down and right (south/east)'
	},{
		title: 'South/West Resize',
		value: 'sw-resize',
		description: 'The cursor indicates that an edge of a box is to be moved down and left (south/west)'
	},{
		title: 'Text',
		value: 'text',
		description: 'The cursor indicates text that may be selected'
	},{
		title: 'Vertical text',
		value: 'vertical-text',
		description: 'The cursor indicates vertical-text that may be selected'
	},{
		title: 'West Resize',
		value: 'w-resize',
		description: 'The cursor indicates that an edge of a box is to be moved left (west)'
	},{
		title: 'Wait',
		value: 'wait',
		description: 'The cursor indicates that the program is busy'
	},{
		title: 'Zoom In',
		value: 'zoom-in',
		description: 'The cursor indicates that something can be zoomed in'
	},{
		title: 'Zoom Out',
		value: 'zoom-out',
		description: 'The cursor indicates that something can be zoomed out'
	},{
		title: 'Initial',
		value: 'Sets this property to its default value. Read about initial',
		description: 'Sets this property to its default value. Read about initial'
	},{
		title: 'Inherit',
		value: 'inherit',
		description: 'Inherits this property from its parent element. Read about inherit'
	}];
});
