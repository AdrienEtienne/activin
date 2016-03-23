'use strict';

import app from '../..';
import User from './user.model';
import request from 'supertest';

describe('User API:', function() {
  var user;

  // Clear users before testing
  before(function() {
    return User.removeAsync().then(function() {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password'
      });

      return user.saveAsync();
    });
  });

  // Clear users after testing
  after(function() {
    return User.removeAsync();
  });

  var token;

  before(function(done) {
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

  describe('GET /api/users/me', function() {

    it('should respond with a user profile when authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body._id.toString().should.equal(user._id.toString());
          done();
        });
    });

    it('should respond with a 401 when not authenticated', function(done) {
      request(app)
        .get('/api/users/me')
        .expect(401)
        .end(done);
    });
  });

  describe('Location', function() {

    describe('PUT /api/users/:id/setLocation', function() {
      it('should have no location by default', function(done) {
        User.findByIdAsync(user._id).then(function(result) {
          assert.equal(result.keepLocation, true);
          assert.equal(result.location, undefined);
          done();
        });
      });

      it('should respond with an 201', function(done) {
        request(app)
          .put('/api/users/' + user._id + '/setLocation')
          .send({
            location: [-95.56, 29.735]
          })
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should have one location', function(done) {
        User.findByIdAsync(user._id).then(function(result) {
          result.location.should.deep.equal([-95.56, 29.735]);
          done();
        });
      });

      it('should respond with an 201', function(done) {
        request(app)
          .put('/api/users/' + user._id + '/setLocation')
          .send({
            keepLocation: false
          })
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should have no location', function(done) {
        User.findByIdAsync(user._id).then(function(result) {
          assert.equal(result.location, undefined);
          done();
        });
      });

      it('should have keepLocation at false', function(done) {
        User.findByIdAsync(user._id).then(function(result) {
          assert.equal(result.keepLocation, false);
          done();
        });
      });
    });
  });
});