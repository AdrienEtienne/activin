'use strict';

var express = require('express');
import * as auth from '../../auth/auth.service';
import * as searchController from './search.controller';
import * as partnerController from './partner.controller';

var router = express.Router();

router.get('/predictions', searchController.predictions);
router.get('/details', searchController.details);
router.post('/partners', auth.isAuthenticated(), partnerController.index);

module.exports = router;
