'use strict';

import GooglePlaces from 'googleplaces';
import Promise from 'bluebird';
import Prediction from './prediction';
import Details from './details';
import geolib from 'geolib';
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
					var name = response.result.name;
					var long = response.result.geometry.location.lng;
					var lat = response.result.geometry.location.lat;
					resolve(new Details(placeid, name, long, lat));
				}
			})
		});
	},

	getDistance: function (lat1, long1, lat2, long2) {
		return geolib.getDistance({
			latitude: lat1,
			longitude: long1
		}, {
			latitude: lat2,
			longitude: long2
		});
	}
};

module.exports = gmaps;
