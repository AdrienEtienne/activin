'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var InvitationSchema = new mongoose.Schema({
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
		type: Number,
		default: 0
	}
});

/**
 * Methods
 */
InvitationSchema.methods = {
	setAccepted() {
			this.state = 1;
		},

		setRefused() {
			this.state = 2;
		}
};

export default mongoose.model('Invitation', InvitationSchema);