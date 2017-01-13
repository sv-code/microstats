'use strict'
var microstats = require('.');

microstats.on('memory', function(value) {
    console.log('MEMORY:', value);
});

microstats.on('cpu', function(value) {
   console.log('CPU:', value) 
});

microstats.on('disk', function(value) {
   console.log('DISK:', value) 
});

var options1 = { frequency: 'once' }
var options2 = { frequency: '5s' }
var options3 = { frequency: 'onalert' }
var options4 = {
    frequency: 'onalert',
    memoryalert: { used: '>15%' },
    cpualert: { load: '>30%' },
    diskalert: { //filesystem: 'C:', //filesystems: ['/dev/disk1', '/dev/disk0s4'],
        //mount: '/', //mounts: ['/'],
        used: '>10%'
    }
};

var optionsArray = [ options1, options2, options3, options4 ];
optionsArray.forEach(function(options) {
    console.log('---Testing options:', options,'---')
    microstats.start(options, function(err) {
        if(err) console.log(err);
    });
    
    setTimeout(function(){
        microstats.stop();
    }, 7000);
});

