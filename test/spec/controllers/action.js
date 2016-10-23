'use strict';

describe('Controller: WbActionCtrl', function() {

    // load the controller's module
    beforeEach(module('ngMaterialWeburger'));

    var WbActionCtrl, scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
	scope = $rootScope.$new();
	WbActionCtrl = $controller('WbActionCtrl', {
	    $scope : scope
	// place here mocked dependencies
	});
    }));

    it('should attach a list of awesomeThings to the scope', function() {
	expect(WbActionCtrl.types).not.toBe(null);
    });
});
