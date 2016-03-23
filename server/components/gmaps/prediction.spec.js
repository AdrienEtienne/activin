'use strict';

import Prediction from './prediction';

describe('Components: Gmaps.Prediction', function () {
	var prediction;

	beforeEach(function () {
		prediction = new Prediction('id', 'description');
	})

	describe('getId()', function () {
		it('should return the placeid', function () {
			prediction.getId().should.equal(prediction.placeid);
		})
	});

	describe('getDescription()', function () {
		it('should return the description', function () {
			prediction.getDescription().should.equal(prediction.description);
		})
	});
});
