'use strict';

import app from '../..';
import User from './user.model';
var user;
var genUser = function () {
  user = new User({
    provider: 'local',
    name: 'Fake User',
    email: 'test@example.com',
    password: 'password'
  });
  return user;
};

describe('User Model', function () {
  before(function () {
    // Clear users before testing
    return User.removeAsync();
  });

  beforeEach(function () {
    genUser();
  });

  afterEach(function () {
    return User.removeAsync();
  });

  it('profile should return the name and the role', function () {
    user.profile.should.deep.equal({
      'name': user.name,
      'role': user.role
    });
  });

  it('token should return the id and the role', function () {
    user.token.should.deep.equal({
      '_id': user._id,
      'role': user.role
    });
  });

  it('should begin with no users', function () {
    return User.findAsync({}).should
      .eventually.have.length(0);
  });

  it('should fail when saving a duplicate user', function () {
    return user.saveAsync()
      .then(function () {
        var userDup = genUser();
        return userDup.saveAsync();
      }).should.be.rejected;
  });

  describe('#email', function () {
    it('should fail when saving without an email', function () {
      user.email = '';
      return user.saveAsync().should.be.rejected;
    });

    it('should pass when saving without an email and provider != local', function () {
      user.email = '';
      user.provider = 'google';
      return user.saveAsync();
    });
  });

  describe('#password', function () {
    beforeEach(function () {
      return user.saveAsync();
    });

    it('should return error if password empty', function () {
      user.password = undefined;
      return user.saveAsync().should.be.rejected;
    });

    it('should save user if no password and provider != local', function () {
      user = new User({
        provider: 'google',
        name: 'Fake User',
        email: 'toto@example.com',
      })
      return user.saveAsync();
    });

    it('should authenticate user if valid', function () {
      user.authenticate('password').should.be.true;
    });

    it('should not authenticate user if invalid', function () {
      user.authenticate('blah').should.not.be.true;
    });

    it('should remain the same hash unless the password is updated', function () {
      user.name = 'Test User';
      return user.saveAsync()
        .spread(function (u) {
          return u.authenticate('password');
        }).should.eventually.be.true;
    });
  });

});