'use strict';

var app = require('../..');
import request from 'supertest';

var newSearch;

describe('Search API:', function () {

  describe('GET /api/searchs/predictions', function () {

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

  describe('GET /api/searchs/details', function () {
    var prediction;

    before(function (done) {
      request(app)
        .get('/api/searchs/predictions?input=Paris')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          prediction = res.body[0];
          done(err);
        });
    });

    it('should respond 400', function (done) {
      request(app)
        .get('/api/searchs/details')
        .expect(400)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should respond with place details', function (done) {
      request(app)
        .get('/api/searchs/details?placeid=' + prediction.placeid)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.placeid.should.equal(prediction.placeid);
          done(err);
        });
    });
  });
});
