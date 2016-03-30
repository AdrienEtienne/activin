'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var SessionSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true
	},
	sport: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Sport',
		required: true
	},
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	dateStart: {
		type: Date,
		required: true
	},
	dateStop: {
		type: Date
	}
});

export default mongoose.model('Session', SessionSchema);
