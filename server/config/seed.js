/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import Sport from '../api/sport/sport.model';

User.find({}).removeAsync()
  .then(() => {
    User.createAsync({
        provider: 'local',
        name: 'Test User',
        email: 'test@example.com',
        password: 'test'
      }, {
        provider: 'local',
        role: 'admin',
        name: 'Admin',
        email: 'admin@example.com',
        password: 'admin'
      })
      .then(() => {
        console.log('finished populating users');
      });
  });

Sport.updateAsync({
  name: 'running'
}, {
  name: 'running'
}, {
  upsert: true
});

Sport.updateAsync({
  name: 'cycling'
}, {
  name: 'cycling'
}, {
  upsert: true
});

Sport.updateAsync({
  name: 'soccer'
}, {
  name: 'soccer'
}, {
  upsert: true
});
