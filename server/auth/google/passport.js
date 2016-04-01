import passport from 'passport';
import {
  OAuth2Strategy as GoogleStrategy
}
from 'passport-google-oauth';

var strategy, User;

function findUser(accessToken, refreshToken, profile, done) {
  User.findOneAsync({
      'google.id': profile.id
    })
    .then(user => {
      if (user) {
        user.google = {
          id: profile._json.id,
          accessToken: accessToken,
          refreshToken: refreshToken,
          email: profile.emails[0].value,
          name: profile.displayName
        };
      } else {
        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'user',
          username: profile.emails[0].value.split('@')[0],
          provider: 'google',
          google: {
            id: profile._json.id,
            accessToken: accessToken,
            refreshToken: refreshToken,
            email: profile.emails[0].value,
            name: profile.displayName
          }
        });
      }

      user.saveAsync()
        .then(user => done(null, user[0]))
        .catch(err => done(err));
    })
    .catch(err => done(err));
}

export function setup(UserModel, config) {
  User = UserModel;
  strategy = new GoogleStrategy({
    clientID: config.google.clientID,
    clientSecret: config.google.clientSecret,
    callbackURL: config.google.callbackURL
  }, findUser)

  passport.use(strategy);
}

export function getUser(accessToken, refreshToken, done) {
  strategy.userProfile(accessToken, (err, profile) => {
    if (err) {
      return done(err);
    } else {
      return findUser(accessToken, refreshToken, profile, done);
    }
  });
}
