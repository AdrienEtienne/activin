'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var applicationCtrlStub = {
  index: 'applicationCtrl.index',
  show: 'applicationCtrl.show',
  create: 'applicationCtrl.create',
  update: 'applicationCtrl.update',
  destroy: 'applicationCtrl.destroy'
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
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var applicationIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './application.controller': applicationCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Application API Router:', function () {

  it('should return an express router instance', function () {
    applicationIndex.should.equal(routerStub);
  });

  describe('GET /api/applications/:platform', function () {

    it('should route to application.controller.index', function () {
      routerStub.get
        .withArgs('/:platform', 'applicationCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/applications/:platform/:id', function () {

    it('should route to application.controller.show', function () {
      routerStub.get
        .withArgs('/:platform/:id', 'applicationCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/applications', function () {

    it('should route to application.controller.create', function () {
      routerStub.post
        .withArgs('/', 'authService.hasRole.admin', 'applicationCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/applications/:id', function () {

    it('should route to application.controller.update', function () {
      routerStub.put
        .withArgs('/:id', 'authService.hasRole.admin', 'applicationCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/applications/:id', function () {

    it('should route to application.controller.update', function () {
      routerStub.patch
        .withArgs('/:id', 'authService.hasRole.admin', 'applicationCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/applications/:id', function () {

    it('should route to application.controller.destroy', function () {
      routerStub.delete
        .withArgs('/:id', 'authService.hasRole.admin', 'applicationCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
