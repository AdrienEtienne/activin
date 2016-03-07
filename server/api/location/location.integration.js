'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var newLocation;

describe('Location API:', function () {
  var user;
  var token;

  // Clear users before testing
  before('Add user', function () {
    return User.removeAsync().then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      });

      return user.saveAsync();
    });
  });

  before('Get token', function (done) {
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

  describe('GET /api/locations', function () {
    var locations;

    beforeEach(function (done) {
      request(app)
        .get('/api/locations')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          locations = res.body;
          done();
        });
    });

    it('should respond with JSON array', function () {
      locations.should.be.instanceOf(Array);
    });

    it('should respond 401 when not authorized', function (done) {
      request(app)
        .get('/api/locations')
        .expect(401)
        .expect('Content-Type', /json/)
        .end();
    });
  });

  describe('POST /api/locations', function () {
    beforeEach(function (done) {
      request(app)
        .post('/api/locations')
        .send({
          name: 'New Location',
          location: [-95.56, 29.735]
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newLocation = res.body;
          done();
        });
    });

    it('should respond with the newly created location', function () {
      newLocation.name.should.equal('New Location');
      newLocation.info.should.equal('This is the brand new location!!!');
    });

  });

  describe('GET /api/locations/:id', function () {
    var location;

    beforeEach(function (done) {
      request(app)
        .get('/api/locations/' + newLocation._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          location = res.body;
          done();
        });
    });

    afterEach(function () {
      location = {};
    });

    it('should respond with the requested location', function () {
      location.name.should.equal('New Location');
      location.info.should.equal('This is the brand new location!!!');
    });

  });

  describe('PUT /api/locations/:id', function () {
    var updatedLocation;

    beforeEach(function (done) {
      request(app)
        .put('/api/locations/' + newLocation._id)
        .send({
          name: 'Updated Location',
          info: 'This is the updated location!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          updatedLocation = res.body;
          done();
        });
    });

    afterEach(function () {
      updatedLocation = {};
    });

    it('should respond with the updated location', function () {
      updatedLocation.name.should.equal('Updated Location');
      updatedLocation.info.should.equal('This is the updated location!!!');
    });

  });

  describe('DELETE /api/locations/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      request(app)
        .delete('/api/locations/' + newLocation._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when location does not exist', function (done) {
      request(app)
        .delete('/api/locations/' + newLocation._id)
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
