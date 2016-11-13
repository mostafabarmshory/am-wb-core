'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbPadding", function() {
    return {
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'padding-left':style.paddingLeft,
	            'padding-right':style.paddingRight,
	            'padding-top':style.paddingTop,
	            'padding-bottom':style.paddingBottom,
	            });
	    }, true);
	}
    };
});