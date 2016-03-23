'use strict';

var app = require('../..');
var Sport = require('./sport.model');
import request from 'supertest';

var newSport;

describe('Sport API:', function () {

  beforeEach('Create sport', function (done) {
    Sport.remove().exec(function () {
      Sport.create({
        name: 'running'
      }, function (err, sport) {
        newSport = sport;
        done(err);
      });
    });
  });

  describe('GET /api/sports', function () {
    var sports;

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

    it('should return one element', function () {
      sports.should.have.length(1);
    });

  });

  describe('GET /api/sports/:id', function () {
    var sport;

    beforeEach(function (done) {
      request(app)
        .get('/api/sports/' + newSport._id)
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

    it('should respond with the requested sport', function () {
      sport.name.should.equal('running');
    });

    it('should respond 404 if do no exist', function (done) {
      newSport.remove(function () {
        request(app)
          .get('/api/sports/' + newSport._id)
          .expect(404)
          .end(done);
      });
    });

    it('should respond 500 if wrong id', function (done) {
      request(app)
        .get('/api/sports/wrongId')
        .expect(500)
        .end(done);
    });
  });
});
