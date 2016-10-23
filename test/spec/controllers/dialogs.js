'use strict';

describe('Controller: WbDialogsCtrl', function() {

    // load the controller's module
    beforeEach(module('ngMaterialWeburger'));

    var WbDialogsCtrl;
    var scope;
    var ngModel;
    var mdDialog;

    // Initialize the controller and a mock scope
    beforeEach(inject(function($controller, $rootScope) {
	scope = $rootScope.$new();
	WbDialogsCtrl = $controller('WbDialogsCtrl', {
	    $scope : scope,
	    $mdDialog : mdDialog,
	    wbModel : ngModel,
	    style : {}
	// place here mocked dependencies
	});
    }));

    it('should attach a list of awesomeThings to the scope', function() {
	expect(WbDialogsCtrl).not.toBe(null);
    });
});
