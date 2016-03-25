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
import Place from './place.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function saveUpdates(updates) {
  return function (entity) {
    var updated = _.merge(entity, updates);
    updated.markModified('location');
    return updated.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.removeAsync()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Places
export function index(req, res) {
  Place.findAsync({
      user: req.user._id
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Place from the DB
export function show(req, res) {
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Place in the DB
export function create(req, res) {
  var userId = req.user._id;
  var place = req.body;
  place.user = userId;
  Place.createAsync(place)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Place in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Place.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Place from the DB
export function destroy(req, res) {
  Place.findOneAsync({
      user: req.user._id,
      _id: req.params.id
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
