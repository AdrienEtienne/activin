/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Sport from '../api/sport/sport.model';
import Session from '../api/session/session.model';
import Invitation from '../api/session/invitation.model';

var user1, user2;
var sports;
var session1, session2;

function findSports() {
  return Sport.findAsync()
    .then(result => {
      console.log('finished find sports : ', result.length);
      sports = result;
    });
}

function createUsers() {
  return User.find({}).removeAsync()
    .then(() => {
      return User.createAsync({
          provider: 'local',
          name: 'Test User',
          email: 'test@example.com',
          password: 'tester',
          sports: [sports[0]]
        }, {
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: 'admin@example.com',
          password: 'admin',
          sports: sports
        })
        .then((users) => {
          user1 = users[0];
          user2 = users[1];
          console.log('finished populating users');
          return users;
        })
        .catch(err => {
          console.log('error populating users');
        });
    });
}

function createSessions() {
  return Session.find({}).removeAsync()
    .then(() => {
      return Session.createAsync({
          createdBy: user2._id,
          name: 'Session 1',
          sport: sports[0],
          dateStart: new Date(new Date().getTime() - 60000),
          invitations: [new Invitation({
            userInvited: user2,
            byUser: user2,
            state: 1
          }), new Invitation({
            userInvited: user1,
            byUser: user2,
            state: 2
          })]
        }, {
          createdBy: user2._id,
          name: 'Session 2',
          sport: sports[0],
          dateStart: new Date(new Date().getTime() + 600000),
          invitations: [new Invitation({
            userInvited: user2,
            byUser: user2,
            state: 1
          }), new Invitation({
            userInvited: user1,
            byUser: user2,
            state: 0
          })]
        })
        .then((sessions) => {
          session1 = sessions[0];
          session2 = sessions[1];
          console.log('finished populating sessions');
        })
        .catch(err => {
          console.log('error populating sessions');
        });
    });
}

setTimeout(function () {
  findSports()
    .then(createUsers)
    .then(createSessions);
}, 1000);