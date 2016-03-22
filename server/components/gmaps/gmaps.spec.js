'use strict';

import config from '../../config/environment';
import gmaps from './gmaps';
import Prediction from './prediction';

describe('Components: Gmaps', function () {
	var key;
	before(function () {
		key = config.googleApi.key;
	});

	after(function () {
		config.googleApi.key = key;
	});

	describe('getPredictions(input)', function () {
		it('should return an error if no API key', function (done) {
			config.googleApi.key = 'id';
			gmaps.getPredictions().catch(function (err) {
				should.exist(err);
				done();
			});
		});

		it('should return an array of predictions', function (done) {
			config.googleApi.key = key;
			gmaps.getPredictions().then(function (predictions) {
				predictions.should.be.instanceOf(Array);
				done();
			});
		});

		it('should return an array of predictions', function (done) {
			config.googleApi.key = key;
			gmaps.getPredictions().then(function (predictions) {
				predictions.should.have.length(5);
				for (var i = predictions.length - 1; i >= 0; i--) {
					predictions[i].should.be.instanceOf(Prediction);
				}
				done();
			});
		});
	});

	describe('getDetails(prediction)', function () {
		var prediction;
		before(function (done) {
			gmaps.getPredictions().then(function (predictions) {
				prediction = predictions[0];
				done();
			});
		});

		it('should return an error if no API key', function (done) {
			config.googleApi.key = 'id';
			gmaps.getDetails(prediction.getId()).catch(function (err) {
				should.exist(err);
				config.googleApi.key = key;
				done();
			});
		});

		it('should return place details', function (done) {
			gmaps.getDetails(prediction.getId()).then(function (detail) {
				should.exist(detail.location);
				done();
			});
		});
	});
});
