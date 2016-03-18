'use strict';

import config from '../../config/environment';
import gmaps from './gmaps';

describe('Components: Gmaps', function () {

	describe('isConfigured()', function () {
		var key;
		before(function () {
			key = config.googleApi.key;
		})
		after(function () {
			config.googleApi.key = key;
		})

		it('should not be configured if equal id', function () {
			config.googleApi.key = 'id';
			gmaps.isConfigured().should.equal(false);
		});

		it('should be configured', function () {
			config.googleApi.key = 'true key';
			gmaps.isConfigured().should.equal(true);
		});
	});

	describe('getPredictions()', function () {
		var key;
		before(function () {
			key = config.googleApi.key;
		})
		after(function () {
			config.googleApi.key = key;
		})

		it('should return an array of predictions', function (done) {
			config.googleApi.key = 'true key';
			gmaps.getPredictions().then(function (predictions) {
				predictions.should.be.instanceOf(Array);
				done();
			});
		});

		it('should return an error if no API key', function (done) {
			config.googleApi.key = 'id';
			gmaps.getPredictions().catch(function (err) {
				should.exist(err);
				done();
			});
		});
	});
});
