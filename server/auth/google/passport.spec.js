'use strict';

var thisPassport = require('./passport');
var Strategies = require('passport-google-oauth');
import passport from 'passport';
import User from '../../api/user/user.model';

var user;
var genUser = function () {
  user = new User({
    provider: 'google',
    name: 'Fake User',
    email: 'test@example.com',
    password: 'password',
    google: {
      id: 'id'
    }
  });
  return user;
};

describe('Auth: google', function () {
  var config;
  var strategy;
  var accessToken, refreshToken, profile, callback = function () {},
    err;

  beforeEach(function () {
    return User.removeAsync();
  });

  beforeEach(function () {
    config = {
      google: {
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
    Strategies.OAuth2Strategy = function toto(arg, cb) {
      cb(accessToken, refreshToken, profile, callback);

      this.userProfile = function (_accessToken, cb) {
        accessToken = _accessToken;
        cb(err, profile);
      };
    };
  });

  it('should return user', function (done) {
    genUser();
    profile = {
      id: 'id',
      displayName: 'displayName',
      emails: [{
        value: 'mail@mail.com'
      }],
      _json: {
        id: 'id'
      }
    };
    callback = function (err, gauser) {
      gauser._id.toString().should.equal(user._id.toString());
      done();
    };
    user.saveAsync()
      .then(function () {
        thisPassport.setup(User, config);
      });
  });

  it('should return new user ', function (done) {
    callback = function (err, gauser) {
      gauser.name.should.equal('displayName');
      done();
    };

    profile = {
      id: 'id',
      displayName: 'displayName',
      emails: [{
        value: 'mail@mail.com'
      }],
      _json: {
        id: 'id'
      }
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

  describe('getUser', function () {
    beforeEach(function () {
      genUser();
      return user.saveAsync();
    })

    it('should return the user', function (done) {
      profile = {
        id: 'id',
        emails: [{
          value: 'mail@mail.com'
        }],
        _json: {}
      }
      thisPassport.getUser(accessToken, refreshToken, function (err, result) {
        user._id.toString().should.equal(result._id.toString());
        done(err);
      });
    });
  });
});