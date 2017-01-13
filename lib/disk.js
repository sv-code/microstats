const exec = require('child_process').exec; 

switch(process.env.platform) {
    case 'linux': 
    case 'macos':
        module.exports = function(statEmitter, options) {
            let df = "df -Pkl | grep -v Capacity | awk '{ print $1\" \"$2\" \"$3\" \"$4\" \"$5\" \"$6\" \"$7}'";
            exec(df, {stdio:['inherit','pipe','pipe']}, function(err, output, code) {
                if(err) return;

                let drives = output.split('\n');
                drives.forEach(function(drive) {
                    let drivedetails = drive.split(' ');
                    let filesystem = drivedetails[0], total, free, mount;
                    if(!filesystem) return;
                    if(options.diskfilesystems && options.diskfilesystems.indexOf(filesystem) < 0) return;
                       
                    if(isNaN(drivedetails[1])) {
                        total = parseInt(drivedetails[2]); 
                        free = parseInt(drivedetails[4]);
                        mount = drivedetails[6];
                    }
                    else {
                        total = parseInt(drivedetails[1]);
                        free = parseInt(drivedetails[3]);
                        mount = drivedetails[5];
                    }
                    if(options.mounts && options.mounts.indexOf(mount) < 0) return;
                    let usedpct = Number(parseFloat((total - free) / total * 100).toFixed(2));
                    
                    if(!options.threshold || options.threshold === 0 || usedpct > options.threshold) {
                        statEmitter.emit('disk', { filesystem: filesystem, mount: mount, usedpct: usedpct, total: total, free: free });
                    }
                });

            });    
        }
        break;
        
    case 'win': 
        module.exports = function(statEmitter, options) {
            let wmic = 'wmic LOGICALDISK GET Name, Size, FreeSpace /value | findstr "FreeSpace Name Size"';
            exec(wmic, function(err, output, code) {
                if(err) return;
                
                let segments = output.split('\n');
                for(let i=0; i<segments.length; ++i) {
                    if(segments[i].includes('FreeSpace')) {
                        let free = segments[i].split('=')[1].split('\r\r')[0];
                        if(!free) return;
                        
                        free = parseInt(free);
                        let filesystem = segments[i+1].split('=')[1].split('\r\r')[0];
                        if(options.diskfilesystems && options.diskfilesystems.indexOf(filesystem) < 0) return;
                        
                        let total = parseInt(segments[i+2].split('=')[1].split('\r\r')[0]);
                        let usedpct = Number(parseFloat((total - free) / total * 100).toFixed(2));
                        
                        if(!options.threshold || options.threshold === 0 || usedpct > options.threshold) {
                            statEmitter.emit('disk', { filesystem: filesystem, usedpct: usedpct, total: total, free: free });
                        }
                    }
                }
                
            });
        }
        break;
        
    default: 
        //throw('Unsupported platform');
}
