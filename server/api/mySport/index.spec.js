'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mySportCtrlStub = {
  mine: 'mySportCtrl.mine',
  noneMine: 'mySportCtrl.noneMine',
  select: 'mySportCtrl.select',
  unselect: 'mySportCtrl.unselect'
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
var mySportIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './mySport.controller': mySportCtrlStub,
  '../../auth/auth.service': authServiceStub
});

describe('MySport API Router:', function () {

  it('should return an express router instance', function () {
    mySportIndex.should.equal(routerStub);
  });

  describe('GET /api/mySports/mine', function () {

    it('should route to mySport.controller.mine', function () {
      routerStub.get
        .withArgs('/mine', 'authService.isAuthenticated', 'mySportCtrl.mine')
        .should.have.been.calledOnce;
    });
  });

  describe('GET /api/mySports/noneMine', function () {

    it('should route to mySport.controller.noneMine', function () {
      routerStub.get
        .withArgs('/noneMine', 'authService.isAuthenticated', 'mySportCtrl.noneMine')
        .should.have.been.calledOnce;
    });
  });

  describe('POST /api/mySports', function () {

    it('should route to mySport.controller.select', function () {
      routerStub.post
        .withArgs('/select/:sportId', 'authService.isAuthenticated', 'mySportCtrl.select')
        .should.have.been.calledOnce;
    });

    it('should route to mySport.controller.unselect', function () {
      routerStub.post
        .withArgs('/unselect/:sportId', 'authService.isAuthenticated', 'mySportCtrl.unselect')
        .should.have.been.calledOnce;
    });

  });
});
