'use strict';

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

for (var i = config.data.sports.length - 1; i >= 0; i--) {
	Sport.updateAsync({
		name: config.data.sports[i]
	}, {
		name: config.data.sports[i]
	}, {
		upsert: true
	});
}

export default Sport;
