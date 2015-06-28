var pack = require('tar-pack').pack
var FN = require('fstream-npm');
var Client = require('ssh2').Client;
var sshConfig = require('ssh2-config');
var debug = require('debug')('npm-remote-install:installOnRemote');

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

  var c = new Client();

  c.on('ready', function() {
    debug('ready');

    c.forwardIn('localhost', 0, function(err, port) {
      if (err) {
        return c.emit('error', err);
      }

      debug("forwardIn port %d", port);

      var cmd = [
        options.sudo ? 'sudo' : '',
        'npm install',
        options.global ? '-g' : '',
        'http://localhost:' + port
      ].join(' ');
      
      debug("exec: %s", cmd);

      c.exec(cmd, { pty: true }, function(err, stream) {
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

  c.on('tcp connection', function(info, accept, reject) {
    debug('tcp connection');

    var channel = accept();

    channel.on('close', function() {
      debug('close');
    });

    channel.once('data', function(data) {
      debug(data.toString());

      channel.write("HTTP/1.0 200 Ok\n\n");

      pack(FN(pkgDir)).pipe(channel);
    });
  });

  c.once('error', function(err) {
    callback(err);
    c.end();
  });

  sshConfig({ host: host, preferSsh2: true }, function(err, result) {
    if (err) {
      return callback(err);
    }

    c.connect(result);
  });
}
