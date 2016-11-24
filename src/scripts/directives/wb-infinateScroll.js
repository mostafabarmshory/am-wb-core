/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc directive
 * @name wbInfinateScroll
 * @description
 * 
 *  # wbInfinateScroll
 */
.directive('wbInfinateScroll', function() {
    return {
	restrict : 'A',
	// require : '^ddScroll',
	scope : {
	    loadPage : '=wbInfinateScroll'
	},
	link : function(scope, elem, attrs) {
	    elem.on('scroll', function(evt) {
		var raw = elem[0];
		if (raw.scrollTop + raw.offsetHeight  + 5 >= raw.scrollHeight) {
		    scope.loadPage();
		}
	    });
	}
    };
});
