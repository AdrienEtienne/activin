'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var mySportCtrlStub = {
  index: 'mySportCtrl.index',
  show: 'mySportCtrl.show',
  create: 'mySportCtrl.create',
  update: 'mySportCtrl.update',
  destroy: 'mySportCtrl.destroy'
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
    Router: function() {
      return routerStub;
    }
  },
  './mySport.controller': mySportCtrlStub
});

describe('MySport API Router:', function() {

  it('should return an express router instance', function() {
    mySportIndex.should.equal(routerStub);
  });

  describe('GET /api/mySports', function() {

    it('should route to mySport.controller.index', function() {
      routerStub.get
        .withArgs('/', 'mySportCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/mySports/:id', function() {

    it('should route to mySport.controller.show', function() {
      routerStub.get
        .withArgs('/:id', 'mySportCtrl.show')
        .should.have.been.calledOnce;
    });

  });

  describe('POST /api/mySports', function() {

    it('should route to mySport.controller.create', function() {
      routerStub.post
        .withArgs('/', 'mySportCtrl.create')
        .should.have.been.calledOnce;
    });

  });

  describe('PUT /api/mySports/:id', function() {

    it('should route to mySport.controller.update', function() {
      routerStub.put
        .withArgs('/:id', 'mySportCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('PATCH /api/mySports/:id', function() {

    it('should route to mySport.controller.update', function() {
      routerStub.patch
        .withArgs('/:id', 'mySportCtrl.update')
        .should.have.been.calledOnce;
    });

  });

  describe('DELETE /api/mySports/:id', function() {

    it('should route to mySport.controller.destroy', function() {
      routerStub.delete
        .withArgs('/:id', 'mySportCtrl.destroy')
        .should.have.been.calledOnce;
    });

  });

});
