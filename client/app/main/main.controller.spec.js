'use strict';

describe('Controller: MainController', function () {

  // load the controller's module
  beforeEach(module('activinApp'));
  beforeEach(module('stateMock'));
  beforeEach(module('socketMock'));

  var scope;
  var MainController;
  var state;
  var $httpBackend;

  // Initialize the controller and a mock scope
  beforeEach(inject(function (_$httpBackend_, $controller, $rootScope, $state) {
    $httpBackend = _$httpBackend_;
    $httpBackend.expectGET('/api/applications/android/last')
      .respond({
        version: '1.0.0'
      });

    scope = $rootScope.$new();
    state = $state;
    MainController = $controller('MainController', {
      $scope: scope
    });
  }));

  it('should attach an android app object', function () {
    $httpBackend.flush();
    expect(MainController.android.version).toEqual('1.0.0');
  });
});
