'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbSize", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbSize, function(style) {
		if (!style) {
		    return;
		}
		element.css({
		    'background-color' : style.backgroundColor,
		    'color' : style.color,
		});
	    }, true);
	}
    };
});