'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbSize", function() {
    return {
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'min-width':style.minWidth,
	            'min-height':style.minHeight,
	            'max-width':(style.maxWidth==0) ? 'none' : style.maxWidth,
	            'max-height':(style.maxHeight==0)?'none':style.maxHeight,
	            });
	    }, true);
	}
    };
});