'use strict';

var thisPassport = require('./passport');
var Strategies = require('passport-facebook');
import passport from 'passport';
import User from '../../api/user/user.model';

var user;
var genUser = function () {
  user = new User({
    provider: 'facebook',
    name: 'Fake User',
    email: 'test@example.com',
    password: 'password',
    facebook: {
      id: 'id'
    }
  });
  return user;
};

describe('Auth: facebook', function () {
  var config;
  var strategy;
  var accessToken, refreshToken, profile, callback = function () {};

  beforeEach(function () {
    return User.removeAsync();
  });

  beforeEach(function () {
    config = {
      facebook: {
        clientID: 'id',
        clientSecret: 'secret',
        callbackURL: 'callbackURL'
      }
    };
  });

  beforeEach(function () {
    passport.use = function (_strategy) {
      strategy = _strategy;
    };
  });

  beforeEach(function () {
    Strategies.Strategy = function toto(arg, cb) {
      cb(accessToken, refreshToken, profile, callback);
    };
  });

  it('should return user', function (done) {
    genUser();
    profile = {
      id: 'id'
    };
    callback = function (err, fbuser) {
      fbuser._id.toString().should.equal(user._id.toString());
      done();
    };
    user.saveAsync()
      .then(function () {
        thisPassport.setup(User, config);
      });
  });

  it('should return new user ', function (done) {
    callback = function (err, fbuser) {
      fbuser.name.should.equal('displayName');
      done();
    };
    profile = {
      id: 'id',
      displayName: 'displayName',
      emails: [{
        value: 'mail@mail.com'
      }],
      _json: {}
    }
    thisPassport.setup(User, config);
  });

  it('should return error if no name', function (done) {
    callback = function (err) {
      should.exist(err);
      done();
    };
    profile = {
      id: 'id',
      emails: [{
        value: 'mail@mail.com'
      }],
      _json: {}
    }
    thisPassport.setup(User, config);
  });

});