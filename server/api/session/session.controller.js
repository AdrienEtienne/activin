/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/sessions              ->  index
 * POST    /api/sessions              ->  create
 * GET     /api/sessions/:id          ->  show
 * PUT     /api/sessions/:id          ->  update
 * DELETE  /api/sessions/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Session from './session.model';

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

// Gets a list of Sessions
export function index(req, res) {
  Session.findAsync({
      createdBy: req.user._id
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Session from the DB
export function show(req, res) {
  Session.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Session in the DB
export function create(req, res) {
  Session.createAsync(_.merge(req.body, {
      createdBy: req.user._id
    }))
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Session in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Session.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Session from the DB
export function destroy(req, res) {
  Session.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
