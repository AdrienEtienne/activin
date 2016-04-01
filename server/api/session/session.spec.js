'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';
import Session from './session.model';

var newSession;

describe('Session API:', function () {
  var user;
  var token;
  var sports;

  // Get sports
  before(function () {
    return Sport.findAsync().then(function (results) {
      sports = results;
      return;
    });
  });

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

  after('Remove User', function () {
    return User.removeAsync();
  });

  describe('GET /api/sessions', function () {
    var sessions;

    beforeEach(function (done) {
      request(app)
        .get('/api/sessions')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          sessions = res.body;
          done();
        });
    });

    it('should respond with JSON array', function () {
      sessions.should.be.instanceOf(Array);
    });

    describe('?next=true', function () {
      var sessionNext, sessionPrevious;
      before(function (done) {
        request(app)
          .post('/api/sessions')
          .set('authorization', 'Bearer ' + token)
          .send({
            name: 'New Session',
            sport: sports[0],
            dateStart: new Date(new Date().getTime() + 60000)
          })
          .end((err, res) => {
            sessionNext = res.body;
            done(err);
          });
      });

      before(function (done) {
        request(app)
          .post('/api/sessions')
          .set('authorization', 'Bearer ' + token)
          .send({
            name: 'New Session',
            sport: sports[0],
            dateStart: new Date(new Date().getTime() - 60000)
          })
          .end((err, res) => {
            sessionPrevious = res.body;
            done(err);
          });
      });

      after('Remove Sessions', function () {
        return Session.removeAsync();
      });

      it('should respond only one element', function (done) {
        request(app)
          .get('/api/sessions?next=true')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            res.body.should.have.length(1);
            res.body[0]._id.should.equal(sessionNext._id);
            done(err);
          });
      });
    });
  });

  describe('POST /api/sessions', function () {
    beforeEach(function (done) {
      request(app)
        .post('/api/sessions')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Session',
          sport: sports[0],
          dateStart: new Date(),
          dateStop: new Date()
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newSession = res.body;
          done();
        });
    });

    it('should respond with the newly created session', function () {
      newSession.name.should.equal('New Session');
      newSession.sport.should.equal(sports[0]._id.toString());
    });

    it('should respond error if no sport', function (done) {
      request(app)
        .post('/api/sessions')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Session',
          dateStart: new Date(),
          dateStop: new Date()
        })
        .expect(500)
        .expect('Content-Type', /json/)
        .end(done);
    });
  });

  describe('GET /api/sessions/:id', function () {
    var session;

    beforeEach(function (done) {
      request(app)
        .get('/api/sessions/' + newSession._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          session = res.body;
          done();
        });
    });

    afterEach(function () {
      session = {};
    });

    it('should respond with the requested session', function () {
      newSession.name.should.equal('New Session');
      newSession.sport.should.equal(sports[0]._id.toString());
    });

    it('should respond 500 if fake id', function (done) {
      request(app)
        .get('/api/sessions/fakeId')
        .expect(500)
        .expect('Content-Type', /json/)
        .end(done);
    });

  });

  describe('PUT /api/sessions/:id', function () {
    var updatedSession;

    beforeEach(function (done) {
      request(app)
        .put('/api/sessions/' + newSession._id)
        .send({
          _id: newSession._id,
          name: 'Updated Session',
          sport: sports[1]._id
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          updatedSession = res.body;
          done();
        });
    });

    afterEach(function () {
      updatedSession = {};
    });

    it('should respond with the updated session', function () {
      updatedSession.name.should.equal('Updated Session');
      updatedSession.sport.should.equal(sports[1]._id.toString());
    });

    it('should update without id', function (done) {
      request(app)
        .put('/api/sessions/' + newSession._id)
        .send({
          name: 'Updated Session2'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          updatedSession = res.body;
          updatedSession.name.should.equal('Updated Session2');
          done();
        });
    });

  });

  describe('DELETE /api/sessions/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      request(app)
        .delete('/api/sessions/' + newSession._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when session does not exist', function (done) {
      request(app)
        .delete('/api/sessions/' + newSession._id)
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
