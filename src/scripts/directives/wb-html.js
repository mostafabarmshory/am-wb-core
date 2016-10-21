'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:MdeHtml
 * @description # MdeHtml
 */
.directive(
	'wbHtml',
	function() {
	    return {
		templateUrl : 'views/directives/wb-html.html',
		restrict : 'E',
		replase : true,
		scope : {
		    mdeEditable : '=?',
		    mdeModel : '=?',
		    mdeParent : '=?'
		},
		link : function(scope, elem, attrs) {
		    scope.$watch('mdeModel.style.flexAlignItem', function(
			    newValue, oldValue) {
			elem.removeClass(oldValue);
			elem.addClass(newValue);
		    });
		    scope.$watch('mdeModel.style.flexItemGrow', function(
			    newValue, oldValue) {
			elem.css('flex-grow', newValue);
		    });
		},
		controller : function($scope, $element, $mdDialog) {
		    var scope = $scope;
		    var model = $scope.mdeModel;
		    var parentModel = $scope.mdeParent;

		    function removeWidget() {
			if (scope.mdeParent) {
			    scope.mdeParent.removeWidget(scope.mdeModel);
			}
		    }

		    function settings() {
			return $mdDialog.show({
			    controller : 'SettingDialogsCtrl',
			    templateUrl : 'views/dialogs/wb-settings.html',
			    parent : angular.element(document.body),
			    clickOutsideToClose : true,
			    fullscreen : true,
			    locals : {
				mdeModel : model,
				mdeParent : parentModel,
				style : {
				    pages : [ 'text', 'selfLayout', 'border',
					    'background', 'marginPadding',
					    'minMaxSize' ]
				}
			    }
			});
		    }

		    scope.removeWidget = removeWidget;
		    scope.settings = settings;
		}
	    };
	});
