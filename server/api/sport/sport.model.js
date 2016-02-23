'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var SportSchema = new mongoose.Schema({
	name: {
		type: String,
		unique: true,
		required: true
	}
});

export default mongoose.model('Sport', SportSchema);
