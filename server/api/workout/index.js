'use strict';

var express = require('express');
import * as auth from '../../auth/auth.service';
import * as controller from './workout.controller';

var router = express.Router();

router.get('/', auth.isAuthenticated(), controller.index);
router.get('/:id', controller.show);
router.get('/:id/invitation', auth.isAuthenticated(), controller.showInvitation);
router.post('/', auth.isAuthenticated(), controller.create);
router.post('/:id/invitation', auth.isAuthenticated(), controller.createInvitation);
router.put('/:id', controller.update);
router.put('/:id/invitation/:invitationId', controller.updateInvitation);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.delete('/:id/invitation/:invitationId', controller.destroyInvitation);

module.exports = router;
