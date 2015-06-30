'use strict';

let Node = require('../../app/models').Node;

module.exports = function(factory) {
  factory.define('node', Node, {});

  factory.define('masterNode', Node, {
    master: true,
  });

  factory.define('runningMasterNode', Node, {
    master: true,
    state: 'running'
  });
};