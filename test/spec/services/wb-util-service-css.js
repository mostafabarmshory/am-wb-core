/* 
 * The MIT License (MIT)
 * 
 * Copyright (c) 2016 weburger
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the 'Software'), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
describe('Service $wbUtil', function () {
	'use strict';
	// instantiate service
	var $wbUtil;


	// load the service's module
	beforeEach(module('am-wb-core'));
	beforeEach(inject(function (_$wbUtil_) {
		$wbUtil = _$wbUtil_;
	}));

	it('should support flex-basis for style.layout', function () {
		var style = {
				layout: {
					basis: '10px',
					grow: 1,
					shrink: 1,
					align_self: 'end'
				}
		};

		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['flex-basis']).toBe(style.layout.basis);
	});


	// -------------------------------
	// width
	// -------------------------------
	it('should support size.width for style', function () {
		var style = {
				size: {
					width: '10px'
				}
		};

		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['width']).toBe(style.size.width);
	});
	it('should support default value of size.width for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['width']).toBe('auto');
	});

	// -------------------------------
	// minWidth
	// -------------------------------
	it('should support size.minWidth for style', function () {
		var style = {
				size: {
					minWidth: '134px'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['min-width']).toBe(style.size.minWidth);
	});
	it('should support default value of size.minWidth for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['min-width']).toBe('0');
	});

	// -------------------------------
	// maxWidth
	// -------------------------------
	it('should support size.maxWidth for style', function () {
		var style = {
				size: {
					maxWidth: '134px'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['max-width']).toBe(style.size.maxWidth);
	});
	it('should support default value of size.maxWidth for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['max-width']).toBe('none');
	});









	// -------------------------------
	// height
	// -------------------------------
	it('should support size.height for style', function () {
		var style = {
				size: {
					height: '10px'
				}
		};

		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['height']).toBe(style.size.height);
	});
	it('should support default value of size.height for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['height']).toBe('auto');
	});

	// -------------------------------
	// minHeight
	// -------------------------------
	it('should support size.minHeight for style', function () {
		var style = {
				size: {
					minHeight: '134px'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['min-height']).toBe(style.size.minHeight);
	});
	it('should support default value of size.minHeight for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['min-height']).toBe('0');
	});

	// -------------------------------
	// maxWidth
	// -------------------------------
	it('should support size.maxHeight for style', function () {
		var style = {
				size: {
					maxHeight: '134px'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['max-height']).toBe(style.size.maxHeight);
	});

	it('should support default value of size.maxHeight for style', function () {
		var style = {};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['max-height']).toBe('none');
	});


	// -------------------------------
	// style.text.xxx
	// -------------------------------
	it('should support style.text.align for style', function () {
		var style = {
				text: {
					align: 'rtl'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-align']).toBe(style.text.align);
	});
	it('should support style.text.alignLast for style', function () {
		var style = {
				text: {
					alignLast: 'rtl'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-align-last']).toBe(style.text.alignLast);
	});
	it('should support style.text.decoration for style', function () {
		var style = {
				text: {
					decoration: 'red'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-decoration']).toBe(style.text.decoration);
	});
	it('should support style.text.indent for style', function () {
		var style = {
				text: {
					indent: 'initial'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-indent']).toBe(style.text.indent);
	});
	it('should support style.text.justify for style', function () {
		var style = {
				text: {
					justify: 'inter-word'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-justify']).toBe(style.text.justify);
	});
	it('should support style.text.overflow for style', function () {
		var style = {
				text: {
					overflow: 'clip'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-overflow']).toBe(style.text.overflow);
	});
	it('should support style.text.shadow for style', function () {
		var style = {
				text: {
					shadow: 'clip'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-shadow']).toBe(style.text.shadow);
	});
	it('should support style.text.transform for style', function () {
		var style = {
				text: {
					transform: 'capitalize'
				}
		};
		var css = $wbUtil.convertToWidgetCss(style);
		expect(css['text-transform']).toBe(style.text.transform);
	});

});
