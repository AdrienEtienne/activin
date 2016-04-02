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
import Invitation from './invitation.model';

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
  var next = req.query.next === 'true' ? true : false;
  var scope = null;

  if (req.query.scope && req.query.scope === 'id') {
    scope = '_id';
  } else if (req.query.scope && req.query.scope === 'invitation') {
    scope = '-invitations.userInvited -invitations.byUser';
  }

  var query = Session.find({
    createdBy: req.user._id
  });

  if (scope) {
    query = query.select(scope);
  }

  if (next) {
    query = query.where({
      "dateStart": {
        "$gte": new Date()
      }
    });
  }

  if (req.query.filter) {
    var invitationStates = Invitation.filterState(req.query.filter);
    query = query.where({
      'invitations.state': {
        '$in': invitationStates
      }
    });
  }

  query.execAsync()
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
  var userId = req.user._id;
  var body = req.body;

  body.createdBy = userId;
  var invitation = new Invitation({
    userInvited: userId,
    byUser: userId
  });
  invitation.setAccepted();
  body.invitations = [invitation];

  Session.createAsync(body)
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
