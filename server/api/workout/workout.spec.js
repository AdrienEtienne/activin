'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';
import Workout from './workout.model';
import Invitation from './invitation.model';

var newWorkout;

describe('Workout API:', function () {
  var user;
  var token;
  var sports;

  var workout;
  var genWorkout = function (data) {
    var doc = data || {
      createdBy: user,
      name: 'New Workout',
      sport: sports[0],
      dateStart: new Date(new Date().getTime() + 60000)
    }
    workout = new Workout(doc);
    return workout;
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
  before('Remove Workout', function () {
    return Workout.removeAsync();
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

  describe('GET /api/workouts', function () {
    var workouts;

    beforeEach(function (done) {
      request(app)
        .get('/api/workouts')
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          workouts = res.body;
          done();
        });
    });

    it('should respond with JSON array', function () {
      workouts.should.be.instanceOf(Array);
    });

    describe('query', function () {
      beforeEach(function () {
        genWorkout();
        genInvitation();
      });

      afterEach('Remove Workouts', function () {
        return Workout.removeAsync();
      });

      describe('?next', function () {
        describe('=true', function () {
          beforeEach(function () {
            return workout.saveAsync();
          });

          it('should respond only one element', function (done) {
            request(app)
              .get('/api/workouts?next=true')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body.should.have.length(1);
                res.body[0]._id.should.equal(workout._id.toString());
                done(err);
              });
          });
        });

        describe('=false', function () {
          beforeEach(function () {
            workout.dateStart = new Date(new Date().getTime() - 60000);
            return workout.saveAsync();
          });

          it('should respond only one element', function (done) {
            request(app)
              .get('/api/workouts?next=false')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body.should.have.length(1);
                res.body[0]._id.should.equal(workout._id.toString());
                done(err);
              });
          });

          it('should respond no element', function (done) {
            request(app)
              .get('/api/workouts?next=true')
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

      describe('?scope', function () {
        describe('?id', function () {
          beforeEach(function () {
            return workout.saveAsync();
          });

          it('should respond only element id only', function (done) {
            request(app)
              .get('/api/workouts?scope=id')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].should.have.property('_id');
                done(err);
              });
          });
        });

        describe('=invitation', function () {
          beforeEach(function () {
            workout.invitations = [invitation];
            return workout.saveAsync();
          });

          it('should respond only element id only', function (done) {
            request(app)
              .get('/api/workouts?scope=invitation')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].invitations[0]._id.should.equal(invitation._id.toString());
                done(err);
              });
          });
        });

        describe('=user', function () {
          beforeEach(function () {
            return workout.saveAsync();
          });

          it('should respond with user info', function (done) {
            request(app)
              .get('/api/workouts?scope=user')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].createdBy.name.should.equal(user.name);
                done(err);
              });
          });
        });

        describe('=sport', function () {
          beforeEach(function () {
            return workout.saveAsync();
          });

          it('should respond with sport', function (done) {
            request(app)
              .get('/api/workouts?scope=sport')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].sport.name.should.equal(sports[0].name);
                done(err);
              });
          });
        });

        describe('=invitation', function () {
          beforeEach(function () {
            workout.invitations = [invitation];
            return workout.saveAsync();
          });

          it('should respond only element id only', function (done) {
            request(app)
              .get('/api/workouts?scope=invitation')
              .set('authorization', 'Bearer ' + token)
              .expect(200)
              .expect('Content-Type', /json/)
              .end((err, res) => {
                res.body[0].invitations[0]._id.should.equal(invitation._id.toString());
                done(err);
              });
          });
        });
      });

      describe('?filter', function () {
        beforeEach(function () {
          workout.invitations = [invitation];
          return workout.saveAsync();
        });

        describe('=unknown', function () {
          it('should respond one element', function (done) {
            request(app)
              .get('/api/workouts?filter=unknown')
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
            workout.invitations = [invitation];
            workout.saveAsync().then(function (result) {
              request(app)
                .get('/api/workouts?filter=unknown')
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
              .get('/api/workouts?filter=accepted')
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
            workout.invitations = [invitation];
            workout.saveAsync().then(function (result) {
              request(app)
                .get('/api/workouts?filter=accepted')
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
              .get('/api/workouts?filter=refused')
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
            workout.invitations = [invitation];
            workout.saveAsync().then(function (result) {
              request(app)
                .get('/api/workouts?filter=refused')
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

      describe('?sports', function () {
        beforeEach(function () {
          return workout.saveAsync();
        });

        it('should respond one sport', function (done) {
          request(app)
            .get('/api/workouts?sports=' + [workout.sport._id.toString()])
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(1);
              done(err);
            });
        });

        it('should respond zero element if sport not matching', function (done) {
          request(app)
            .get('/api/workouts?sports=' + [sports[2]._id.toString()])
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
  });

  describe('POST /api/workouts', function () {
    beforeEach(function (done) {
      request(app)
        .post('/api/workouts')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Workout',
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
          newWorkout = res.body;
          done();
        });
    });

    it('should respond with the newly created workout', function () {
      newWorkout.name.should.equal('New Workout');
      newWorkout.sport.should.equal(sports[0]._id.toString());
    });

    it('should respond error if no sport', function (done) {
      request(app)
        .post('/api/workouts')
        .set('authorization', 'Bearer ' + token)
        .send({
          name: 'New Workout',
          dateStart: new Date(),
          dateStop: new Date()
        })
        .expect(500)
        .expect('Content-Type', /json/)
        .end(done);
    });

    it('should add invitation for creator', function () {
      newWorkout.invitations.should.have.length(1);
      newWorkout.invitations[0].should.have.property('state', 1);
      newWorkout.invitations[0].should.have.property('userInvited', user._id.toString());
      newWorkout.invitations[0].should.have.property('byUser', user._id.toString());
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
          .post('/api/workouts/' + newWorkout._id + '/invitation')
          .set('authorization', 'Bearer ' + token)
          .send({
            userInvited: secondUser._id
          })
          .expect(201)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            newWorkout = res.body;
            done(err);
          });
      });

      it('should add an invitation', function () {
        newWorkout.invitations.should.have.length(2);
      });

      it('should respond 401 if user already added', function (done) {
        request(app)
          .post('/api/workouts/' + newWorkout._id + '/invitation')
          .set('authorization', 'Bearer ' + token)
          .send({
            userInvited: secondUser._id
          })
          .expect(401)
          .end(done);
      });
    });
  });

  describe('GET /api/workouts/:id', function () {
    var workout;

    beforeEach(function (done) {
      request(app)
        .get('/api/workouts/' + newWorkout._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          workout = res.body;
          done();
        });
    });

    afterEach(function () {
      workout = {};
    });

    it('should respond with the requested workout', function () {
      newWorkout.name.should.equal('New Workout');
      newWorkout.sport.should.equal(sports[0]._id.toString());
    });

    it('should respond 500 if fake id', function (done) {
      request(app)
        .get('/api/workouts/fakeId')
        .expect(500)
        .expect('Content-Type', /json/)
        .end(done);
    });

    describe('GET /api/workouts/:id/invitation', function () {
      var invitation;

      beforeEach(function (done) {
        request(app)
          .get('/api/workouts/' + newWorkout._id + '/invitation')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            invitation = res.body;
            done();
          });
      });

      afterEach(function () {
        invitation = {};
      });

      it('should respond with the requested workout', function () {
        invitation._id.should.equal(newWorkout.invitations[0]._id.toString());
      });

      it('should respond 404 if no workout', function (done) {
        genWorkout()
          .saveAsync()
          .then(function (workout) {
            request(app)
              .get('/api/workouts/' + workout[0]._id + '/invitation')
              .set('authorization', 'Bearer ' + token)
              .expect(404)
              .end(done);
          });
      });
    });
  });

  describe('PUT /api/workouts/:id', function () {
    var updatedWorkout;

    beforeEach(function (done) {
      request(app)
        .put('/api/workouts/' + newWorkout._id)
        .send({
          _id: newWorkout._id,
          name: 'Updated Workout',
          sport: sports[1]._id
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          if (err) {
            return done(err);
          }
          updatedWorkout = res.body;
          done();
        });
    });

    afterEach(function () {
      updatedWorkout = {};
    });

    it('should respond with the updated workout', function () {
      updatedWorkout.name.should.equal('Updated Workout');
      updatedWorkout.sport.should.equal(sports[1]._id.toString());
    });

    it('should update without id', function (done) {
      request(app)
        .put('/api/workouts/' + newWorkout._id)
        .send({
          name: 'Updated Workout2'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function (err, res) {
          updatedWorkout = res.body;
          updatedWorkout.name.should.equal('Updated Workout2');
          done();
        });
    });

    describe('/invitation/:invitationId', function () {
      beforeEach(function (done) {
        request(app)
          .put('/api/workouts/' + newWorkout._id + '/invitation/' + updatedWorkout.invitations[0]._id)
          .send({
            state: 2
          })
          .expect(200)
          .expect('Content-Type', /json/)
          .end(function (err, res) {
            updatedWorkout = res.body;
            done();
          });
      });

      it('should respond with the updated workout', function () {
        updatedWorkout.invitations[0].state.should.equal(2);
      });
    });

  });

  describe('DELETE /api/workouts/:id', function () {

    it('should respond with 204 on successful removal', function (done) {
      request(app)
        .delete('/api/workouts/' + newWorkout._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when workout does not exist', function (done) {
      request(app)
        .delete('/api/workouts/' + newWorkout._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    describe('/invitation/invitationId', function () {
      beforeEach(function () {
        genWorkout();
        genInvitation();
        workout.invitations = [invitation];
        return workout.saveAsync();
      });

      it('should respond with 204 on successful removal', function (done) {
        request(app)
          .delete('/api/workouts/' + workout._id + '/invitation/' + invitation._id)
          .expect(204)
          .end(done);
      });

      it('should remove the invitation', function (done) {
        request(app)
          .delete('/api/workouts/' + workout._id + '/invitation/' + invitation._id)
          .expect(204)
          .end((err, res) => {
            Workout.findByIdAsync(workout._id)
              .then(function (workout) {
                workout.invitations.should.have.length(0);
                done(err);
              });
          });
      });
    });
  });

});