const exec = require('child_process').exec; 

switch(process.env.platform) {
    case 'linux': 
        module.exports = function(statEmitter, threshold) {
            let top = 'top -bn1 | grep "%Cpu"';
            exec(top, {stdio:['inherit','pipe','pipe']}, function(err, output, code) {
                if(err) return;

                let segments = output.split(',');
                let userpct = parseFloat(segments[0].split(' ')[2]);
                let syspct = parseFloat(segments[1].split(' ')[2]);
                let idlepct = parseFloat(segments[3].split(' ')[1]);
                let loadpct = Number((userpct + syspct).toFixed(2));
                
                if(threshold === 0 || loadpct > threshold) {
                    statEmitter.emit('cpu', { loadpct: loadpct, userpct: userpct, syspct: syspct, idlepct: idlepct });
                }
            });
        }
        break;
        
    case 'macos':
        module.exports = function(statEmitter, threshold) {
            let top = 'top -l1 | grep "CPU usage"';
            exec(top, {stdio:['inherit','pipe','pipe']}, function(err, output, code) {
                if(err) return;

                let segments = output.split(',');
                let userpct = Number(parseFloat(segments[0].split(' ')[2].split('%')[0]).toFixed(2));
                let syspct = Number(parseFloat(segments[1].split(' ')[1].split('%')[0]).toFixed(2));
                let idlepct = Number(parseFloat(segments[2].split(' ')[1].split('%')[0]).toFixed(2));
                let loadpct = Number((userpct + syspct).toFixed(2));
                
                if(threshold === 0 || loadpct > threshold) {
                    statEmitter.emit('cpu', { loadpct: loadpct, userpct: userpct, syspct: syspct, idlepct: idlepct });
                }
            });
        }
        break;
            
    case 'win':
        module.exports = function(statEmitter, threshold) {
            let wmic = 'wmic cpu get loadpercentage /value | find "Load"';
            exec(wmic, function(err, output, code) {
                if(err) return;
                
                let loadpct = parseFloat(output.split('=')[1].split('\r\r\n')[0]);
                
                if(!isNaN(loadpct) && (threshold === 0 || loadpct > threshold)) {
                    statEmitter.emit('cpu', { loadpct: loadpct });
                }
            });
        }
        break;
            
    default:
        //throw('Unsupported platform');
            
}