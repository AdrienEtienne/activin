'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var LocationSchema = new mongoose.Schema({
	name: {
		type: String,
		require: true
	},
	location: {
		type: [Number],
		index: '2d',
		require: true
	}
});

export default mongoose.model('Location', LocationSchema);
