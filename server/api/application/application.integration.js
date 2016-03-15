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

  describe('GET /api/applications/:platform/last', function () {
    var application, newApplication2;

    beforeEach(function (done) {
      request(app)
        .get('/api/applications/android/last')
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

    after(function (done) {
      request(app)
        .delete('/api/applications/' + newApplication2._id)
        .set('authorization', 'Bearer ' + token)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    })

    it('should respond with the last application', function () {
      application.version.should.equal('1.0.0');
      application.platform.should.equal('android');
    });

    it('should respond with the last application', function (done) {
      request(app)
        .post('/api/applications')
        .set('authorization', 'Bearer ' + token)
        .field('version', '1.0.1')
        .field('platform', 'android')
        .attach('application', 'package.json')
        .expect(201)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newApplication2 = res.body;
          newApplication2.version.should.equal('1.0.1');
          newApplication2.platform.should.equal('android');
          done();
        });
    });
  });

  describe('GET /api/applications/:platform/download/:id', function (done) {

    it('should download a file', function (done) {
      request(app)
        .get('/api/applications/android/download/' + newApplication.file)
        .expect('Content-Type', 'binary/octet-stream')
        .expect(200)
        .end(done);
    });

    it('should return an error', function (done) {
      request(app)
        .get('/api/applications/android/download/' + newApplication._id)
        .expect(404)
        .end(done);
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

    it('should not contain file if application removed', function (done) {
      mongoose.connection.db.collection('applications.files')
        .find()
        .toArray(function (err, files) {
          files.should.have.length(0);
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
