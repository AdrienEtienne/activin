'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var authServiceStub = {
  isAuthenticated() {
      return 'authService.isAuthenticated';
    },
    hasRole(role) {
      return 'authService.hasRole.' + role;
    }
};

var locationCtrlStub = {
  index: 'locationCtrl.index',
  show: 'locationCtrl.show',
  create: 'locationCtrl.create',
  update: 'locationCtrl.update',
  destroy: 'locationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var locationIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './location.controller': locationCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('UserLocation API Router:', function () {

  it('should return an express router instance', function () {
    locationIndex.should.equal(routerStub);
  });

  describe('GET /api/locations', function () {

    it('should route to location.controller.index', function () {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'locationCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/locations/:id', function () {

    it('should route to location.controller.show', function () {
      routerStub.get
        .withArgs('/:id', 'locationCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/locations', function () {

    it('should route to location.controller.create', function () {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'locationCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/locations/:id', function () {

    it('should route to location.controller.update', function () {
      routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'locationCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/locations/:id', function () {

    it('should route to location.controller.destroy', function () {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'locationCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
