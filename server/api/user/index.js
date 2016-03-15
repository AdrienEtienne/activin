'use strict';

import {
  Router
}
from 'express';
import * as controller from './user.controller';
import * as auth from '../../auth/auth.service';

var router = new Router();

router.get('/', auth.hasRole('admin'), controller.index);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);
router.get('/me', auth.isAuthenticated(), controller.me);
router.put('/:id/password', auth.isAuthenticated(), controller.changePassword);
router.get('/:id', auth.isAuthenticated(), controller.show);
router.post('/', controller.create);

router.put('/:id/setLocation', auth.isAuthenticated(), controller.setLocation);
router.put('/:id/addLocation', auth.isAuthenticated(), controller.addLocation);
router.put('/:id/deleteLocation', auth.isAuthenticated(), controller.deleteLocation);

export default router;