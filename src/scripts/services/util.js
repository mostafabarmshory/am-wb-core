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

/**
 * Utility class of WB
 */
angular.module('am-wb-core')
.service('$wbUtil', function ($q, $templateRequest, $sce) {
	'use strict';
	var REGEX_BACKGROUND_IMAGE_SPEC = RegExp('(repeating\-)?(linear|radial)\-(gradient)');
	var service = this;

	function cleanMap(oldStyle, newStyle, map) {
		for (var i = 0; i < map.length; i++) {
			if (oldStyle[map[i][0]]) {
				newStyle[map[i][1]] = oldStyle[map[i][0]];
				delete oldStyle[map[i][0]];
			}
		}
	}

	function getTemplateOf(page)
	{
		var template = page.template;
		var templateUrl = page.templateUrl;
		if (angular.isDefined(template)) {
			if (angular.isFunction(template)) {
				template = template(page.params | page);
			}
		} else if (angular.isDefined(templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(page.params);
			}
			if (angular.isDefined(templateUrl)) {
				page.loadedTemplateUrl = $sce.valueOf(templateUrl);
				template = $templateRequest(templateUrl);
			}
		}
		return template;
	}

	/**
	 * Loading template of the page
	 * 
	 * @name getTemplateFor
	 * @memberof $wbUtil
	 * @param page
	 *            {object} properties of a page, widget , ..
	 * @return promise to load template on resolve.
	 */
	function getTemplateFor(page)
	{
		return $q.when(getTemplateOf(page));
	}

	/**
	 * Converts data into a valid CSS attributes
	 */
	function convertToGroupCss(style) {
		var style = style || {};
		var css = convertToWidgetCss(style);

		if(style.visibility === 'hidden'){
			css.display = 'none';
		} else {
			/*
			 * Group
			 * 
			 * check if is group apply flex flow
			 */
			css.display = 'flex';
			var layout = style.layout || {};
			// row
			if (layout.direction === 'row') {
				css['flex-direction'] = layout.direction_reverse ? 'row-reverse' : 'row';
				if(!style.overflow){
					css['overflow-x'] = layout.wrap ? 'visible' : 'auto';
					css['overflow-y'] = 'visible';
				}
			} else {
				css['flex-direction'] = layout.direction_reverse ? 'column-reverse' : 'column';
				if(!style.overflow){
					css['overflow-x'] = 'visible';
					css['overflow-y'] = layout.wrap ? 'visible' : 'auto';
				}
			}


			// wrap
			if (layout.wrap) {
				css['flex-wrap'] = layout.wrap_reverse ? 'wrap-reverse' : 'wrap';
				// wrap align
				var alignContent;
				switch (layout.wrap_align) {
				case 'start':
					alignContent = 'flex-start';
					break;
				case 'end':
					alignContent = 'flex-end';
					break;
				case 'center':
					alignContent = 'center';
					break;
				case 'space-between':
					alignContent = 'space-between';
					break;
				case 'space-around':
					alignContent = 'space-around';
					break;
				case 'stretch':
					alignContent = 'stretch';
					break;
				default:
					alignContent = 'stretch';
				}
				css['align-content'] = alignContent;
			} else {
				css['flex-wrap'] = 'nowrap';
			}


			// justify
			var justify;
			switch (layout.justify) {
			case 'start':
				justify = 'flex-start';
				break;
			case 'end':
				justify = 'flex-end';
				break;
			case 'center':
				justify = 'center';
				break;
			case 'space-between':
				justify = 'space-between';
				break;
			case 'space-around':
				justify = 'space-around';
				break;
			case 'space-evenly':
				justify = 'space-evenly';
				break;
			default:
				justify = 'flex-start';
			}
			css['justify-content'] = justify;

			// align
			var align;
			switch (layout.align) {
			case 'start':
				align = 'flex-start';
				break;
			case 'end':
				align = 'flex-end';
				break;
			case 'center':
				align = 'center';
				break;
			case 'baseline':
				align = 'baseline';
				break;
			case 'stretch':
				align = 'stretch';
				break;
			default:
				align = 'stretch';
			}
			css['align-items'] = align;
		}

		return css;
	}

	/**
	 * Converts data into a valid CSS attributes
	 */
	function convertToWidgetCss(style) {
		var style = style || {};
		var css = {};

		// layout
		if(style.visibility === 'hidden'){
			css.display = 'none';
		} else {
			css.display = '';
		}

		css = _.merge(css, 
				// layout
				convertToWidgetCssLayout(style.layout || {}),
				// size
				convertToWidgetCssSize(style.size || {}),
				// background
				convertToWidgetCssBackground(style.background || {}),
				// border
				convertToWidgetCssBoarder(style.border || {}),
				// shadows
				convertToWidgetCssShadows(style.shadows || {}),
				// transform
				convertToWidgetCssTransfrom(style.transform || {}),
				// Overflow
				convertToWidgetCssOverflow(style.overflow || {}),
				// text
				convertToWidgetCssText(style.text || {}),
				// color, cursor, opacity, direction
				{
			padding: style.padding,
			margin: style.margin,
			direction: style.direction || 'ltr',
			color: style.color || 'initial',
			cursor: style.cursor || 'auto',
			opacity: style.opacity || '1',
				});

		return css;
	}

	function convertToWidgetCssText(textOptions){
		var css =  {
				'text-decoration': textOptions.decoration || 'none',
				'text-shadow': textOptions.shadow || 'none',
				'text-transform': textOptions.transform || 'none',
				'text-overflow': textOptions.overflow || 'clip',
				'text-justify': textOptions.justify || 'auto',
				'text-indent': textOptions.indent || 'indent',
				'text-align-last': textOptions.alignLast || 'auto',
		};
		if(textOptions.align){
			css['text-align'] = textOptions.align || 'indent';
		}
		return css;
	}

	function convertToWidgetCssOverflow(overflowOption) {
		return {
			'overflow-x': overflowOption.x || 'visible',
			'overflow-y': overflowOption.y || 'visible'
		};
	}

	function convertToWidgetCssTransfrom(transformOptions) {
		var transform = '';

		if(transformOptions.x){
			var x = transformOptions.x;
			if(x.rotate){
				transform += ' rotateX('+x.rotate+')';
			}
			if(x.translate){
				transform  += ' translateX('+x.translate+')';
			}
			if(x.scale){
				transform += ' scaleX('+ x.scale+')';
			}
			if(x.skew){
				transform += ' skewX('+ x.skew+')';
			}
		}
		if(transformOptions.y){
			var y = transformOptions.y;
			if(y.rotate){
				transform += ' rotateY('+y.rotate+')';
			}
			if(y.translate){
				transform += ' translateY('+y.translate+')';
			}
			if(y.scale){
				transform += ' scaleY('+y.scale+')';
			}
			if(y.skew){
				transform += ' skewY('+y.skew+')';
			}
		}
		if(transformOptions.z){
			var z = transformOptions.z;
			if(z.rotate){
				transform += ' rotateZ('+z.rotate+')';
			}
			if(z.translate){
				transform += ' translateZ('+z.translate+')';
			}
			if(z.scale){
				transform += ' scaleZ('+z.scale+')';
			}
		}

		if(transformOptions.perspective){
			transform += ' perspective('+transformOptions.perspective+')';
		}

		if(!transform) {
			return {
				transform: 'none'
			};
		}

		return {
			transform: transform,
			'transform-origin': transformOptions.origin || 'center',
			'transform-style': transformOptions.style || 'flat'
		};
	};

	function createShadowStr(shadow) {
		var hShift = shadow.hShift || '0px';
		var vShift = shadow.vShift || '0px';
		var blur = shadow.blur || '0px';
		var spread = shadow.spread || '0px';
		var color = shadow.color || 'black';

		var boxShadow = hShift + ' ' + vShift + ' ' + blur + ' ' + spread + ' ' + color;

		if(shadow.inset) {
			boxShadow = boxShadow.concat(' ' + 'inset');
		}

		return boxShadow;
	}

	function convertToWidgetCssShadows(shadows) {
		var shadowStr = '';

		if (!angular.isArray(shadows) || shadows.length === 0) {
			shadowStr = 'none';
		} else {
			angular.forEach(shadows, function (shadow, index) {
				shadowStr += createShadowStr(shadow);
				if(index + 1 < shadows.length){
					shadowStr += ', ';
				}
			});
		}

		return {
			'box-shadow': shadowStr
		};
	}

	function convertToWidgetCssBoarder(style) {
		var conf = {};
		if (style.style) {
			conf['border-style'] = style.style;
		}
		if (style.width) {
			conf['border-width'] = style.width;
		}
		if (style.color) {
			conf['border-color'] = style.color;
		}
		if (style.radius) {
			conf['border-radius'] = style.radius;
		}

		return conf;
	}

	function convertToWidgetCssBackground(style){
		var cssValue = {};
		if(style.background){
			cssValue.background = style.background;
			return;
		}
		// image
		var image = 'none';
		if(style.image){
			if(REGEX_BACKGROUND_IMAGE_SPEC.test(style.image)){
				image = style.image;
			} else {
				image = 'url(\''+style.image+'\')';
			}
		}

		cssValue['background-image'] = image;
		cssValue['background-color'] = style.color || 'initial';
		cssValue['background-size'] = style.size || 'auto';
		cssValue['background-repeat'] = style.repeat || 'repeat';
		cssValue['background-position'] = style.position || '0px 0px';
		cssValue['background-attachment'] = style.attachment || 'scroll';
		cssValue['background-origin'] = style.origin || 'padding-box';
		cssValue['background-clip'] = style.clip || 'border-box';

		return cssValue;
	}

	/**
	 * Converts data into a layout CSS3
	 */
	function convertToWidgetCssLayout(layout){
		var flexLayout = {};
		/*
		 * Widget
		 */
		flexLayout.order = layout.order >= 0 ? layout.order : 0;
		flexLayout['flex-grow'] = layout.grow >= 0 ? layout.grow : 0;
		flexLayout['flex-shrink'] = layout.shrink >= 0 ? layout.shrink : 1;
		flexLayout['flex-basis'] = layout.basis || 'auto';

		// align-self
		// auto | flex-start | flex-end | center | baseline | stretch;
		var alignSelf;
		switch (layout.align_self) {
		case 'start':
			alignSelf = 'flex-start';
			break;
		case 'end':
			alignSelf = 'flex-end';
			break;
		case 'center':
			alignSelf = 'center';
			break;
		case 'baseline':
			alignSelf = 'baseline';
			break;
		case 'stretch':
			alignSelf = 'stretch';
			break;
		default:
			alignSelf = 'auto';
		}
		flexLayout['align-self'] = alignSelf;

		return flexLayout;
	}

	/*
	 * Convert size object to valid CSS size
	 */
	function convertToWidgetCssSize(size) {
		return {
			'width': size.width || 'auto',
			'min-width': size.minWidth || '0',
			'max-width': size.maxWidth || 'none',

			'height': size.height || 'auto',
			'min-height': size.minHeight || '0',
			'max-height': size.maxHeight || 'none',
		};
	}

	function cleanEvetns(model)
	{
		// event
		if (!model.event) {
			model.event = {};
		}

		// load legecy events
		if(model.event.failure){
			model.event.error = model.event.failure;
			delete model.event.failure;
		}
	}

	function cleanLayout(model)
	{
		if (!model.style.layout) {
			model.style.layout = {};
		}
		if (model.type === 'Group' || model.type === 'Page') {
			// convert
			var newStyle = model.style.layout;
			var oldStyle = model.style;

			if (oldStyle.flexDirection) {
				if (oldStyle.flexDirection === 'wb-flex-row') {
					newStyle.direction = 'row';
				} else {
					newStyle.direction = 'column';
				}
				delete oldStyle.flexDirection;
			}
			if (!newStyle.direction) {
				newStyle.direction = 'column';
			}

			switch (oldStyle.flexAlignItem) {
			case 'wb-flex-align-items-center':
				newStyle.align = 'center';
				break;
			case 'wb-flex-align-items-end':
				newStyle.align = 'end';
				break;
			case 'wb-flex-align-items-start':
				newStyle.align = 'start';
				break;
			case 'wb-flex-align-items-stretch':
				newStyle.align = 'stretch';
				break;
			default:
				newStyle.align = 'stretch';
			}
			delete oldStyle.flexAlignItem;

			switch (oldStyle.justifyContent) {
			case 'wb-flex-justify-content-center':
				newStyle.justify = 'center';
				break;
			case 'wb-flex-justify-content-end':
				newStyle.justify = 'end';
				break;
			case 'wb-flex-justify-content-start':
				newStyle.justify = 'start';
				break;
			case 'wb-flex-justify-content-space-between':
				newStyle.justify = 'space-between';
				break;
			case 'wb-flex-justify-content-space-around':
				newStyle.justify = 'space-around';
				break;
			default:
				newStyle.justify = 'center';
			}
			delete oldStyle.justifyContent;
		}
	}

	function cleanSize(model)
	{
		if (!model.style.size) {
			model.style.size = {};
		}
		var newStyle = model.style.size;
		var oldStyle = model.style;
		var map = [['width', 'width'],
			['height', 'height']];
		cleanMap(oldStyle, newStyle, map);
	}

	function cleanBackground(model)
	{
		if (!model.style.background) {
			model.style.background = {};
		}
		var newStyle = model.style.background;
		var oldStyle = model.style;
		var map = [['backgroundImage', 'image'],
			['backgroundColor', 'color'],
			['backgroundSize', 'size'],
			['backgroundRepeat', 'repeat'],
			['backgroundPosition', 'position']];
		cleanMap(oldStyle, newStyle, map);
	}

	function cleanBorder(model)
	{
		if (!model.style.border) {
			model.style.border = {};
		}
		var oldStyle = model.style;
		var newStyle = model.style.border;

		if (oldStyle.borderRadius) {
			if (oldStyle.borderRadius.uniform) {
				newStyle.radius = oldStyle.borderRadius.all + 'px';
			}
			// TODO: maso, 2018: support other models
		}
		// delete old values
		delete model.style.borderColor;
		delete model.style.borderRadius;
		delete model.style.borderStyleColorWidth;
		delete model.style.borderStyle;
		delete model.style.borderWidth;
	}

	function cleanSpace(model)
	{
		// Margin and padding
		if (model.style.padding && angular.isObject(model.style.padding)) {
			var padding = '';
			if (model.style.padding.isUniform) {
				padding = model.style.padding.uniform;
			} else {
				padding = model.style.padding.top || '0px' + ' ' +
				model.style.padding.right || '0px' + ' ' +
				model.style.padding.bottom || '0px' + ' ' +
				model.style.padding.left || '0px' + ' ';
			}
			model.style.padding = padding;
		}

		if (model.style.margin && angular.isObject(model.style.margin)) {
			var margin = '';
			if (model.style.margin.isUniform) {
				margin = model.style.margin.uniform;
			} else {
				margin = model.style.margin.top || '0px' + ' ' +
				model.style.margin.right || '0px' + ' ' +
				model.style.margin.bottom || '0px' + ' ' +
				model.style.margin.left || '0px' + ' ';
			}
			model.style.margin = margin;
		}

	}

	function cleanAlign(model)
	{
		if (!model.style.align) {
			model.style.align = {};
		}
	}

	function cleanStyle(model)
	{
		if (!model.style) {
			model.style = {};
		}
		cleanLayout(model);
		cleanSize(model);
		cleanBackground(model);
		cleanBorder(model);
		cleanSpace(model);
		cleanAlign(model);
	}


	function cleanType(model){
		if(model.type === 'Link') {
			model.type = 'a';
			model.html = model.title;
			model.href = model.url;
			model.style.text = {
					align: 'center'
			};
			model.style.cursor = 'pointer';

			delete model.title;
			delete model.url;
		}
	}

	function cleanInternal(model)
	{
		cleanEvetns(model);
		cleanStyle(model);
		if (model.type === 'Group' || model.type === 'Page') {
			if (!model.contents) {
				model.contents = [];
			}
			if (model.contents.length) {
				for (var i = 0; i < model.contents.length; i++) {
					cleanInternal(model.contents[i]);
				}
			}
		}
		cleanType(model);
		return model;
	}

	/**
	 * Clean data model
	 * @name clean 
	 * @param {object} model 
	 * @param {type} force
	 */
	function clean(model, force)
	{
		if (!model.type || model.type === 'Page') {
			model.type = 'Group';
		}
		if (model.version === 'wb2' && !force) {
			return model;
		}
		var newModel = cleanInternal(model);
		newModel.version = 'wb2';
		return newModel;
	}

	service.cleanMap = cleanMap;
	service.clean = clean;
	service.cleanInternal = cleanInternal;
	service.cleanStyle = cleanStyle;
	service.cleanAlign = cleanAlign;
	service.cleanSpace = cleanSpace;
	service.cleanBorder = cleanBorder;
	service.cleanBackground = cleanBackground;
	service.cleanSize = cleanSize;
	service.cleanLayout = cleanLayout;
	service.cleanEvetns = cleanEvetns;

	service.getTemplateFor = getTemplateFor;
	service.getTemplateOf = getTemplateOf;
	service.convertToGroupCss = convertToGroupCss;
	service.convertToWidgetCss = convertToWidgetCss;
	service.convertToWidgetCssLayout = convertToWidgetCssLayout;
});
