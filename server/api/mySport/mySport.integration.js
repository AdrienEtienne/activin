'use strict';

var app = require('../..');
import request from 'supertest';
import User from '../user/user.model';
import Sport from '../sport/sport.model';

var newMySport;

describe('MySport API:', function () {
  var user;
  var token;
  var sport1, sport2;

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

  // Clear users after testing
  after('Remove User', function () {
    return User.removeAsync();
  });

  before('Remove all sports', function () {
    return Sport.removeAsync();
  });


  before('Create sport', function (done) {
    Sport.create({
      name: 'sport1'
    }, function (err, sport) {
      sport1 = sport;
      Sport.create({
        name: 'sport2'
      }, function (err, sport) {
        sport2 = sport;
        done(err);
      });
    });
  });

  // Clear users after testing
  after('Remove Sport', function () {
    return Sport.removeAsync();
  });

  describe('GET /api/mySports', function () {
    var mySports;

    describe('/mine', function () {
      beforeEach('Get mySports', function (done) {
        request(app)
          .get('/api/mySports/mine')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            mySports = res.body;
            done();
          });
      });

      it('should respond with JSON array', function () {
        mySports.should.be.instanceOf(Array);
      });

      it('should respond 401 when no authorization', function (done) {
        request(app)
          .get('/api/mySports/mine')
          .expect(401)
          .end(done);
      });

      it('should respond 200 for selection', function (done) {
        request(app)
          .post('/api/mySports/select/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(done);
      });

      it('should contain the good sport', function () {
        mySports.should.have.length(1);
        mySports[0]._id.should.equal(sport1._id.toString());
      });

      it('should respond 204 for unselection', function (done) {
        request(app)
          .post('/api/mySports/unselect/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should not contain sports', function () {
        mySports.should.have.length(0);
      });
    });

    describe('/noneMine', function () {
      beforeEach('Get mySports', function (done) {
        request(app)
          .get('/api/mySports/noneMine')
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .expect('Content-Type', /json/)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            mySports = res.body;
            done();
          });
      });

      it('should contain the good sport', function () {
        mySports.should.have.length(2);
        mySports[0]._id.should.equal(sport1._id.toString());
        mySports[1]._id.should.equal(sport2._id.toString());
      });

      it('should respond 401 when no authorization', function (done) {
        request(app)
          .get('/api/mySports/noneMine')
          .expect(401)
          .end(done);
      });

      it('should respond 200 for selection', function (done) {
        request(app)
          .post('/api/mySports/select/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end(done);
      });

      it('should contain the good sport', function () {
        mySports.should.have.length(1);
        mySports[0]._id.should.equal(sport2._id.toString());
      });

      it('should respond 204 for unselection', function (done) {
        request(app)
          .post('/api/mySports/unselect/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should contain 2 sports', function () {
        mySports.should.have.length(2);
      });
    });
  });

  describe('POST /api/mySports', function () {
    describe('/select', function () {
      it('should respond 200 with sport', function (done) {
        request(app)
          .post('/api/mySports/select/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(200)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            var mySport = res.body;
            console.log(res.body)
            mySport._id.should.equal(sport1._id.toString());
            done();
          });
      });

      it('should respond 304 if already selected', function (done) {
        request(app)
          .post('/api/mySports/select/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(304)
          .end(done);
      });

      it('should respond 404 if id NOT FOUND', function (done) {
        request(app)
          .post('/api/mySports/select/' + user._id)
          .set('authorization', 'Bearer ' + token)
          .expect(404)
          .end(done);
      });

      it('should respond 500 if id error', function (done) {
        request(app)
          .post('/api/mySports/select/donotexist')
          .set('authorization', 'Bearer ' + token)
          .expect(500)
          .end(done);
      });
    });

    describe('/unselect', function () {
      it('should respond 200', function (done) {
        request(app)
          .post('/api/mySports/unselect/' + sport1._id)
          .set('authorization', 'Bearer ' + token)
          .expect(204)
          .end(done);
      });

      it('should respond 404 if NOT FOUND', function (done) {
        request(app)
          .post('/api/mySports/unselect/' + sport2._id)
          .set('authorization', 'Bearer ' + token)
          .expect(404)
          .end(done);
      });

      it('should respond 500 if id error', function (done) {
        request(app)
          .post('/api/mySports/unselect/donotexist')
          .set('authorization', 'Bearer ' + token)
          .expect(500)
          .end(done);
      });
    });
  });
});
