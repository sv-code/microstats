'use strict';
const EventEmitter = require('events').EventEmitter
    , statEmitter = module.exports = new EventEmitter()
    , optionsparser = require('./optionsparser')
    , stats = require('./lib/stats');

var on = false;

statEmitter.start = function(options, cb) {
    if(!isPlatformSupported()) {
        if(cb && typeof(cb) === 'function') return cb('Platform currently unsupported');
        else return;
    }
    
    let frequency, memusedThreshold = 0, cpuloadThreshold = 0, diskusedThreshold = 0, diskfilesystems, mounts;
    try {
        frequency = optionsparser.getFrequency(options); 
        
        if(options && frequency.mode === 'onalert') {
            memusedThreshold = optionsparser.getMemoryUsedAlertThreshold(options.memoryalert);
            cpuloadThreshold = optionsparser.getCpuLoadAlertThreshold(options.cpualert);
            diskusedThreshold = optionsparser.getDiskUsedAlertThreshold(options.diskalert);
        }
        
        if(options) {
            diskfilesystems = optionsparser.getDiskFilesystems(options.diskalert);
            mounts = optionsparser.getDiskMounts(options.diskalert);
        }
        
        console.log(frequency, memusedThreshold, cpuloadThreshold, diskusedThreshold, diskfilesystems, mounts);
    }
    catch(err) {
        if(cb && typeof(cb) === 'function') return cb(err); 
        else return;
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
    
    if(cb && typeof(cb) === 'function') return cb(null);
    else return;
}

statEmitter.stop = function() {
    on = false;
}

function isPlatformSupported() {
    return process.env.platform !== 'other';
}




