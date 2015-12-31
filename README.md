# npm-remote-install

`npm-remote-install` installs your package to a specified host.

## Installation

```
npm install -g npm-remote-install
```

## Usage

CLI:

```
npm-remote-install path/to/your/pkg host
```

## API

### installOnRemote(pkgDir, host, options, callback)

- `pkgDir`
    - A package directory to install on a remote host.
- `host`
    - A remote host to connect with ssh.
- `options.global`
    - A boolean value if a package installs globally.
- `options.sudo`
    - A boolean value if `sudo` has to be used on a remote host.
- `callback(err)`
    - A callback which is called when a package has installed, or an error occurs.

## License

MIT
