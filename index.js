const EventEmitter = require('events').EventEmitter
    , statEmitter = module.exports = new EventEmitter()
    , optionsparser = require('./optionsparser')
    , stats = require('./lib/stats');

var on = false;

statEmitter.start = function(options, callback) {
    if(!isPlatformSupported()) {
        return callback('Platform currently unsupported');
    }
    
    let frequency, memusedThreshold = 0, cpuloadThreshold = 0, diskusedThreshold = 0, diskfilesystems, mounts;
    try {
        frequency = optionsparser.getFrequency(options); 
        
        if(frequency.mode === 'onalert') {
            memusedThreshold = optionsparser.getMemoryUsedAlertThreshold(options.memoryalert);
            cpuloadThreshold = optionsparser.getCpuLoadAlertThreshold(options.cpualert);
            diskusedThreshold = optionsparser.getDiskUsedAlertThreshold(options.diskalert);
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
        
        stats.memory(statEmitter, { threshold: memusedThreshold });
        stats.cpu(statEmitter, { threshold: cpuloadThreshold });
        stats.disk(statEmitter, { threshold: diskusedThreshold, diskfilesystems: diskfilesystems, mounts: mounts });
        
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




