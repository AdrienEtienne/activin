'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var newPlace;

describe('Place API:', function() {
  var user;
  var token;

  // Clear users before testing
  before('Add user', function() {
    return User.removeAsync().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      });

      return user.saveAsync();
    });
  });

  before('Get token', function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'test@example.com',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        token = res.body.token;
        done();
      });
  });

  // Clear users after testing
  after('Remove User', function() {
    return User.removeAsync();
  });

  describe('GET /api/places', function() {
    var places;

    beforeEach(function(done) {
      request(app)
        .get('/api/places')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          places = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      places.should.be.instanceOf(Array);
    });

    it('should respond 401 when not authorized', function(done) {
      request(app)
        .get('/api/places')
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/places', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/places')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Place',
          location: [-95.56, 29.735]
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newPlace = res.body;
          done();
        });
    });

    it('should respond with the newly created place', function() {
      newPlace.name.should.equal('New Place');
      newPlace.location.should.deep.equal([-95.56, 29.735]);
    });

  });

  describe('GET /api/places/:id', function() {
    var place;

    beforeEach(function(done) {
      request(app)
        .get('/api/places/' + newPlace._id)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          place = res.body;
          done();
        });
    });

    afterEach(function() {
      place = {};
    });

    it('should respond with the requested place', function() {
      place.name.should.equal('New Place');
      place.location.should.deep.equal([-95.56, 29.735]);
    });

  });

  describe('PUT /api/places/:id', function() {
    var updatedPlace;

    beforeEach(function(done) {
      request(app)
        .put('/api/places/' + newPlace._id)
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'Updated Place',
          location: [1, 1]
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedPlace = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedPlace = {};
    });

    it('should respond with the updated place', function() {
      updatedPlace.name.should.equal('Updated Place');
      updatedPlace.location.should.deep.equal([1, 1]);
    });

  });

  describe('DELETE /api/places/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/places/' + newPlace._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when place does not exist', function(done) {
      request(app)
        .delete('/api/places/' + newPlace._id)
        .set('authorization', 'Bearer ' + token)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});