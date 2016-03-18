'use strict';

import appConfig from '../../config/environment';
import GooglePlaces from 'googleplaces';
import Promise from 'bluebird';
import _ from 'lodash';

var googlePlaces = new GooglePlaces(appConfig.googleApi.key, 'json');

function isConfigured() {
	return appConfig.googleApi.key === 'id' ? false : true;
}

function catchKeyError() {
	return new Promise(function (resolve, reject) {
		reject(new Error('No key defined!'));
	});
}

var gmaps = {
	isConfigured: isConfigured,

	getPredictions: function (input) {
		if (!isConfigured())
			return catchKeyError();
		else
			return new Promise(function (resolve, reject) {
				var parameters = {
					input: input || ''
				};
				googlePlaces.placeAutocomplete(parameters, function (err, response) {
					if (err) {
						reject(err);
					} else {
						resolve(response.predictions);
					}
				});
			});
	}
};

module.exports = gmaps;
