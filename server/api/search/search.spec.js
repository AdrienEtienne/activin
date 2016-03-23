'use strict';

var app = require('../..');
import request from 'supertest';

var newSearch;

describe('Search API:', function () {

  describe('GET /api/searchs', function () {
    var searchs;

    it('should respond 400', function (done) {
      request(app)
        .get('/api/searchs/predictions')
        .expect(400)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should respond with JSON array', function (done) {
      request(app)
        .get('/api/searchs/predictions?input=Paris')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.be.instanceOf(Array);
          done(err);
        });
    });
  });

});
