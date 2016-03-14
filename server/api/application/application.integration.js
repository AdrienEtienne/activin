'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';
var gfs = new Grid(mongoose.connection.db, mongoose.mongo);

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

  describe('POST /api/applications', function () {
    before(function (done) {
      mongoose.connection.db.collection('applications.files').deleteMany({}, done);
    })
    before(function (done) {
      mongoose.connection.db.collection('applications.chunks').deleteMany({}, done);
    })

    before(function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .field('version', '1.0.0')
        .field('platform', 'android')
        .attach('application', 'package.json')
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

    it('should have the file in application.files', function (done) {
      gfs.exist({
        _id: newApplication.file,
        root: 'applications'
      }, function (err, found) {
        found.should.equal(true);
        done(err);
      });
    });

    it('should respond with 500 when bad version', function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .field('version', 'wrong')
        .field('platform', 'android')
        .attach('application', 'package.json')
        .expect(500)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          JSON.parse(res.error.text).errors.version.message.should.equal('Version not expected');
          done();
        });
    });

    it('should not have the file if version error', function (done) {
      gfs.exist({
          filename: 'ActivIn_vwrong.apk',
          root: 'applications'
        },
        function (err, found) {
          found.should.equal(false);
          done(err);
        });
    });

    it('should respond with 500 when bad platform', function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .field('version', '1.0.0')
        .field('platform', 'wrong')
        .attach('application', 'package.json')
        .expect(500)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          JSON.parse(res.error.text).errors.platform.message.should.equal('Platform not known');
          done();
        });
    });

    it('should not have the file if platform error', function (done) {
      mongoose.connection.db.collection('applications.files')
        .find()
        .toArray(function (err, files) {
          files.should.have.length(1);
          done();
        });
    });
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

    it('should have length 1', function () {
      applications.should.have.length(1);
    });

    it('should have length 0', function (done) {
      request(app)
        .get('/api/applications/ios')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.should.have.length(0);
          done();
        });
    });

  });

  describe.skip('GET /api/applications/:platform/:id', function () {
    var application;

    beforeEach(function (done) {
      request(app)
        .get('/api/applications/android/' + newApplication._id)
        .expect(200)
        .expect('Content-Type', 'application/octet-stream')
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          application = res;
          done();
        });
    });

    afterEach(function () {
      application = {};
    });

    it('should respond with the requested application for download', function () {
      console.log(application);
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
