/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/places              ->  index
 * POST    /api/places              ->  create
 * GET     /api/places/:id          ->  show
 * PUT     /api/places/:id          ->  update
 * DELETE  /api/places/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import User from '../user/user.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

function distance(long, lat, long, lat) {

}

// Gets a list of Places
export function index(req, res) {
  var userId = req.user._id;
  var sports = req.user.sports || [];
  var location = req.user.location || [];

  // km
  var distance = req.body.distance || 2;

  var query = User.find();

  if (sports.length === 0) {
    return handleError(res, 405)({
      message: 'No sports selected'
    });
  }

  query = query.where('_id').ne(userId);
  query = query.where('sports').in(sports);

  if (location) {
    query = query.where('location').near({
      center: {
        type: 'Point',
        coordinates: location
      },

      // Converting meters to miles. Specifying spherical geometry (for globe)
      maxDistance: distance * 1000,
      spherical: true
    });
  }


  query.execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}
