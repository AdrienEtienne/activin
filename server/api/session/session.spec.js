'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';
import Session from './session.model';
import Invitation from './invitation.model';

var newSession;

describe('Session API:', function () {
  var user;
  var token;
  var sports;

  var session;
  var genSession = function (data) {
    var doc = data || {
      createdBy: user,
      name: 'New Session',
      sport: sports[0],
      dateStart: new Date(new Date().getTime() + 60000)
    }
    session = new Session(doc);
    return session;
  };

  var invitation;
  var genInvitation = function () {
    invitation = new Invitation({
      userInvited: user,
      byUser: user
    });
    return invitation;
  };

  // Clear users before testing
  before('Remove Session', function () {
    return Session.removeAsync();
  });

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

    describe('query', function () {
      beforeEach(function () {
        genSession();
        genInvitation();
      });

      afterEach('Remove Sessions', function () {
        return Session.removeAsync();
      });

      describe('?next=true', function () {
        beforeEach(function () {
          return session.saveAsync();
        });

        it('should respond only one element', function (done) {
          request(app)
            .get('/api/sessions?next=true')
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(1);
              res.body[0]._id.should.equal(session._id.toString());
              done(err);
            });
        });
      });

      describe('scope', function () {
        describe('?id', function () {
          beforeEach(function () {
            return session.saveAsync();
          });

          it('should respond only element id only', function (done) {
            request(app)
              .get('/api/sessions?scope=id')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].should.have.property('_id');
                done(err);
              });
          });
        });

        describe('?invitation', function () {
          beforeEach(function () {
            session.invitations = [invitation];
            return session.saveAsync();
          });

          it('should respond only element id only', function (done) {
            request(app)
              .get('/api/sessions?scope=invitation')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].invitations[0]._id.should.equal(invitation._id.toString());
                done(err);
              });
          });
        });

        describe('?filter', function () {
          beforeEach(function () {
            session.invitations = [invitation];
            return session.saveAsync();
          });

          describe('=unknown', function () {
            it('should respond one element', function (done) {
              request(app)
                .get('/api/sessions?filter=unknown')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  res.body.should.have.length(1);
                  done(err);
                });
            });

            it('should respond zero element', function (done) {
              invitation.setAccepted();
              session.invitations = [invitation];
              session.saveAsync().then(function (result) {
                request(app)
                  .get('/api/sessions?filter=unknown')
                  .set('authorization', 'Bearer ' + token)
                  .expect(200)
                  .expect('Content-Type', /json/)
                  .end((err, res) => {
                    res.body.should.have.length(0);
                    done(err);
                  });
              });
            });
          });

          describe('=accepted', function () {
            it('should respond zero element', function (done) {
              request(app)
                .get('/api/sessions?filter=accepted')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  res.body.should.have.length(0);
                  done(err);
                });
            });

            it('should respond one element', function (done) {
              invitation.setAccepted();
              session.invitations = [invitation];
              session.saveAsync().then(function (result) {
                request(app)
                  .get('/api/sessions?filter=accepted')
                  .set('authorization', 'Bearer ' + token)
                  .expect(200)
                  .expect('Content-Type', /json/)
                  .end((err, res) => {
                    res.body.should.have.length(1);
                    done(err);
                  });
              });
            });
          });

          describe('=refused', function () {
            it('should respond zero element', function (done) {
              request(app)
                .get('/api/sessions?filter=refused')
                .set('authorization', 'Bearer ' + token)
                .expect(200)
                .expect('Content-Type', /json/)
                .end((err, res) => {
                  res.body.should.have.length(0);
                  done(err);
                });
            });

            it('should respond one element', function (done) {
              invitation.setRefused();
              session.invitations = [invitation];
              session.saveAsync().then(function (result) {
                request(app)
                  .get('/api/sessions?filter=refused')
                  .set('authorization', 'Bearer ' + token)
                  .expect(200)
                  .expect('Content-Type', /json/)
                  .end((err, res) => {
                    res.body.should.have.length(1);
                    done(err);
                  });
              });
            });
          });
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

    it('should add invitation for creator', function () {
      newSession.invitations.should.have.length(1);
      newSession.invitations[0].should.have.property('state', 1);
      newSession.invitations[0].should.have.property('userInvited', user._id.toString());
      newSession.invitations[0].should.have.property('byUser', user._id.toString());
    });

    describe('/:id/invitation', function () {
      var secondUser;

      beforeEach(function () {
        secondUser = new User({
          name: 'Fake User',
          email: 'test@example.com',
          password: 'password'
        });
      });

      beforeEach(function (done) {
        request(app)
          .post('/api/sessions/' + newSession._id + '/invitation')
          .set('authorization', 'Bearer ' + token)
          .send({
            userInvited: secondUser._id,
            byUser: user._id
          })
          .expect(201)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            newSession = res.body;
            done(err);
          });
      });

      it('should add an invitation', function () {
        newSession.invitations.should.have.length(2);
      });

      it('should respond 401 if user already added', function (done) {
        request(app)
          .post('/api/sessions/' + newSession._id + '/invitation')
          .set('authorization', 'Bearer ' + token)
          .send({
            userInvited: secondUser._id,
            byUser: user._id
          })
          .expect(401)
          .end(done);
      });
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


    describe('/invitation/:invitationId', function () {
      beforeEach(function (done) {
        request(app)
          .put('/api/sessions/' + newSession._id + '/invitation/' + updatedSession.invitations[0]._id)
          .send({
            state: 2
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            updatedSession = res.body;
            done();
          });
      });

      it('should respond with the updated session', function () {
        updatedSession.invitations[0].state.should.equal(2);
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
