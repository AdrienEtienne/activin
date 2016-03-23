'use strict';

import _ from 'lodash';
import gmaps from '../../components/gmaps';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    res.status(statusCode).json(entity);
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Searchs
export function predictions(req, res) {
  var input = req.query.input || '';

  if (input) {
    gmaps.getPredictions(input)
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    handleError(res, 400)(new Error('No input in request parameters'));
  }
}

export function details(req, res) {
  var placeid = req.query.placeid || '';

  if (placeid) {
    gmaps.getDetails(placeid)
      .then(respondWithResult(res))
      .catch(handleError(res));
  } else {
    handleError(res, 400)(new Error('No placeid in request parameters'));
  }
}
