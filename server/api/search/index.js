'use strict';

var express = require('express');
var searchController = require('./search.controller');
var partnerController = require('./partner.controller');

var router = express.Router();

router.get('/predictions', searchController.predictions);
router.get('/details', searchController.details);
router.post('/partners', partnerController.index);

module.exports = router;
