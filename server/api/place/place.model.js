'use strict';

var mongoose = require('bluebird').promisifyAll(require('mongoose'));

var PlaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  location: {
    type: [Number],
    index: '2d'
  }
});

export default mongoose.model('Place', PlaceSchema);
