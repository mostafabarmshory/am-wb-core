/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeCopyright
 * @description # mdeCopyright
 */
.directive('wbCopyright', function() {
    return {
	restrict : 'E',
	replace : true,
	templateUrl : 'views/directives/wb-copyright.html',
	scope : {
	    mdeEditable : '=?',
	    mdeModel : '=?',
	    mdeParent : '=?'
	},
	controller : function($scope, $mdDialog, $act) {
	    var scope = $scope;
	    var model = $scope.mdeModel;

	    function removeWidget() {
		if (scope.mdeParent) {
		    scope.mdeParent.removeWidget(model);
		}
	    }

	    function settings() {
		return $mdDialog.show({
		    controller : 'DialogsCtrl',
		    templateUrl : 'views/dialogs/wb-settings.html',
		    parent : angular.element(document.body),
		    clickOutsideToClose : true,
		    fullscreen : true,
		    locals : {
			mdeModel : model,
			style : {
			    pages : [ 'text' ]
			}
		    }
		});
	    }

	    scope.removeWidget = removeWidget;
	    scope.settings = settings;
	}
    };
});
