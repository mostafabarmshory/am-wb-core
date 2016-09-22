'use strict';

describe('Controller: DialogsCtrl', function () {

  // load the controller's module
  beforeEach(module('ngMaterialExtension'));

  var DialogsCtrl;
  var scope;
  var ngModel;
  var mdDialog;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    DialogsCtrl = $controller('DialogsCtrl', {
      $scope: scope,
      $mdDialog: mdDialog,
      mdeModel: ngModel,
      style: {}
      // place here mocked dependencies
    });
  }));

  it('should attach a list of awesomeThings to the scope', function () {
//    expect(DialogsCtrl.awesomeThings.length).toBe(3);
  });
});
