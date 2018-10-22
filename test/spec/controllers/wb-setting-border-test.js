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

describe('Setting border', function () {
    // instantiate service
    var $settings;
    var $rootScope;
    var $injector;


    // load the service's module
    beforeEach(module('am-wb-core'));
    beforeEach(inject(function (_$settings_, _$rootScope_, _$injector_) {
	$settings = _$settings_;
	$rootScope = _$rootScope_;
	$injector = _$injector_;
    }));
    
    it('should not change original model', function () {
		var page = $settings.getPage('border');
		var scope = $rootScope.$new();
		var ctrl = {};
		
		// TODO: check if the controller is a function
		$injector.invoke(page.controller, ctrl, {
		    '$scope': scope
		});
		
		// Test #1: 
		// scope.wbModel shouldn't have border property
		scope.wbModel = {
		    style:{}
		};
		scope.$digest();
		expect(angular.isDefined(scope.wbModel.style.border)).toBe(false);
		
		/*
		 * Test #2:
		 * When the model is changed to the new one, old model shouldn't have changed.
		 * Also, the new model(based on the new model) should have new properties.
		 */
		var wbModelNew = {
		    style:{
			border: {
			    style: 'solid',
			    color: '#26ea5e',
			    width: '3px',
			    radius: '20px'
			}
		    }
		};
		var wbModel = scope.wbModel;
		scope.wbModel = wbModelNew;
		scope.$digest();
		
		expect(angular.isDefined(wbModel.style.border)).toBe(false);
		expect(angular.isDefined(scope.wbModel.style.border)).toBe(true);
		expect(ctrl.style).toBe('solid');
		expect(ctrl.color).toBe('#26ea5e');
		
		expect(ctrl.widthAll).toBe('3px');
		expect(ctrl.width).toEqual({
		    top: '3px',
		    right: '3px',
		    bottom: '3px',
		    left: '3px'
		});
		expect(ctrl.radiusAll).toBe('20px');
		expect(ctrl.radius).toEqual({
		    topLeft: '20px',
		    topRight: '20px',
		    bottomLeft: '20px',
		    bottomRight: '20px'
		});

		/*
		 * Test #3:
		 * When the model is changed to the new one, old model shouldn't have changed.
		 * Also, the new model(based on the new model) should have new properties.
		 */
		var wbModelNew1 = {
		    style:{
			border: {
			    style: 'solid',
			    color: '#26ea5e',
			    width: '3px 5px',
			    radius: '10px 20px 30px'
			}
		    }
		};
		var wbModel1 = scope.wbModel;
		scope.wbModel = wbModelNew1;
		scope.$digest();
		
		expect(angular.isDefined(scope.wbModel.style.border)).toBe(true);
		expect(ctrl.width).toEqual({
		    top: '3px',
		    bottom: '3px',
		    right: '5px',
		    left: '5px'
		});
		expect(ctrl.radius).toEqual({
		    topLeft: '10px',
		    topRight: '20px',
		    bottomLeft: '20px',
		    bottomRight: '30px'
		});
		
		/*
		 * Test #4:
		 * top-width is changed.
		 * The new wbModel should be same as before, except in top-width
		 */
		ctrl.width.top = '10px';
		ctrl.widthChanged();
		expect(scope.wbModel.style.border.width).toBe('10px 5px 3px 5px');
		
		/*
		 * Test #5:
		 * top-left radius is changed.
		 * The new wbModel should be same as before, except in top-left
		 */
		ctrl.radius.topLeft = '50px';
		ctrl.radiusChanged();
		expect(scope.wbModel.style.border.radius).toBe('50px 20px 30px 20px');
		
	});
});