'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

const STATE = {
	UNKNOWN: 0,
	ACCEPTED: 1,
	REFUSED: 2
};

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
		default: STATE.UNKNOWN
	}
});

/**
 * Methods
 */
InvitationSchema.methods = {
	setAccepted() {
			this.state = STATE.ACCEPTED;
		},

		setRefused() {
			this.state = STATE.REFUSED;
		}
};

InvitationSchema.statics = {
	filterState(states) {
		states = states || '';
		var invitationStates = [];
		if (states.indexOf('unknown') !== -1 || states === '') {
			invitationStates.push(STATE.UNKNOWN);
		}
		if (states.indexOf('accepted') !== -1 || states === '') {
			invitationStates.push(STATE.ACCEPTED);
		}
		if (states.indexOf('refused') !== -1 || states === '') {
			invitationStates.push(STATE.REFUSED);
		}
		return invitationStates;
	}
};

export default mongoose.model('Invitation', InvitationSchema);
