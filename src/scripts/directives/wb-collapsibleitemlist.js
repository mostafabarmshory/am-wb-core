/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:MdeCollapsibleItemList
 * @description # MdeCollapsibleItemList
 */

.directive('wbCollapsibleItemList', function() {
    return {
	templateUrl : 'views/directives/wb-collapsibleitemlist.html',
	restrict : 'E',
	replase : true,
	scope : {
	    mdeEditable : '=?',
	    mdeModel : '=?'
	}
    };
});
