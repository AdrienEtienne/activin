'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';

describe('Search partners API:', function () {
  var user1, user2, sports;
  var token;

  // Get sports
  before(function () {
    return Sport.findAsync().then(function (results) {
      sports = results;
      return;
    });
  });

  before(function () {
    return User.removeAsync();
  });

  // Clear users before testing
  before(function () {
    user1 = new User({
      name: 'user1',
      email: 'user1@example.com',
      password: 'password',
      location: [0, 0],
      sports: [sports[0], sports[1]]
    });

    return user1.saveAsync();
  });

  before(function () {
    user2 = new User({
      name: 'user2',
      email: 'user2@example.com',
      password: 'password',
      location: [0, 0],
      sports: sports
    });

    return user2.saveAsync();
  });

  beforeEach(function () {
    user1.location = [0, 0];
    user1.sports = [sports[0], sports[1]];

    return user1.saveAsync();
  });

  beforeEach(function () {
    // 1.112km from [0, 0]
    user2.location = [0, 0.01];
    user2.sports = sports;

    return user2.saveAsync();
  });

  before(function (done) {
    request(app)
      .post('/auth/local')
      .send({
        email: 'user1@example.com',
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
  after(function () {
    return User.removeAsync();
  });

  it('should have two user', function (done) {
    User.findAsync().then((results) => {
      results.should.have.length(2);
      done();
    });
  });

  it('should return an user with _id/name/role/distance/sports', function (done) {
    request(app)
      .post('/api/searchs/partners')
      .set('authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        res.body[0].should.have.property('_id')
        res.body[0].should.have.property('name')
        res.body[0].should.have.property('distance')
        res.body[0].should.have.property('sports')
        res.body[0].should.not.have.property('email')
        done(err);
      });
  });

  it('should return an user with good distance', function (done) {
    request(app)
      .post('/api/searchs/partners')
      .set('authorization', 'Bearer ' + token)
      .expect(200)
      .expect('Content-Type', /json/)
      .end((err, res) => {
        res.body[0].distance.should
          .be.above(1.1)
          .and.be.below(1.2);
        done(err);
      });
  });

  describe('POST /api/searchs/partners', function () {
    describe('User filter', function () {
      it('should return an array', function (done) {
        request(app)
          .post('/api/searchs/partners')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            res.body.should.have.length(1);
            done(err);
          });
      });
    });

    describe('Sports filter', function () {
      it('should return user if only one sport match', function (done) {
        user2.sports = [sports[0]];
        user2.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(1);
              done(err);
            });
        });
      });

      it('should not return user if sports does not match', function (done) {
        user2.sports = [sports[2]];
        user2.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(0);
              done(err);
            });
        });
      });

      it('should not return user2 do not have sports', function (done) {
        user2.sports = [];
        user2.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(0);
              done(err);
            });
        });
      });

      it('should return error if user do not have sports', function (done) {
        user1.sports = [];
        user1.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .expect(405)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.message.should.equal('No sports selected');
              done(err);
            });
        });
      });
    });

    describe('Location filter', function () {
      it('should return user if minor than 2 km', function (done) {
        request(app)
          .post('/api/searchs/partners')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            res.body.should.have.length(1);
            done(err);
          });
      });

      it('should not return users if too far', function (done) {
        // 2.224km from [0, 0]
        user2.location = [0, 0.02];
        user2.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .expect(200)
            .expect('Content-Type', /json/)
            .end((err, res) => {
              res.body.should.have.length(0);
              done(err);
            });
        });
      });

      it('should return user if distance set at ', function (done) {
        // 2.224km from [0, 0]
        user2.location = [0, 0.02];
        user2.saveAsync().then(() => {
          request(app)
            .post('/api/searchs/partners')
            .set('authorization', 'Bearer ' + token)
            .send({
              distance: 3
            })
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
