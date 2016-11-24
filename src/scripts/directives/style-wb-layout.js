'use strict';

angular.module('ngMaterialWeburger')
/**
 * @description Apply margin into the element
 */
.directive("wbLayout", function() {
    return {
	restrict : 'A',
	link : function(scope, element, attributes) {
	    return scope.$watch(attributes.wbLayout, function(newValue, oldValue) {
		if(oldValue){
		    // Remove old class
		    element.removeClass(oldValue.flexDirection);
		    element.removeClass(oldValue.justifyContent);
		    element.removeClass(oldValue.alignItems);
		}
		if(newValue){
		    // Add new class
		    element.addClass(newValue.flexDirection);
		    element.addClass(newValue.justifyContent);
		    element.addClass(newValue.alignItems);
		}
	    }, true);
	}
    };
});