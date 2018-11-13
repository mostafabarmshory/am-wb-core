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
 * @ngdoc Directives
 * @name wbWidget
 * @description Widgets container
 * 
 * This is widget containers.
 * 
 * All primary actions of a widget are supported (such as remove and setting).
 */
.directive('wbWidget', function($wbUtil) {
	function postLink($scope, $element, $attrs, $ctrls, $transclude) {
		// Modify angular transclude function
		// see:
		// http://angular-tips.com/blog/2014/03/transclusion-and-scopes/
		// FIXME: maso, 2017: use regular dom insted of ng-transclude
		$transclude($scope, function(clone/*, $scope*/) {
			if(clone){
				$element.append(clone);
			}
		});

		// set wbGroup
		var group = $ctrls[1];
		$scope.group = group;
	}

	/**
	 * @ngdoc Controllers
	 * @name wbWidgetCtrl
	 * @description Controller of a widget
	 * 
	 * 
	 * @ngInject
	 */
	function wbWidgetCtrl($scope/*, $element*/) {
		var callbacks = {};
		var ctrl = this;

		function fire(type){
			if(angular.isDefined(callbacks[type])){
				for(var i = 0; i < callbacks[type].length; i++){
					try{
						callbacks[type][i]();
					} catch (error){
//						console.log(error);
					}
				}
			}
		}

		ctrl.delete = function(){
			fire('delete');
			$scope.group.removeChild($scope.wbModel, ctrl);
			callbacks = {};
		};

		ctrl.clone = function(){
			return $wbUtil.clean(angular.copy($scope.wbModel));
		};

		ctrl.getModel = function(){
			return $scope.wbModel;
		};

		ctrl.getParent = function(){
			return $scope.group;
		};

		ctrl.isEditable = function(){
			return  $scope.group.isEditable();
		};
		
		ctrl.isRoot = function () {
		    return null;
		};

		ctrl.isSelected = function(){
			return $scope.group.isChildSelected(ctrl);
		};

		ctrl.setSelected = function(flag) {
			if(flag) {
				$scope.group.childSelected(this);
			}
		};

		ctrl.getActions = function(){
			return [{
				title: 'Delete',
				icon: 'delete',
				action: ctrl.delete,
				description: 'Delete widget (Delete)'
			},{
				title: 'Clone',
				icon: 'content_copy',
				action: function(){
					var model = $wbUtil.clean(angular.copy($scope.wbModel));
					var index = $scope.group.indexOfChild($scope.wbModel);
					$scope.group.addChild(index, model);
				},
				description: 'Duplicate widget (ctrl+D)'
			}];
		};

		ctrl.on = function(type, callback){
			if(!angular.isArray(callbacks[type])){
				callbacks[type] = [];
			}
			callbacks[type].push(callback);
		};
	}

	return {
		templateUrl : 'views/directives/wb-widget.html',
		restrict : 'E',
		replace : true,
		transclude: true,
		link : postLink,
		controller : wbWidgetCtrl,
		controllerAs: 'ctrl',
		require:['wbWidget', '^^wbGroup', 'ngModel']
	};
});