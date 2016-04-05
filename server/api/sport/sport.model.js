'use strict';

var bluebird = require('bluebird');
var mongoose = require('bluebird').promisifyAll(require('mongoose'));
import config from '../../config/environment';

var SportSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true
	}
});

var Sport = mongoose.model('Sport', SportSchema);

bluebird.each(
	config.data.sports,
	function (item, index) {
		return Sport.updateAsync({
			name: config.data.sports[index]
		}, {
			name: config.data.sports[index]
		}, {
			upsert: true
		});
	}
).then(function () {
	console.log('finished populating sports');
	return Sport.removeAsync({
		name: {
			$nin: config.data.sports
		}
	});
})

export default Sport;