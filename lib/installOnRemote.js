const { pack } = require('tar-pack');
const FN = require('fstream-npm');
const { Client } = require('ssh2');
const sshConfig = require('ssh2-config');

const debug = require('debug')('npm-remote-install:installOnRemote');

module.exports = installOnRemote;

function installOnRemote(pkgDir, host, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  options.global = options.g || options.global;
  if (typeof options.sudo === 'undefined') {
    options.sudo = options.global;
  }

  const c = new Client();

  c.on('ready', () => {
    debug('ready');

    c.forwardIn('localhost', 0, (err, port) => {
      if (err) {
        return c.emit('error', err);
      }

      debug("forwardIn port %d", port);

      const cmd = [
        options.sudo ? 'sudo' : '',
        'npm install',
        options.global ? '-g' : '',
        'http://localhost:' + port
      ].join(' ');
      
      debug("exec: %s", cmd);

      c.exec(cmd, { pty: true }, (err, stream) => {
        if (err) {
          return c.emit('error', err);
        }

        debug('run npm on the remote');

        stream.on('close', function(code, signal) {
          debug('close: code=%s, signale=%s', code, signal);
          c.end();
        });

        stream.once('error', function(err) {
          c.emit('error', err);
          stream.end();
        });

        stream.stderr.pipe(process.stderr);
        stream.pipe(process.stdout);
      });
    });
  });

  c.on('tcp connection', (info, accept, reject) => {
    debug('tcp connection');

    const channel = accept();

    channel.on('close', function() {
      debug('close');
    });

    channel.once('data', function(data) {
      debug(data.toString());

      channel.write("HTTP/1.0 200 Ok\n\n");

      pack(FN(pkgDir)).pipe(channel);
    });
  });

  c.once('error', err => {
    callback(err);
    c.end();
  });

  sshConfig({ host: host, preferSsh2: true }, (err, result) => {
    if (err) {
      return callback(err);
    }

    c.connect(result);
  });
}
