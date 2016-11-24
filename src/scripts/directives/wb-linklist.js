/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeLinkList
 * @description # mdeLinkList
 */
.directive('wbLinkList', function() {
    return {
	restrict : 'E',
	templateUrl : 'views/directives/wb-linklist.html',
	replase : true,
	scope : {
	    wbEditable : '=?',
	    wbModel : '=?',
	    wbParent : '=?'
	},
	link : function(scope, elem, attrs) {
//	    scope.$watch('wbModel.style.flexAlignItem', function(
//		    newValue, oldValue) {
//		elem.removeClass(oldValue);
//		elem.addClass(newValue);
//	    });
//	    scope.$watch('wbModel.style.flexItemGrow', function(
//		    newValue, oldValue) {
//		elem.css('flex-grow', newValue);
//	    });
	},
	controller : function($scope, $element, $settings) {
	    var scope = $scope;
	    var model = $scope.wbModel;
	    var parentModel = $scope.wbParent;
	    var ctrl = {
		    hoveringDelBtn: false
	    }

	    function removeWidget() {
		if (parentModel) {
		    parentModel.removeWidget(model);
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
	    scope.ctrl = ctrl;
	}
    };
});
