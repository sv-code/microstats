const EventEmitter = require('events').EventEmitter
    , statEmitter = module.exports = new EventEmitter()
    , optionsparser = require('./optionsparser')
    , stats = require('./lib/stats');

var on = false;

statEmitter.start = function(options, callback) {
    if(!isPlatformSupported()) {
        return callback('Platform currently unsupported');
    }
    
    let frequency, memusedt, cpuloadt, diskfilesystems, mounts, diskusedt;
    try {
        memusedt = optionsparser.getMemoryUsedAlertThreshold(options.memoryalert);
        cpuloadt = optionsparser.getCpuLoadAlertThreshold(options.cpualert);
        diskfilesystems = optionsparser.getDiskFilesystems(options.diskalert);
        mounts = optionsparser.getDiskMounts(options.diskalert);
        diskusedt = optionsparser.getDiskUsedAlertThreshold(options.diskalert);
        
        if(memusedt > 0 || cpuloadt > 0 || diskusedt > 0) {
            frequency = optionsparser.getFrequency();
        }
        else {
            frequency = optionsparser.getFrequency(options);        
        }
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
        
        try {
            stats.memory(statEmitter, memusedt);
        }
        catch(err) {
            console.log('mem-error:',err);    
        }
        
        try {
            stats.cpu(statEmitter, cpuloadt);
        }
        catch(err) {
            console.log('cpu-error:',err);
        }
        try {
            stats.disk(statEmitter, diskfilesystems, mounts, diskusedt);
        }
        catch(err) {
            console.log('disk-error:',err);
        }
    }, frequency);
    
    return callback(null);
}

statEmitter.stop = function() {
    on = false;
}

function isPlatformSupported() {
    return process.env.platform !== 'other';
}




