/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeNotfoundElement
 * @description # mdeNotfoundElement
 */
.directive('wbNotfoundElement', function() {
    return {
	templateUrl : 'views/directives/wb-notfoundelement.html',
	restrict : 'E',
	link : function postLink(/* scope, element, attrs */) {
	    // element.text('this is the mdeNotfoundElement directive');
	}
    };
});
