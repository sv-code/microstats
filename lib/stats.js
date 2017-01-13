'use strict';
const platform = process.platform;

if(platform === 'linux') process.env.platform = 'linux';
else if(platform === 'darwin') process.env.platform = 'macos';
else if(platform === 'win32') process.env.platform = 'win';
else process.env.platform = 'other';

module.exports.memory = require('./memory');
module.exports.cpu = require('./cpu');
module.exports.disk = require('./disk');



