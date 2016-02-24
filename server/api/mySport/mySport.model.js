'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var MySportSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	sport: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Sport'
	}
});

export default mongoose.model('MySport', MySportSchema);
