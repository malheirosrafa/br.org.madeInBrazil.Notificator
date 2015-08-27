'use strict';

var mongoose = require("mongoose");

module.exports = mongoose.model('endPoint', new mongoose.Schema({
    token    : String,
    arn      : String,
    platform : String
  })
);
