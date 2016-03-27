'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';

var newSearch;

describe('Search parners API:', function () {

  describe('POST /api/searchs/partners', function () {
    var user, sports;

    // Get sports
    before(function () {
      return Sport.findAsync().then(function (results) {
        sports = results;
        return;
      });
    });

    // Clear users before testing
    before(function () {
      return User.removeAsync().then(function () {
        user = new User({
          name: 'Fake User',
          email: 'test@example.com',
          password: 'password',
          location: [0, 0]
          role: 'admin',
          sports: results
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

    it('should respond with no users', function (done) {
      request(app)
        .get('/api/searchs/details?placeid=' + prediction.placeid)
        .set('authorization', 'Bearer ' + token)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          res.body.placeid.should.equal(prediction.placeid);
          done(err);
        });
    });

  });
});
