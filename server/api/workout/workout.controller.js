/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/workouts              ->  index
 * POST    /api/workouts              ->  create
 * GET     /api/workouts/:id          ->  show
 * PUT     /api/workouts/:id          ->  update
 * DELETE  /api/workouts/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Workout from './workout.model';
import Invitation from './invitation.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function findInvitation(userId) {
  return function (workout) {
    var invitation = _.find(workout.invitations, function (invit) {
      return invit.userInvited.toString() === userId.toString();
    });
    if (invitation) {
      return invitation;
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

function saveUpdatesInvitation(invitationId, updates) {
  return function (entity) {
    _.map(entity.invitations, function (invit) {
      if (invit._id.toString() === invitationId) {
        _.merge(invit, updates);
        entity.markModified('invitations');
        return invit;
      } else {
        return invit;
      }
    });
    return entity.saveAsync()
      .spread(updated => {
        return updated;
      });
  };
}

function addInvitation(invitation, byUser) {
  var newInvitation = new Invitation(invitation);
  newInvitation.byUser = byUser;

  return function (entity) {
    var found = _.find(entity.invitations, function (invit) {
      return invit.userInvited.toString() === newInvitation.userInvited.toString();
    })

    if (found) {
      return null;
    } else {
      entity.invitations.push(newInvitation);
      entity.markModified('invitations');
      return entity.saveAsync()
        .spread(updated => {
          return updated;
        });
    }
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

function removeInvitation(res, invitationId) {
  return function (entity) {
    var removed = _.remove(entity.invitations, function (invitation) {
      return invitation._id.toString() === invitationId;
    });
    entity.markModified('invitations');
    return entity.saveAsync()
      .then(() => {
        res.status(204).end();
      });
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

function handleInvitationError(res) {
  return function (entity) {
    if (!entity) {
      res.status(401).end();
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

// Gets a list of Workouts
export function index(req, res) {
  var next = req.query.next === 'true' ? true : false;
  var past = req.query.next === 'false' ? true : false;
  var sports = req.query.sports ? req.query.sports.split(',') : null;

  var query = null;
  if (req.query.filter) {
    var invitationStates = Invitation.filterState(req.query.filter);
    query = Workout.find().where({
      'invitations': {
        '$elemMatch': {
          userInvited: req.user._id,
          state: {
            '$in': invitationStates
          }
        }
      }
    });
  } else {
    query = Workout.find({
      createdBy: req.user._id
    });
  }

  var scope = req.query.scope || '';

  if (scope.indexOf('id') !== -1) {
    query = query.select('_id');
  } else if (scope.length) {
    if (scope.indexOf('invitation') !== -1) {
      query = query.select('-invitations.userInvited -invitations.byUser');
    }
    if (scope.indexOf('user') !== -1) {
      query = query.populate('createdBy');
    }
    if (scope.indexOf('sport') !== -1) {
      query = query.populate('sport');
    }
  }

  if (next) {
    query = query.where({
      "dateStart": {
        "$gte": new Date()
      }
    });
  }

  if (past) {
    query = query.where({
      "dateStart": {
        "$lte": new Date()
      }
    });
  }

  if (sports) {
    console.log(sports);
    query = query.where({
      "sport": {
        "$in": sports
      }
    });
  }

  query.execAsync()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Workout from the DB
export function show(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single invitation from the DB
export function showInvitation(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(findInvitation(req.user._id))
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Workout in the DB
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

  Workout.createAsync(body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Creates a new Workout in the DB
export function createInvitation(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(addInvitation(req.body, req.user._id))
    .then(handleInvitationError(res))
    .then(respondWithResult(res, 201))
    .catch(handleError(res, 401));
}

// Updates an existing Workout in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Updates an existing Workout in the DB
export function updateInvitation(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(saveUpdatesInvitation(req.params.invitationId, req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Workout from the DB
export function destroy(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

// Deletes a Workout from the DB
export function destroyInvitation(req, res) {
  Workout.findByIdAsync(req.params.id)
    .then(handleEntityNotFound(res))
    .then(removeInvitation(res, req.params.invitationId))
    .catch(handleError(res));
}