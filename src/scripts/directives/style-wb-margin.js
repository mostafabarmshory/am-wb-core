'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbMargin", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbMargin, function(style) {
		if(!style){
		    return;
		}
		element.css({
	            'margin-left':style.marginLeft,
	            'margin-right':style.marginRight,
	            'margin-top':style.marginTop,
	            'margin-bottom':style.marginBottom
	            });
	    }, true);
	}
    };
});