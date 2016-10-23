/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')

/**
 * @ngdoc filter
 * @name wbunsafe
 * @function
 * @description # unsafe Filter in the digidociMainApp.
 */
.filter('wbunsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});
