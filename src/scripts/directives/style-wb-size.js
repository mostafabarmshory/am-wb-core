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
.directive("wbSize", function($q, $wbUtil, $rootElement, $document, $compile, $mdPanel) {

	function postLink($scope, $element, $attrs, $ctrls){
		var button;
		var optionButton;
		var dimension = {};
		var position = {};
		var lock = false;

		// main ctrl
		var ctrl = $ctrls[0];
		function isRoot(){
			return ctrl.isRoot();
		}
		ctrl.on('delete', distroy);

		function distroy(){
			watchSize();
			watchSelection();
			
			if(button){
				button.remove();
			}
			if(optionButton){
				optionButton.remove();
			}
		}
		
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
			bindToElement(getBound());
			$scope.$apply();
			return false;
		}

		function mouseup() {
			$document.unbind('mousemove', mousemove);
			$document.unbind('mouseup', mouseup);
			lock = false;
		}

		function mousedown($event) {
			$event.stopImmediatePropagation();
			position.x = $event.clientX;
			position.y = $event.clientY;
			lock = true;
			dimension.width = $element.prop('offsetWidth');
			dimension.height = $element.prop('offsetHeight');
			$document.bind('mousemove', mousemove);
			$document.bind('mouseup', mouseup);
			return false;
		};

		function getBound(){
			var off = $element.offset();
			var height = $element.innerHeight();
			var width = $element.innerWidth();
			return {
				left: off.left,
				top: off.top,
				width: $element.innerWidth(),
				height: $element.innerHeight()
			}
		}

		function bindToElement(bound){
			button.css('left', bound.left + bound.width - 15 + 'px');
			button.css('top', bound.top + bound.height - 16 + 'px');

			optionButton.css('left', bound.left + 'px');
			optionButton.css('top', bound.top + 'px');
		}

		function checkButton(){
			if(button) {
				return $q.resolve();
			}
			button = angular.element('<span></span>');
			$rootElement.append(button);
			button.css({
				width: '15px',
				height: '15px',
				position: 'absolute',
				visibility: 'hidden',
				cursor: 'nwse-resize'
			});
			button.html('<svg version="1.1" viewBox="0 0 15 15" height="15" width="15"><circle cx="12.5" cy="2.5" r="2" fill="#777777"></circle><circle cx="7.5" cy="7.5" r="2" fill="#777777"></circle><circle cx="12.5" cy="7.5" r="2" fill="#424242"></circle><circle cx="2.5" cy="12.5" r="2" fill="#777777"></circle><circle cx="7.5" cy="12.5" r="2" fill="#424242"></circle><circle cx="12.5" cy="12.5" r="2" fill="#212121"></circle></svg>');
			button.on('mousedown', mousedown);

			var oj = $wbUtil.getTemplateFor({
				templateUrl: 'views/partials/wb-widget-options.html'
			}).then(function(template){
				optionButton = angular.element(template);
				$rootElement.append(optionButton);
				optionButton.css({
					position: 'absolute',
					visibility: 'hidden',
				});
				$compile(optionButton)($scope);
				bindToElement(getBound());
			});

			return $q.all([oj]).then(function(){
				$scope.$watch(getBound, function (bound) {
					if(!bound) {
						return;
					}
					bindToElement(getBound());
				}, true);

			});
		}


		// Watch size
		var watchSize = $scope.$watch($attrs.wbSize+'.size', function(size) {
			if(isRoot() || !size || lock){
				return;
			}
//			$element.css({
//				'width': size.width || 'auto',
//				'hieght': size.hieght || 'auto',
//				'hieght': size.hieght || 'auto',
//			})
			$element.css(size);
			if(optionButton){
				bindToElement(getBound());
			}
		}, true);

		var watchSelection = $scope.$watch(function(){
			return ctrl.isSelected();
		}, function(value){
			if(value){
				checkButton()
				.then(function(){
					if(!isRoot()){
						button.css('visibility', 'visible');
					}
					optionButton.css('visibility', 'visible');
				});
			} else {
				if(optionButton) {
					button.css('visibility', 'hidden');
					optionButton.css('visibility', 'hidden');
				}
			}
		});
	}

	return {
		restrict : 'A',
		link : postLink,
		priority: 1,
		require:['^wbGroup']
	};
});