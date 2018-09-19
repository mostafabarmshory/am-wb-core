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
class WbUtil {

	constructor($q, $sce, $templateRequest) {
		this.$q = $q;
		this.$sce = $sce; 
		this.$templateRequest = $templateRequest;
	}
	
	cleanMap(oldStyle, newStyle, map) {
		for (var i = 0; i < map.length; i++) {
			if (oldStyle[map[i][0]]) {
				newStyle[map[i][1]] = oldStyle[map[i][0]];
				delete oldStyle[map[i][0]];
			}
		}
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
	getTemplateFor(page) {
		return this.$q.when(this.getTemplateOf(page));
	}
	
	getTemplateOf(page) {
		var template;
		var templateUrl;
		if (angular.isDefined(template = page.template)) {
			if (angular.isFunction(template)) {
				template = template(page.params);
			}
		} else if (angular.isDefined(templateUrl = page.templateUrl)) {
			if (angular.isFunction(templateUrl)) {
				templateUrl = templateUrl(page.params);
			}
			if (angular.isDefined(templateUrl)) {
				page.loadedTemplateUrl = this.$sce.valueOf(templateUrl);
				template = this.$templateRequest(templateUrl);
			}
		}
		return template;
	}


	cleanEvetns(model) {
		// event
		if (!model.event) {
			model.event = {};
		}
	}


	cleanLayout(model) {
		if (model.type !== 'Group' && model.type !== 'Page') {
			return;
		}
		if (!model.style.layout) {
			model.style.layout = {};
		}
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

	cleanSize(model) {
		if (!model.style.size) {
			model.style.size = {};
		}
		var newStyle = model.style.size;
		var oldStyle = model.style;
		var map = [
			['width', 'width'],
			['height', 'height']
			];
		this.cleanMap(oldStyle, newStyle, map);
	}

	cleanBackground(model) {
		if (!model.style.background) {
			model.style.background = {};
		}
		var newStyle = model.style.background;
		var oldStyle = model.style;
		var map = [
			['backgroundImage', 'image'],
			['backgroundSize', 'size'],
			['backgroundRepeat', 'repeat'],
			['backgroundPosition', 'position']
			];
		this.cleanMap(oldStyle, newStyle, map);
	}


	cleanBorder(model) {
		if (!model.style.border) {
			model.style.border = {};
		}
	}

	cleanSpace(model) {
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

	cleanAlign(model) {
		if (!model.style.align) {
			model.style.align = {};
		}
	}

	cleanStyle(model) {
		if (!model.style) {
			model.style = {};
		}
		this.cleanLayout(model);
		this.cleanSize(model);
		this.cleanBackground(model);
		this.cleanBorder(model);
		this.cleanSpace(model);
		this.cleanAlign(model);
	}

	/**
	 * Clean data model
	 */
	clean(model) {
		this.cleanEvetns(model);
		this.cleanStyle(model);
		if (model.type === 'Group' || model.type === 'Page') {
			if (!model.contents) {
				model.contents = [];
			}
			if (model.contents.length) {
				for (var i = 0; i < model.contents.length; i++) {
					this.clean(model.contents[i]);
				}
			}
		}
		return model;
	}


}

/*
 * Add to angular
 */
WbUtil.$inject=['$q', '$sce', '$templateRequest'];
angular.module('am-wb-core')
	.service('$wbUtil', WbUtil);
