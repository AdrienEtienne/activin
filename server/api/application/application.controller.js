/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/applications              ->  index
 * POST    /api/applications              ->  create
 * GET     /api/applications/:id          ->  show
 * PUT     /api/applications/:id          ->  update
 * DELETE  /api/applications/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Application from './application.model';

import fs from 'fs';
import mongoose from 'mongoose';
import Grid from 'gridfs-stream';

var gfs;
Grid.mongo = mongoose.mongo;
mongoose.connection.once('open', function () {
  gfs = Grid(mongoose.connection.db);
})

const root = 'applications';

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

// Gets a list of Applications
export function index(req, res) {
  Application.findAsync({
      platform: req.params.platform
    })
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Application from the DB
export function show(req, res) {
  Application.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Application in the DB
export function create(req, res) {
  var body = req.body;
  var file = req.file;

  // streaming to gridfs
  var ws = gfs.createWriteStream({
    filename: file.filename,
    root: root
  });

  ws.on('close', function (file) {
    fs.unlinkSync(req.file.path);
    body.file = file._id;
    Application.createAsync(body)
      .then(respondWithResult(res, 201))
      .catch(err => {
        gfs.remove({
          _id: file._id,
          root: root
        }, function () {
          handleError(res)(err);
        });
      });
  });

  fs.createReadStream(req.file.path).pipe(ws);
}

// Updates an existing Application in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Application.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Application from the DB
export function destroy(req, res) {
  Application.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
