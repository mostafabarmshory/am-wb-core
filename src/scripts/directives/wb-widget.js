'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name donateMainApp.directive:wbHtml
 * @description # wbHtml
 */
.directive('wbWidget', function() {
    return {
	templateUrl : 'views/directives/wb-widget.html',
	restrict : 'E',
	transclude : true,
    };
});
