var parseArgs = require('minimist');
var installOnRemote = require('./installOnRemote');
var debug = require('debug')('npm-remote-install:cli');

module.exports = function() {
  var cliOpts = parseArgs(process.argv.slice(2), {
    boolean: ['global', 'sudo'],
    alias: {
      global: 'g',
    },
  });

  if (cliOpts._.length < 2) {
    showUsage();
    return;
  }
  
  var pkgDir = cliOpts._[0];
  var host = cliOpts._[1];

  installOnRemote(pkgDir, host, cliOpts, function(err) {
    if (err) {
      throw err;
    }
  });
};

function showUsage() {
  console.log('Usage: npm-remote-install <path/to/pkg> <hostname>');
}
