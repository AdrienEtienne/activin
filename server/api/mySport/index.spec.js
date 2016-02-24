'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mySportCtrlStub = {
  mine: 'mySportCtrl.mine',
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
  /*
    describe('GET /api/mySports/:id', function () {

      it('should route to mySport.controller.show', function () {
        routerStub.get
          .withArgs('/:id', 'mySportCtrl.show')
          .should.have.been.calledOnce;
      });

    });

    describe('POST /api/mySports', function () {

      it('should route to mySport.controller.create', function () {
        routerStub.post
          .withArgs('/', 'mySportCtrl.create')
          .should.have.been.calledOnce;
      });

    });

    describe('PUT /api/mySports/:id', function () {

      it('should route to mySport.controller.update', function () {
        routerStub.put
          .withArgs('/:id', 'mySportCtrl.update')
          .should.have.been.calledOnce;
      });

    });

    describe('PATCH /api/mySports/:id', function () {

      it('should route to mySport.controller.update', function () {
        routerStub.patch
          .withArgs('/:id', 'mySportCtrl.update')
          .should.have.been.calledOnce;
      });

    });

    describe('DELETE /api/mySports/:id', function () {

      it('should route to mySport.controller.destroy', function () {
        routerStub.delete
          .withArgs('/:id', 'mySportCtrl.destroy')
          .should.have.been.calledOnce;
      });

    });
  */
});
