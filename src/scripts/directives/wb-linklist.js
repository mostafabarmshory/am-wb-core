/* jslint todo: true */
/* jslint xxx: true */
/* jshint -W100 */
'use strict';

angular.module('ngMaterialWeburger')
/**
 * @ngdoc directive
 * @name donateMainApp.directive:mdeLinkList
 * @description # mdeLinkList
 */
.directive('wbLinkList', function() {
    return {
	restrict : 'E',
	templateUrl : 'views/directives/wb-linklist.html',
	replase : true,
	scope : {
	    wbEditable : '=?',
	    wbModel : '=?',
	    wbParent : '=?'
	},
	link : function(scope, elem, attrs) {
//	    scope.$watch('wbModel.style.flexAlignItem', function(
//		    newValue, oldValue) {
//		elem.removeClass(oldValue);
//		elem.addClass(newValue);
//	    });
//	    scope.$watch('wbModel.style.flexItemGrow', function(
//		    newValue, oldValue) {
//		elem.css('flex-grow', newValue);
//	    });
	},
	controller : function($scope, $element, $settings) {
	    var scope = $scope;
	    var model = $scope.wbModel;
	    var parentModel = $scope.wbParent;
	    var ctrl = {
		    hoveringDelBtn: false
	    }

	    function removeWidget() {
		if (parentModel) {
		    parentModel.removeWidget(model);
		}
	    }

	    function settings() {
		return $settings.load({
		    wbModel : model,
		    wbParent : parentModel,
		    style : {
			pages : [ 'text', 'pageLayout', 'selfLayout', 'border',
				'background', 'marginPadding',
				'minMaxSize' ]
		    }
		});
	    }

	    /**
	     * Adds new empty link
	     * 
	     * Adds new empty link into the list.
	     */
	    function addLink(){
		if(!scope.wbModel.links){
		    clearAll();
		}
		var link = {
		    title: 'New link',
		    description: 'Link description',
		    image: 'images/wb/linklist.svg',
		    href: 'http://dpq.co.ir'
		};
		scope.wbModel.links.push(link);
	    }
	    
	    /**
	     * 
	     */
	    function clearAll(){
		scope.wbModel.links = [];
	    }
	    
	    scope.removeWidget = removeWidget;
	    scope.settings = settings;
	    scope.ctrl = ctrl;
	    scope.extraActions = [
		{
		    title: 'New link',
		    icon: 'add',
		    action: addLink
		},{
		    title: 'Clear all',
		    icon: 'clear_all',
		    action: clearAll
		}
	    ];
	}
    };
});
