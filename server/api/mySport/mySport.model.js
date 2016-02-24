'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var MySportSchema = new mongoose.Schema({
  name: String,
  info: String,
  active: Boolean
});

export default mongoose.model('MySport', MySportSchema);
