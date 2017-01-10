const EventEmitter = require('events').EventEmitter
    , statEmitter = module.exports = new EventEmitter()
    , optionsparser = require('./optionsparser')
    , stats = require('./lib/stats');

var on = false;

statEmitter.start = function(options, callback) {
    if(!isPlatformSupported()) {
        return callback('Platform currently unsupported');
    }
    
    let frequency, memusedt = 0, cpuloadt = 0, diskusedt = 0, diskfilesystems, mounts;
    try {
        frequency = optionsparser.getFrequency(options); 
        console.log('frequency', frequency);
        
        if(frequency.mode !== 'time') {
            memusedt = optionsparser.getMemoryUsedAlertThreshold(options.memoryalert);
            cpuloadt = optionsparser.getCpuLoadAlertThreshold(options.cpualert);
            diskusedt = optionsparser.getDiskUsedAlertThreshold(options.diskalert);
        }
        
        diskfilesystems = optionsparser.getDiskFilesystems(options.diskalert);
        mounts = optionsparser.getDiskMounts(options.diskalert);    
    }
    catch(err) {
        return callback(err);    
    }
    
    on = true;
    var check = setInterval(function() {
        if(!on) {
            clearInterval(check);
            return;
        }
        
        stats.memory(statEmitter, memusedt);
        stats.cpu(statEmitter, cpuloadt);
        stats.disk(statEmitter, diskfilesystems, mounts, diskusedt);
        
        if(frequency.mode === 'once') {
            clearInterval(check);
        }
        
    }, frequency.interval);
    
    return callback(null);
}

statEmitter.stop = function() {
    on = false;
}

function isPlatformSupported() {
    return process.env.platform !== 'other';
}




