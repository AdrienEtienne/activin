'use strict';

var Promise = require('bluebird');
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

Promise.each(
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

// for (var i = config.data.sports.length - 1; i >= 0; i--) {
// 	Sport.updateAsync({
// 		name: config.data.sports[i]
// 	}, {
// 		name: config.data.sports[i]
// 	}, {
// 		upsert: true
// 	});
// }

export default Sport;
