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
    $httpBackend.expectGET('/api/sports')
      .respond(['Running', 'Cycling', 'Soccer']);

    scope = $rootScope.$new();
    state = $state;
    MainController = $controller('MainController', {
      $scope: scope
    });
  }));

  it('should attach a list of sports to the controller', function () {
    $httpBackend.flush();
    expect(MainController.sports.length).toBe(3);
  });
});
