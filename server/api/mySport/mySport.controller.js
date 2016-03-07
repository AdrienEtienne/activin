/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/mySports/mine              ->  mine
 * POST    /api/mySports              ->  create
 * GET     /api/mySports/:id          ->  show
 * PUT     /api/mySports/:id          ->  update
 * DELETE  /api/mySports/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import Sport from '../sport/sport.model';
import MySport from './mySport.model';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      res.status(statusCode).json(entity);
    }
  };
}

function validationError(res, statusCode) {
  statusCode = statusCode || 422;
  return function (err) {
    res.status(statusCode).json(err);
  }
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

// Gets a list of MySports
export function mine(req, res) {
  var userId = req.user._id;
  MySport.find({
      user: userId
    })
    .populate('sport')
    .execAsync()
    .then((mySports) => {
      var sports = [];
      for (var i = mySports.length - 1; i >= 0; i--) {
        sports.push(mySports[i].sport);
      }
      respondWithResult(res)(sports);
    })
    .catch(handleError(res));
}

// Gets a list of none MySports
export function noneMine(req, res) {
  var userId = req.user._id;
  MySport.findAsync({
      user: userId
    })
    .then((mySports) => {
      var ids = _.pluck(mySports, 'sport');
      Sport
        .findAsync({
          '_id': {
            $nin: ids
          }
        })
        .then(respondWithResult(res))
        .catch(handleError(res));
    })
    .catch(handleError(res));
}

export function select(req, res) {
  var userId = req.user._id;
  var sportId = req.params.sportId;

  Sport.findByIdAsync(sportId)
    .then((sport) => {
      if (!sport) {
        handleEntityNotFound(res)();
      } else {
        MySport.findOneAsync({
            user: userId,
            sport: sportId
          })
          .then((mySport) => {
            if (mySport) {
              respondWithResult(res, 304)(sport);
            } else {
              mySport = new MySport({
                user: userId,
                sport: sportId
              });
              mySport.saveAsync()
                .then(function () {
                  respondWithResult(res)(sport);
                })
                .catch(validationError(res));
            }
          })
          .catch(handleError(res));
      }

    })
    .catch(handleError(res));
}

export function unselect(req, res) {
  var userId = req.user._id;
  var sportId = req.params.sportId;

  MySport.findOneAsync({
      user: userId,
      sport: sportId
    })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
