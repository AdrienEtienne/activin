/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/sports              ->  index
 * POST    /api/sports              ->  create
 * GET     /api/sports/:id          ->  show
 * PUT     /api/sports/:id          ->  update
 * DELETE  /api/sports/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Sport from './sport.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      console.log('TOTO')
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

// Gets a list of Sports
export function index(req, res) {
  Sport.findAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Sport from the DB
export function show(req, res) {
  Sport.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}
