'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var searchCtrlStub = {
  predictions: 'searchCtrl.predictions'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the predictions with our stubbed out modules
var searchIndex = proxyquire('./index.js', {
  'express': {
    Router: function () {
      return routerStub;
    }
  },
  './search.controller': searchCtrlStub
});

describe('Search API Router:', function () {

  it('should return an express router instance', function () {
    searchIndex.should.equal(routerStub);
  });

  describe('GET /api/searchs/predictions', function () {

    it('should route to search.controller.predictions', function () {
      routerStub.get
        .withArgs('/predictions', 'searchCtrl.predictions')
        .should.have.been.calledOnce;
    });

  });
});
