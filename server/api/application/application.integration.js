'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';

var newApplication;

describe('Application API:', function () {
  var user;
  var token;

  // Clear users before testing
  before('Add user', function () {
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

  // Clear users after testing
  after('Remove User', function () {
    return User.removeAsync();
  });

  describe('GET /api/applications/:platform', function () {
    var applications;

    beforeEach(function (done) {
      request(app)
        .get('/api/applications/android')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          applications = res.body;
          done();
        });
    });

    it('should respond with JSON array', function () {
      applications.should.be.instanceOf(Array);
    });

  });

  describe('POST /api/applications', function () {
    beforeEach(function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .send({
          version: '1.0.0',
          platform: 'android'
        })
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newApplication = res.body;
          done();
        });
    });

    it('should respond with the newly created application', function () {
      newApplication.version.should.equal('1.0.0');
      newApplication.platform.should.equal('android');
      newApplication.createdAt.should.not.equal(newApplication.updatedAt);
    });

    it('should respond with 500 when bad version', function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .send({
          version: 'wrong',
          platform: 'android'
        })
        .expect(500)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          JSON.parse(res.error.text).errors.version.message.should.equal('Version not expected');
          done();
        });
    });

    it('should respond with 500 when bad platform', function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .send({
          version: '1.0.0',
          platform: 'wrong'
        })
        .expect(500)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          JSON.parse(res.error.text).errors.platform.message.should.equal('Platform not known');
          done();
        });
    });
  });

  describe('GET /api/applications/:id', function () {
    var application;

    beforeEach(function (done) {
      request(app)
        .get('/api/applications/' + newApplication._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          application = res.body;
          done();
        });
    });

    afterEach(function () {
      application = {};
    });

    it('should respond with the requested application', function () {
      newApplication.version.should.equal('1.0.0');
      newApplication.platform.should.equal('android');
    });

  });

  describe('PUT /api/applications/:id', function () {
    var updatedApplication;

    beforeEach(function (done) {
      request(app)
        .put('/api/applications/' + newApplication._id)
        .set('authorization', 'Bearer ' + token)
        .send({
          version: '1.0.1',
          platform: 'ios'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          updatedApplication = res.body;
          done();
        });
    });

    afterEach(function () {
      updatedApplication = {};
    });

    it('should respond with the updated application', function () {
      updatedApplication.version.should.equal('1.0.1');
      updatedApplication.platform.should.equal('ios');
      updatedApplication.createdAt.should.not.equal(updatedApplication.updatedAt);
    });

  });

  describe('DELETE /api/applications/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      request(app)
        .delete('/api/applications/' + newApplication._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when application does not exist', function (done) {
      request(app)
        .delete('/api/applications/' + newApplication._id)
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
