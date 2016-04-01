'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var InvitationSchema = new mongoose.Schema({
	session: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Session',
		required: true
	},
	userInvited: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	byUser: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	state: {
		type: Number
		default: 0
	}
});

export default mongoose.model('Invitation', InvitationSchema);
