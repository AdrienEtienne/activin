'use strict';

import app from '../..';
import User from '../user/user.model';
import Invitation from './invitation.model';

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

var invitation;
var genInvitation = function () {
  invitation = new Invitation({
    userInvited: user,
    byUser: user
  });
  return invitation;
};

describe('Invitation Model', function () {
  before(function () {
    return Invitation.removeAsync();
  });

  beforeEach(function () {
    genUser();
    genInvitation();
  });

  it('should begin with no Invitation', function () {
    return Invitation.findAsync({}).should
      .eventually.have.length(0);
  });

  describe('#userInvited', function () {
    it('should fail when saving without userInvited', function () {
      invitation.userInvited = null;
      return invitation.saveAsync().should.be.rejected;
    });
  });

  describe('#byUser', function () {
    it('should fail when saving without byUser', function () {
      invitation.byUser = null;
      return invitation.saveAsync().should.be.rejected;
    });
  });

  describe('setAccepted()', function () {
    it('should change the state to 1', function () {
      invitation.setAccepted();
      invitation.state.should.equal(1);
    });
  });

  describe('setRefused()', function () {
    it('should change the state to 2', function () {
      invitation.setRefused();
      invitation.state.should.equal(2);
    });
  });

  describe('filterState(states)', function () {
    it('should return all states', function () {
      Invitation.filterState().should.deep.equal([0, 1, 2]);
      Invitation.filterState('').should.deep.equal([0, 1, 2]);
      Invitation.filterState(null).should.deep.equal([0, 1, 2]);
      Invitation.filterState(undefined).should.deep.equal([0, 1, 2]);
    });

    it('should return Unknown state', function () {
      Invitation.filterState('unknown').should.deep.equal([0]);
    });
    it('should return Accepted state', function () {
      Invitation.filterState('accepted').should.deep.equal([1]);
    });
    it('should return Refused state', function () {
      Invitation.filterState('refused').should.deep.equal([2]);
    });
  });
});
