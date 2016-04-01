'use strict';

import express from 'express';
import passport from 'passport';
import {
  getUser
}
from './passport';
import {
  signToken,
  setTokenCookie
}
from '../auth.service';

var router = express.Router();

router
  .get('/', passport.authenticate('google', {
    failureRedirect: '/signup',
    scope: [
      'profile',
      'email'
    ],
    session: false
  }))
  .get('/client', (req, res) => {
    var access_token = req.query.access_token;
    if (access_token) {
      getUser(access_token, null, (err, user) => {

        if (err) {
          return res.status(401).json(err);
        } else {
          var token = signToken(user._id, user.role);
          return res.json({
            token
          });
        }
      })
    } else {
      return res.status(400).json(new Error('No access_token provided'));
    }
  })
  .get('/callback', passport.authenticate('google', {
    failureRedirect: '/signup',
    session: false
  }), setTokenCookie);

export default router;