/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Sport from '../api/sport/sport.model';
import Workout from '../api/workout/workout.model';
import Invitation from '../api/workout/invitation.model';

var user1, user2;
var sports;
var workout1, workout2;

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

function createWorkouts() {
  return Workout.find({}).removeAsync()
    .then(() => {
      return Workout.createAsync({
          createdBy: user2._id,
          name: 'Workout 1',
          sport: sports[0],
          dateStart: new Date(new Date().getTime() - 6000000),
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
          name: 'Workout 2',
          sport: sports[0],
          dateStart: new Date(new Date().getTime() + 6000000),
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
        .then((workouts) => {
          workout1 = workouts[0];
          workout2 = workouts[1];
          console.log('finished populating workouts');
        })
        .catch(err => {
          console.log('error populating workouts');
        });
    });
}

setTimeout(function () {
  findSports()
    .then(createUsers)
    .then(createWorkouts);
}, 1000);
