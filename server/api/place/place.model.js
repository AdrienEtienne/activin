'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true
  },
  location: {
    type: [Number],
    index: '2d'
  }
});

export default mongoose.model('Place', PlaceSchema);