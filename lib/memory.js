'use strict';
const os = require('os');

module.exports = function(statEmitter, options) {
    let total = parseInt(os.totalmem());
    let free = parseInt(os.freemem());
    let usedpct = Number(parseFloat(((total - free) / total * 100)).toFixed(2));
    
    if(!options.threshold || options.threshold === 0 || usedpct > options.threshold) {
        statEmitter.emit('memory', { usedpct: usedpct, total: total, free: free });
    }
}