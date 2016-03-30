'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var authServiceStub = {
  isAuthenticated() {
    return 'authService.isAuthenticated';
  }
};

var sessionCtrlStub = {
  index: 'sessionCtrl.index',
  show: 'sessionCtrl.show',
  create: 'sessionCtrl.create',
  update: 'sessionCtrl.update',
  destroy: 'sessionCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var sessionIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './session.controller': sessionCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('Session API Router:', function () {

  it('should return an express router instance', function () {
    sessionIndex.should.equal(routerStub);
  });

  describe('GET /api/sessions', function () {

    it('should route to session.controller.index', function () {
      routerStub.get
        .withArgs('/', 'authService.isAuthenticated', 'sessionCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/sessions/:id', function () {

    it('should route to session.controller.show', function () {
      routerStub.get
        .withArgs('/:id', 'sessionCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/sessions', function () {

    it('should route to session.controller.create', function () {
      routerStub.post
        .withArgs('/', 'authService.isAuthenticated', 'sessionCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/sessions/:id', function () {

    it('should route to session.controller.update', function () {
      routerStub.put
        .withArgs('/:id', 'sessionCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/sessions/:id', function () {

    it('should route to session.controller.update', function () {
      routerStub.patch
        .withArgs('/:id', 'sessionCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/sessions/:id', function () {

    it('should route to session.controller.destroy', function () {
      routerStub.delete
        .withArgs('/:id', 'sessionCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
