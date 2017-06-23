const parseArgs = require('minimist');
const installOnRemote = require('./installOnRemote');

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
