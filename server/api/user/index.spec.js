'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var userCtrlStub = {
  index: 'userCtrl.index',
  destroy: 'userCtrl.destroy',
  me: 'userCtrl.me',
  changePassword: 'userCtrl.changePassword',
  setLocation: 'userCtrl.setLocation',
  addLocation: 'userCtrl.addLocation',
  deleteLocation: 'userCtrl.deleteLocation',
  show: 'userCtrl.show',
  create: 'userCtrl.create'
};

var authServiceStub = {
  isAuthenticated() {
      return 'authService.isAuthenticated';
    },
    hasRole(role) {
      return 'authService.hasRole.' + role;
    }
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var userIndex = proxyquire('./index', {
  'express': {
    Router() {
      return routerStub;
    }
  },
  './user.controller': userCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('User API Router:', function() {

  it('should return an express router instance', function() {
    userIndex.should.equal(routerStub);
  });

  describe('GET /api/users', function() {

    it('should verify admin role and route to user.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.hasRole.admin', 'userCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/users/:id', function() {

    it('should verify admin role and route to user.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.hasRole.admin', 'userCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/me', function() {

    it('should be authenticated and route to user.controller.me', function() {
      routerStub.get
        .withArgs('/me', 'authService.isAuthenticated', 'userCtrl.me')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/users/:id/password', function() {

    it('should be authenticated and route to user.controller.changePassword', function() {
      routerStub.put
        .withArgs('/:id/password', 'authService.isAuthenticated', 'userCtrl.changePassword')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/users/:id', function() {

    it('should be authenticated and route to user.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'userCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/users', function() {

    it('should route to user.controller.create', function() {
      routerStub.post
        .withArgs('/', 'userCtrl.create')
        .should.have.been.calledOnce;
    });

  });


  describe('User Location', function() {

    describe('PUT /api/users/:id/setLocation', function() {
      it('should be authenticated and route to user.controller.setLocation', function() {
        routerStub.put
          .withArgs('/:id/setLocation', 'authService.isAuthenticated', 'userCtrl.setLocation')
          .should.have.been.calledOnce;
      });
    });

    describe('PUT /api/users/:id/addLocation', function() {
      it('should be authenticated and route to user.controller.addLocation', function() {
        routerStub.put
          .withArgs('/:id/addLocation', 'authService.isAuthenticated', 'userCtrl.addLocation')
          .should.have.been.calledOnce;
      });

    });

    describe('PUT /api/users/:id/deleteLocation', function() {
      it('should be authenticated and route to user.controller.deleteLocation', function() {
        routerStub.put
          .withArgs('/:id/deleteLocation', 'authService.isAuthenticated', 'userCtrl.deleteLocation')
          .should.have.been.calledOnce;
      });
    });

  });
});