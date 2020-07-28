'use strict';

require('dotenv').config();

module.exports = require('./' + (process.env.NODE_ENV === 'development' ? 'src' : 'lib') + '/nodexer.js')(__dirname);