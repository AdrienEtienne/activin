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
      sports: sports
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

  describe('POST /api/searchs/partners', function () {
    describe('User filter', function () {
      it('should return an array', function (done) {
        request(app)
          .post('/api/searchs/partners')
          .send({})
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
