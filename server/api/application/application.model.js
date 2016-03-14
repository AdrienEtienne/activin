'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

const platforms = ['android', 'ios', 'windows'];

var ApplicationSchema = new mongoose.Schema({
	version: {
		type: String,
		required: true
	},
	platform: String,
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
});

ApplicationSchema
	.path('version')
	.validate(function (version) {
		if (version.match(/[0-9]{1,2}\.[0-9]{1,2}\.[0-9]{1,2}(\-alpha\.[0-9]{1,3})?/)) {
			return true;
		} else return false;
	}, 'Version not expected');

// Validate platform name
ApplicationSchema
	.path('platform')
	.validate(function (platform) {
		if (platforms.indexOf(platform) !== -1) {
			return true;
		} else return false;
	}, 'Platform not known');

ApplicationSchema
	.pre('save', function preSave(next) {
		this.updatedAt = Date.now();
		next();
	});

export default mongoose.model('Application', ApplicationSchema);
