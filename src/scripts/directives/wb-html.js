'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:wbHtml
 * @description # wbHtml
 */
.directive(
	'wbHtml',
	function() {
	    return {
		templateUrl : 'views/directives/wb-html.html',
		restrict : 'E',
		replase : true,
		scope : {
		    wbEditable : '=?',
		    wbModel : '=?',
		    wbParent : '=?'
		},
		link : function(scope, elem, attrs) {
		    scope.$watch('wbModel.style.flexAlignItem', function(
			    newValue, oldValue) {
			elem.removeClass(oldValue);
			elem.addClass(newValue);
		    });
		    scope.$watch('wbModel.style.flexItemGrow', function(
			    newValue, oldValue) {
			elem.css('flex-grow', newValue);
		    });
		},
		controller : function($scope, $element, $settings) {
		    var scope = $scope;
		    var model = $scope.wbModel;
		    var parentModel = $scope.wbParent;

		    function removeWidget() {
			if (scope.wbParent) {
			    scope.wbParent.removeWidget(scope.wbModel);
			}
		    }

		    function settings() {
			return $settings.load({
			    wbModel : model,
			    wbParent : parentModel,
			    style : {
				pages : [ 'text', 'selfLayout', 'border',
					'background', 'marginPadding',
					'minMaxSize' ]
			    }
			});
		    }

		    scope.removeWidget = removeWidget;
		    scope.settings = settings;
		}
	    };
	});
