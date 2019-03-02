var exec = require('child_process').exec;

var archivePluginLog = function() {
    var restartScript = exec('sh /home/dasari_s_sa/archive_scripts/plugin_archive_scripts.sh',
    (error, stdout, stderr) => {
        console.log(stdout, 'Executed Successfully');
        console.log(stderr);
        if (error !== null) {
            console.log('exec error:', error);
        }
    });
}

module.exports = {
    archivePluginLog: archivePluginLog
}