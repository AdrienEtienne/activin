'use strict';

var app = require('../..');
var Sport = require('./sport.model');
import request from 'supertest';

var sports;

describe('Sport API:', function () {

  describe('GET /api/sports', function () {

    beforeEach(function (done) {
      request(app)
        .get('/api/sports')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          } else {
            sports = res.body;
            done();
          }
        });
    });

    it('should respond with JSON array', function () {
      sports.should.be.instanceOf(Array);
    });

  });

  describe('GET /api/sports/:id', function () {
    var sport;

    beforeEach(function (done) {
      request(app)
        .get('/api/sports/' + sports[0]._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          sport = res.body;
          done();
        });
    });

    afterEach(function () {
      sport = {};
    });

    it('should respond one sport', function () {
      sport.name.should.equal(sports[0].name);
    });

    it('should respond 404 if do no exist', function (done) {
      var newSport = new Sport();
      request(app)
        .get('/api/sports/' + newSport._id)
        .expect(404)
        .end(done);
    });

    it('should respond 500 if wrong id', function (done) {
      request(app)
        .get('/api/sports/wrongId')
        .expect(500)
        .end(done);
    });
  });
});