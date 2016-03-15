'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Place from './place.model';

var newPlace;

describe('Place API:', function() {
  var user;
  var otherUser;
  var token;
  var otherToken;

  // Clear users before testing
  before('Remove places', function() {
    return Place.removeAsync();
  });

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

  before('Add other user', function() {
    otherUser = new User({
      name: 'Fake User2',
      email: 'test2@example.com',
      password: 'password'
    });

    return otherUser.saveAsync();
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

  before('Get token other user', function(done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'test2@example.com',
        password: 'password'
      })
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        otherToken = res.body.token;
        done();
      });
  });

  // Clear users after testing
  after('Remove User', function() {
    return User.removeAsync();
  });

  describe('POST /api/places', function() {
    before(function(done) {
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

    it('should respond with the user reference', function() {
      newPlace.user.should.equal(user._id.toString());
    });
  });

  describe('GET /api/places', function() {
    var places;

    before(function(done) {
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

    it('should respond one element', function() {
      places.should.have.length(1);
    });

    it('should respond zero element when bad user', function(done) {
      request(app)
        .get('/api/places')
        .set('authorization', 'Bearer ' + otherToken)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.length(0);
          done();
        });
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

    it('should respond with 404 when place not to the user', function(done) {
      request(app)
        .delete('/api/places/' + newPlace._id)
        .set('authorization', 'Bearer ' + otherToken)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

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

    it('should keep the place as hide', function(done) {
      Place.findAsync().then(function(places) {
        places.should.have.length(1);
        places[0].hide.should.equal(true);
        done();
      });
    });

    it('should not return the deleted place', function(done) {
      request(app)
        .get('/api/places')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          res.body.should.have.length(0);
          done();
        });
    });

  });

});