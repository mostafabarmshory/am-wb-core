/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeLinkList
 * @description # mdeLinkList
 */
.directive('mdeLinkList', function() {
	return {
		restrict : 'E',
		replace : 'true',
		templateUrl : 'views/directives/mdelinklist.html',
		require : '^mdeModel',
		scope : {
			mdeEditable : '=?',
			mdeModel : '=?'
		},
	};
});
