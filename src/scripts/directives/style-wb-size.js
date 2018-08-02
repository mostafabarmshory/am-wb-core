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
 * @description Apply margin into the element
 */
.directive("wbSize", function($rootElement, $document) {

	function postLink($scope, $element, $attrs, $ctrls){
		var button;
		var dimension = {};
		var position = {};

		// main ctrl
		var ctrl = $ctrls[0] || $ctrls[1];
		// Watch size
		$scope.$watch($attrs.wbSize+'.size', function(size) {
			if(!size || ctrl.isSelected()){
				return;
			}
			$element.css(size);
		}, true);


		function mousemove($event) {
			var deltaWidth = dimension.width - (position.x - $event.clientX);
			var deltaHeight = dimension.height - (position.y - $event.clientY);
			var newDimensions = {
					width:  deltaWidth + 'px',
					height: deltaHeight + 'px'
			};
			
			$element.css(newDimensions);
			if($scope.wbModel){
				$scope.wbModel.style.size.width = newDimensions.width;
				$scope.wbModel.style.size.height = newDimensions.height;
			}
			bindToElement();
			$scope.$apply();
			return false;
		}

		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
		}

		function mousedown($event) {
			$event.stopImmediatePropagation();
			position.x = $event.clientX;
			position.y = $event.clientY;
			dimension.width = $element.prop('offsetWidth');
			dimension.height = $element.prop('offsetHeight');
			$document.bind('mousemove', mousemove);
			$document.bind('mouseup', mouseup);
			return false;
		};

		function bindToElement(){
			var off = $element.offset();
			var height = $element.innerHeight();
			var width = $element.innerWidth();

			button.css('left', off.left + width - 15 + 'px');
			button.css('top', off.top + height - 16 + 'px');
		}

		function checkButton(){
			if(button) {
				return;
			}
			button = angular.element('<span></span>');
			$rootElement.append(button);
			button.width('15px');
			button.height('15px');
			button.html('<svg version="1.1" viewBox="0 0 15 15" height="15" width="15"><circle cx="12.5" cy="2.5" r="2" fill="#777777"></circle><circle cx="7.5" cy="7.5" r="2" fill="#777777"></circle><circle cx="12.5" cy="7.5" r="2" fill="#424242"></circle><circle cx="2.5" cy="12.5" r="2" fill="#777777"></circle><circle cx="7.5" cy="12.5" r="2" fill="#424242"></circle><circle cx="12.5" cy="12.5" r="2" fill="#212121"></circle></svg>');
			button.css('position', 'absolute');
			button.css('visibility', 'hidden');
			button.css('cursor', 'nwse-resize');

			button.on('mousedown', mousedown);
		}

		if($ctrls[1] && !$ctrls[1].isRoot() || $ctrls[0]) {
			$scope.$watch(function(){
				return ctrl.isSelected();
			}, function(value){
				if(value){
					checkButton();
					bindToElement();
					button.css('visibility', 'visible');
				} else {
					if(button) {
						button.css('visibility', 'hidden');
					}
				}
			});
		}
	}

	return {
		restrict : 'A',
		link : postLink,
		require:['?wbWidget', '?wbGroup']
	};
});