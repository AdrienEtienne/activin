import config from '../../config/environment';
import gmaps from './gmaps';
import Prediction from './prediction';

describe('Components: Gmaps', function () {

	beforeEach(function () {
		gmaps.setApiKey(config.googleApi.key);
	})

	describe('getPredictions(input)', function () {
		it('should return an error if no API key', function (done) {
			gmaps.setApiKey('id');
			gmaps.getPredictions().catch(function (err) {
				should.exist(err);
				done();
			});
		});

		it('should return an array of predictions', function (done) {
			gmaps.getPredictions().then(function (predictions) {
				predictions.should.be.instanceOf(Array);
				done();
			});
		});

		it('should return an array of predictions', function (done) {
			gmaps.getPredictions().then(function (predictions) {
				predictions.should.have.length(5);
				for (var i = predictions.length - 1; i >= 0; i--) {
					predictions[i].should.be.instanceOf(Prediction);
				}
				done();
			});
		});

		it('should return an error', function (done) {
			gmaps.getGooglePlace().placeAutocomplete = function (v, cb) {
				cb(new Error('Error'));
			}
			gmaps.getPredictions().catch(function (err) {
				gmaps.setApiKey('id');
				gmaps.setApiKey(config.googleApi.key);
				done();
			});
		});
	});

	describe('getDetails(prediction)', function () {
		var prediction;
		beforeEach(function (done) {
			gmaps.getPredictions().then(function (predictions) {
				prediction = predictions[0];
				done();
			});
		});

		it('should return an error if no API key', function (done) {
			gmaps.setApiKey('id');
			gmaps.getDetails(prediction.getId()).catch(function (err) {
				should.exist(err);
				done();
			});
		});

		it('should return place details', function (done) {
			gmaps.getDetails(prediction.getId()).then(function (detail) {
					should.exist(detail.location);
					done();
				})
				.catch(done);
		});

		it('should return an error', function (done) {
			gmaps.getGooglePlace().getDetails = function (v, cb) {
				cb(new Error('Error'));
			}
			gmaps.getDetails().catch(function (err) {
				gmaps.setApiKey('id');
				gmaps.setApiKey(config.googleApi.key);
				done();
			});
		});
	});
});
