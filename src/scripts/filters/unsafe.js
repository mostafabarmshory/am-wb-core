/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialExtension')

/**
 * @ngdoc filter
 * @name digidociMainApp.filter:unsafe
 * @function
 * @description # unsafe Filter in the digidociMainApp.
 */
.filter('unsafe', function($sce) {
	return function(val) {
		return $sce.trustAsHtml(val);
	};
});
