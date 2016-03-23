'use strict';

import GooglePlaces from 'googleplaces';
import Promise from 'bluebird';
import Prediction from './prediction';
import _ from 'lodash';

var googlePlaces = new GooglePlaces('key', 'json');
var currentKey = null;

var gmaps = {
	setApiKey: function (key) {
		if (currentKey === key) {
			return googlePlaces;
		} else {
			currentKey = key;
			googlePlaces = new GooglePlaces(currentKey, 'json');
			return googlePlaces;
		}
	},

	getGooglePlace: function () {
		return googlePlaces;
	},

	getPredictions: function (input) {
		return new Promise(function (resolve, reject) {
			var parameters = {
				input: input || ''
			};
			googlePlaces.placeAutocomplete(parameters, function (err, response) {
				if (err) {
					return reject(err);
				} else if (response.error_message) {
					return reject(new Error(response.error_message));
				} else {
					var result = [];
					_.forEach(response.predictions, function (prediction) {
						result.push(new Prediction(prediction.place_id, prediction.description));
					});
					resolve(result);
				}
			});
		});
	},

	getDetails: function (placeid) {
		return new Promise(function (resolve, reject) {
			googlePlaces.placeDetailsRequest({
				placeid: placeid
			}, function (err, response) {
				if (err) {
					reject(err);
				} else if (response.error_message) {
					reject(new Error(response.error_message));
				} else {
					resolve({
						name: response.result.name,
						location: response.result.geometry.location
					});
				}
			})
		});
	}
};

module.exports = gmaps;
