'use strict';

var express = require('express');
var controller = require('./mySport.controller');
import * as auth from '../../auth/auth.service';

var router = express.Router();

router.get('/mine', auth.isAuthenticated(), controller.mine);
router.post('/select/:sportId', auth.isAuthenticated(), controller.select);
router.post('/unselect/:sportId', auth.isAuthenticated(), controller.unselect);

module.exports = router;
