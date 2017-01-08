const os = require('os');

module.exports = function(statEmitter, threshold) {
    let total = parseInt(os.totalmem());
    let free = parseInt(os.freemem());
    let usedpct = Number(parseFloat(((total - free) / total * 100)).toFixed(2));
    
    if(threshold === 0 || usedpct > threshold) {
        statEmitter.emit('memory', { usedpct: usedpct, total: total, free: free });
    }
}