'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbSize", function() {
    return {
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
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