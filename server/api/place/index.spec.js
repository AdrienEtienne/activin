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

var placeCtrlStub = {
  index: 'placeCtrl.index',
  show: 'placeCtrl.show',
  create: 'placeCtrl.create',
  update: 'placeCtrl.update',
  destroy: 'placeCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var placeIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './place.controller': placeCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('UserLocation API Router:', function() {

  it('should return an express router instance', function() {
    placeIndex.should.equal(routerStub);
  });

  describe('GET /api/places', function() {

    it('should route to place.controller.index', function() {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'placeCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/places/:id', function() {

    it('should route to place.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'authService.isAuthenticated', 'placeCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/places', function() {

    it('should route to place.controller.create', function() {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'placeCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/places/:id', function() {

    it('should route to place.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'authService.isAuthenticated', 'placeCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/places/:id', function() {

    it('should route to place.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'authService.isAuthenticated', 'placeCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});