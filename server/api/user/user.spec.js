'use strict';

import app from '../..';
import User from './user.model';
import Sport from '../sport/sport.model';
import request from 'supertest';

describe('User API:', function () {
  var user;

  // Clear users before testing
  before(function () {
    return User.removeAsync().then(function () {
      user = new User({
        name: 'Fake User',
        email: 'test@example.com',
        password: 'password',
        role: 'admin'
      });

      return user.saveAsync();
    });
  });

  // Clear users after testing
  after(function () {
    return User.removeAsync();
  });

  var token;

  before(function (done) {
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

  describe('GET /api/users', function () {

    it('should respond an array', function (done) {
      request(app)
        .get('/api/users')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.be.instanceof(Array);
          done();
        });
    });
  });

  describe('GET /api/users/:id', function () {

    it('should return an user', function (done) {
      request(app)
        .get('/api/users/' + user._id)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          user.should.deep.contains(res.body);
          done();
        });
    });

    it('should return a 404 if not found', function (done) {
      var tmp = new User();
      request(app)
        .get('/api/users/' + tmp._id)
        .set('authorization', 'Bearer ' + token)
        .expect(404)
        .end(done);
    });

    it('should return a 500 if bad id', function (done) {
      request(app)
        .get('/api/users/azertyuiop123456')
        .set('authorization', 'Bearer ' + token)
        .expect(500)
        .end(done);
    });
  });

  describe('GET /api/users/me', function () {

    it('should respond with a user profile when authenticated', function (done) {
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

    it('should respond with a 401 when not authenticated', function (done) {
      request(app)
        .get('/api/users/me')
        .expect(401)
        .end(done);
    });
  });

  describe('POST /api/users', function () {

    it('should return error if no name', function (done) {
      request(app)
        .post('/api/users')
        .send({
          email: 'mail@mail.com',
          password: 'password'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should return error if no mail', function (done) {
      request(app)
        .post('/api/users')
        .send({
          name: 'name',
          password: 'password'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should return error if mail already taken', function (done) {
      request(app)
        .post('/api/users')
        .send({
          name: 'name',
          email: 'test@example.com',
          password: 'password'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should return error if no password', function (done) {
      request(app)
        .post('/api/users')
        .send({
          name: 'name',
          email: 'mail@mail.com'
        })
        .expect(422)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should create an user', function (done) {
      request(app)
        .post('/api/users')
        .send({
          name: 'name',
          email: 'mail@mail.com',
          password: 'password'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          should.exist(res.body.token);
          done();
        });
    });
  });

  describe('PUT /api/users/:id/changePassword', function () {
    it('should return 403 if bad password', function (done) {
      request(app)
        .put('/api/users/' + user._id + '/password')
        .set('authorization', 'Bearer ' + token)
        .send({
          newPassword: 'newPassword',
          oldPassword: 'wrongpassword'
        })
        .expect(403)
        .end(done)
    });

    it('should return 204', function (done) {
      request(app)
        .put('/api/users/' + user._id + '/password')
        .set('authorization', 'Bearer ' + token)
        .send({
          newPassword: 'newPassword',
          oldPassword: 'password'
        })
        .expect(204)
        .end(done)
    });

  });

  describe('PUT /api/users/:id/sports', function () {
    var sports;

    beforeEach(function () {
      return Sport.findAsync().then(function (result) {
        sports = result;
        return;
      });
    })

    it('should return 204', function (done) {
      request(app)
        .put('/api/users/' + user._id + '/sports')
        .set('authorization', 'Bearer ' + token)
        .send(sports)
        .expect(204)
        .end(done)
    });

    it('should add a sport', function (done) {
      User.findByIdAsync(user._id).then(function (user) {
        user.sports.should.have.length(1);
        done();
      });
    });

    it('should return 204 when empty sports', function (done) {
      request(app)
        .put('/api/users/' + user._id + '/sports')
        .set('authorization', 'Bearer ' + token)
        .send([])
        .expect(204)
        .end(done)
    });

    it('should return an empty array for sports', function (done) {
      User.findByIdAsync(user._id).then(function (user) {
        user.sports.should.have.length(0);
        done();
      });
    });

    it('should return 204 with id only', function (done) {
      request(app)
        .put('/api/users/' + user._id + '/sports')
        .set('authorization', 'Bearer ' + token)
        .send([sports[0]._id])
        .expect(204)
        .end(done)
    });

    it('should add a sport', function (done) {
      User.findByIdAsync(user._id).then(function (user) {
        user.sports.should.have.length(1);
        done();
      });
    });
  });

  describe('Location', function () {

    describe('PUT /api/users/:id/setLocation', function () {
      it('should have no location by default', function (done) {
        User.findByIdAsync(user._id).then(function (result) {
          assert.equal(result.keepLocation, true);
          assert.equal(result.location, undefined);
          done();
        });
      });

      it('should respond with an 201', function (done) {
        request(app)
          .put('/api/users/' + user._id + '/setLocation')
          .send({
            location: [-95.56, 29.735]
          })
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should have one location', function (done) {
        User.findByIdAsync(user._id).then(function (result) {
          result.location.should.deep.equal([-95.56, 29.735]);
          done();
        });
      });

      it('should respond with an 201', function (done) {
        request(app)
          .put('/api/users/' + user._id + '/setLocation')
          .send({
            keepLocation: false
          })
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should have no location', function (done) {
        User.findByIdAsync(user._id).then(function (result) {
          assert.equal(result.location, undefined);
          done();
        });
      });

      it('should have keepLocation at false', function (done) {
        User.findByIdAsync(user._id).then(function (result) {
          assert.equal(result.keepLocation, false);
          done();
        });
      });
    });
  });

  describe('DELETE /api/users/:id', function () {

    it('should return 500 if bad id', function (done) {
      request(app)
        .delete('/api/users/fakeid')
        .set('authorization', 'Bearer ' + token)
        .expect(500)
        .end(done);
    });

    it('should remove the user', function (done) {
      request(app)
        .delete('/api/users/' + user._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end(done);
    });
  });
});
