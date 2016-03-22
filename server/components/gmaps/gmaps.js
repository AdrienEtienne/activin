'use strict';

import appConfig from '../../config/environment';
import GooglePlaces from 'googleplaces';
import Promise from 'bluebird';
import Prediction from './prediction';
import _ from 'lodash';

var googlePlaces = null;
var currentKey = null;

var gmaps = {
	getGooglePlace: function () {
		if (googlePlaces && currentKey === appConfig.googleApi.key) {
			return googlePlaces;
		} else {
			currentKey = appConfig.googleApi.key;
			googlePlaces = new GooglePlaces(appConfig.googleApi.key, 'json');
			return googlePlaces;
		}
	},

	getPredictions: function (input) {
		return new Promise(function (resolve, reject) {
			var parameters = {
				input: input || ''
			};
			gmaps.getGooglePlace().placeAutocomplete(parameters, function (err, response) {
				if (err) {
					reject(err);
				} else if (response.error_message) {
					reject(new Error(response.error_message));
				} else {
					resolve(_.map(response.predictions, function (result) {
						return new Prediction(result.place_id, result.description);
					}));
				}
			});
		});
	},

	getDetails: function (placeid) {
		return new Promise(function (resolve, reject) {
			gmaps.getGooglePlace().placeDetailsRequest({
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
