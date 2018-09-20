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
'use strict';
var testData = {
		'features': [{
			'title': 'Title',
			'text': 'This is a sample link to a site',
			'icon': 'todo',
			'action': {
				'type': 'link',
				'link': 'http://google.com'
			},
			'$$hashKey': 'object:291'
		}, {
			'title': 'Title',
			'text': 'This is a sample link to a site',
			'icon': 'todo',
			'action': {
				'type': 'link',
				'link': 'http://google.com'
			},
			'$$hashKey': 'object:292'
		}],
		'type': 'CommonActionCall',
		'name': 'Action call',
		'style': {
			'borderColor': {
				'bottom': 'none'
			},
			'height': '90vh',
			'minHeight':'300px',
			'maxHeight':'800px',
			'margin': {},
			'padding': {
				'top': '100px'
			},
			'borderRadius': {},
			'borderStyleColorWidth': {},
			'borderStyle': {},
			'borderWidth': {},
			'flexAlignItem': 'wb-flex-item-auto',
			'backgroundColor':'#e1860b',
			'backgroundImage': 'resources/templates/chershoee/bg/bg1.jpg',
			'backgroundSize': 'cover',
			'backgroundRepeat': 'no-repeat',
			'backgroundPosition': 'center'
		},
		'label': 'Viverra Massa Malesuada',
		'description': 'Consectetur in dolor vitae consectetur maecenas id ultrices'
};
describe('Service $wbUtil', function () {
	// instantiate service
	var $wbUtil;


	// load the service's module
	beforeEach(module('am-wb-core'));
	beforeEach(inject(function (_$wbUtil_) {
		$wbUtil = _$wbUtil_;
	}));

	it('should add a clean function', function () {
		expect(angular.isFunction($wbUtil.clean)).toBe(true);
	});

	it('should clean background', function () {
		var clone = {};
		angular.copy(testData, clone);

		clone = $wbUtil.clean(clone);

		expect(angular.isDefined(clone.style.backgroundImage)).toBe(false);
		expect(angular.isDefined(clone.style.background.image)).toBe(true);
		expect(clone.style.background.image).toBe(testData.style.backgroundImage);
	});

	it('should clean border', function () {
		var dataList =  [{
			type: 'Component',
			style: {
				borderColor: {},
				borderRadius: {
					uniform:true,
					all:18
				},
				borderStyleColorWidth: {},
				borderStyle: {},
				borderWidth: {}
			}
		}];
		var expDataList =  [{
			type: 'Component',
			style: {
				border: {
					radius: '18px'
				}
			}
		}];

		for(var i = 0; i < dataList.length; i++){
			var data = dataList[i];
			var clone = $wbUtil.clean(data);

			expect(clone.version).toBe('wb1');

			expect(angular.isDefined(clone.style.borderColor)).toBe(false);
			expect(angular.isDefined(clone.style.borderRadius)).toBe(false);
			expect(angular.isDefined(clone.style.borderStyleColorWidth)).toBe(false);
			expect(angular.isDefined(clone.style.borderStyle)).toBe(false);
			expect(angular.isDefined(clone.style.borderWidth)).toBe(false);

			var expData = expDataList[i];
			expect(angular.isDefined(clone.style.border)).toBe(true);
			expect(clone.style.border.radius).toBe(expData.style.border.radius);
		}
	});
});
