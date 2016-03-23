'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var sportCtrlStub = {
  index: 'sportCtrl.index',
  show: 'sportCtrl.show'
};

var routerStub = {
  get: sinon.spy()
};

// require the index with our stubbed out modules
var sportIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './sport.controller': sportCtrlStub
});

describe('Sport API Router:', function () {

  it('should return an express router instance', function () {
    sportIndex.should.equal(routerStub);
  });

  describe('GET /api/sports', function () {

    it('should route to sport.controller.index', function () {
      routerStub.get
        .withArgs('/', 'sportCtrl.index')
        .should.have.been.calledOnce;
    });

  });

  describe('GET /api/sports/:id', function () {

    it('should route to sport.controller.show', function () {
      routerStub.get
        .withArgs('/:id', 'sportCtrl.show')
        .should.have.been.calledOnce;
    });

  });

});
