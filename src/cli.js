import parseArgs from 'minimist';
import installOnRemote from './installOnRemote';

const debug = require('debug')('npm-remote-install:cli');

module.exports = function() {
  const cliOpts = parseArgs(process.argv.slice(2), {
    boolean: ['global', 'sudo'],
    alias: {
      global: 'g',
    },
  });

  if (cliOpts._.length < 2) {
    showUsage();
    return;
  }
  
  const [pkgDir, host] = cliOpts._;

  installOnRemote(pkgDir, host, cliOpts, err => {
    if (err) {
      throw err;
    }
  });
};

function showUsage() {
  console.log('Usage: npm-remote-install <path/to/pkg> <hostname>');
}
