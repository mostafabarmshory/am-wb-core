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

.directive('mdeCollapsibleItemList', function() {
	return {
		templateUrl : 'views/directives/mdecollapsibleitemlist.html',
		restrict : 'E',
		replase : true,
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?'
		}
	};
});
