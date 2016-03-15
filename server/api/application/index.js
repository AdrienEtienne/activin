'use strict';

var express = require('express');
import * as controller from './application.controller';
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/:platform', controller.index);
router.get('/:platform/last', controller.show);
router.get('/:platform/download/:id', controller.download);

import multer from 'multer';
var upload = multer({
	dest: '.tmp/uploads/'
})

router.post('/', auth.hasRole('admin'), upload.single('application'), controller.create);
router.put('/:id', auth.hasRole('admin'), controller.update);
router.patch('/:id', auth.hasRole('admin'), controller.update);
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

module.exports = router;
